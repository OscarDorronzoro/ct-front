import {
  execFileSync, spawn, spawnSync, type ChildProcess,
} from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import https from 'node:https';
import os from 'node:os';
import path from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';

// The stack of the e2e tests:
// 1. PostgreSQL + PostGIS in Docker (the version of production), with the schema of production,
//    the reference data and deploy.sql of ../backend (data in memory: nothing on the disk)
// 2. The backend of ../backend against it, with only the jobs the tests use. It writes nothing in
//    ../backend: logs, images and firmware go to a temporary folder, and Babel's cache is off.
// 3. This app built and served by `vite preview` (https, the API through its proxy, as in production)

const FRONTEND_DIR = path.resolve(import.meta.dirname, '..');
const BACKEND_DIR = path.resolve(FRONTEND_DIR, '../backend');
const SQL_FILES = ['schema.sql', 'reference-data.sql', 'deploy.sql'];

const IMAGE = 'postgis/postgis:18-3.6';
const LABEL = 'cattle-e2e-tests';
const CONTAINER = `cattle-e2e-${process.pid}`;
const DATABASE = 'cattle';
const ADMIN_PASSWORD = 'e2e-admin';
const APP_PASSWORD = 'e2e-app';
const API_PORT = 3100;
const APP_PORT = 5174;

const docker = (...args: string[]) => execFileSync('docker', args, { encoding: 'utf8' }).trim();
const PSQL = ['psql', '-U', 'postgres', '-d', DATABASE, '-v', 'ON_ERROR_STOP=1', '-q'];
const psql = (...args: string[]) => docker('exec', CONTAINER, ...PSQL, ...args);

// Leftovers of an interrupted run
function removeLeftovers() {
  const ids = docker('ps', '-aq', '--filter', `label=${LABEL}`);
  if (ids) {
    docker('rm', '-f', '-v', ...ids.split('\n'));
  }
}

// The image starts a temporary server to create the database, then the real one
async function waitForDatabase(attempts = 120): Promise<void> {
  const { stdout, stderr } = spawnSync('docker', ['logs', CONTAINER], { encoding: 'utf8' });
  const ready = (stdout + stderr).match(/database system is ready to accept connections/g) ?? [];

  if (ready.length >= 2) {
    return undefined;
  }
  if (attempts === 0) {
    throw new Error('The e2e database did not start');
  }
  await sleep(500);
  return waitForDatabase(attempts - 1);
}

function startDatabase() {
  removeLeftovers();
  docker(
    'run', '-d', '--label', LABEL, '--name', CONTAINER,
    '-e', `POSTGRES_PASSWORD=${ADMIN_PASSWORD}`, '-e', `POSTGRES_DB=${DATABASE}`,
    '--tmpfs', '/var/lib/postgresql', '-p', '127.0.0.1::5432', IMAGE,
  );
}

function loadSchema() {
  psql('-c', `CREATE ROLE ctapp LOGIN PASSWORD '${APP_PASSWORD}'`);
  SQL_FILES.forEach((file) => {
    docker('cp', path.join(BACKEND_DIR, 'db_restore', file), `${CONTAINER}:/tmp/${file}`);
    psql('-o', '/dev/null', '-f', `/tmp/${file}`);
  });
  return docker('port', CONTAINER, '5432/tcp').split(':').pop() as string;
}

// Whether a server answers at the url (any status). The certificate of the app is self-signed.
function answers(url: string) {
  const get = url.startsWith('https') ? https.get : http.get;

  return new Promise<boolean>((resolve) => {
    get(url, { rejectUnauthorized: false }, (res) => {
      res.resume();
      resolve(true);
    }).on('error', () => resolve(false));
  });
}

async function waitForUrl(url: string, attempts = 120): Promise<void> {
  const up = await answers(url);

  if (up) {
    return undefined;
  }
  if (attempts === 0) {
    throw new Error(`${url} did not start`);
  }
  await sleep(500);
  return waitForUrl(url, attempts - 1);
}

// A long-running process in its own group (to stop it with its children), output to a log file
function startProcess(command: string, args: string[], options: { cwd: string; env: object; log: string }) {
  const out = fs.openSync(options.log, 'w');
  return spawn(command, args, {
    cwd: options.cwd,
    env: { ...process.env, ...options.env },
    stdio: ['ignore', out, out],
    detached: true,
  });
}

function stop(child: ChildProcess | undefined) {
  if (child?.pid) {
    try {
      process.kill(-child.pid, 'SIGTERM');
    } catch {
      // Already finished
    }
  }
}

export default async function globalSetup() {
  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cattle-e2e-'));
  let dbPort = '';
  let backend: ChildProcess | undefined;
  let preview: ChildProcess | undefined;

  const teardown = async () => {
    stop(preview);
    stop(backend);
    docker('rm', '-f', '-v', CONTAINER);
    fs.rmSync(workDir, { recursive: true, force: true });
  };

  try {
    startDatabase();
    await waitForDatabase();
    dbPort = loadSchema();

    backend = startProcess('npx', ['babel-node', 'src/bootstrap.js'], {
      cwd: BACKEND_DIR,
      log: path.join(workDir, 'backend.log'),
      env: {
        PORT: String(API_PORT),
        HOST: '127.0.0.1',
        DB_HOST: '127.0.0.1',
        DB_PORT: dbPort,
        DB_NAME: DATABASE,
        DB_USERNAME: 'ctapp',
        DB_PASSWORD: APP_PASSWORD,
        JWT_SECRET: 'e2e-secret',
        LOG_ROOT: workDir,
        IMAGE_ROOT: path.join(workDir, 'images'),
        FIRMWARE_ROOT: path.join(workDir, 'firmware'),
        JOBS: 'processPendingMessages',
        // Set empty: the .env of ../backend doesn't fill them (no push, no satellite)
        VAPID_PUBLIC_KEY: '',
        VAPID_PRIVATE_KEY: '',
        COPERNICUS_CLIENT_ID: '',
        COPERNICUS_CLIENT_SECRET: '',
        BABEL_DISABLE_CACHE: '1',
      },
    });

    execFileSync('npx', ['vite', 'build'], { cwd: FRONTEND_DIR, stdio: 'pipe' });
    preview = startProcess('npx', ['vite', 'preview', '--port', String(APP_PORT), '--strictPort'], {
      cwd: FRONTEND_DIR,
      log: path.join(workDir, 'preview.log'),
      env: { API_PROXY_TARGET: `http://127.0.0.1:${API_PORT}` },
    });

    await waitForUrl(`http://127.0.0.1:${API_PORT}/api/auth/me`);
    await waitForUrl(`https://localhost:${APP_PORT}/`);
  } catch (err) {
    const logs = ['backend.log', 'preview.log']
      .map((file) => path.join(workDir, file))
      .filter((file) => fs.existsSync(file))
      .map((file) => `--- ${path.basename(file)}\n${fs.readFileSync(file, 'utf8').slice(-3000)}`);
    await teardown();
    throw new Error(`${(err as Error).message}\n${logs.join('\n')}`);
  }

  // For the tests: the database as superuser (to empty it between tests)
  process.env.E2E_DB_ADMIN_URL = `postgres://postgres:${ADMIN_PASSWORD}@127.0.0.1:${dbPort}/${DATABASE}`;

  return teardown;
}
