import crypto from 'node:crypto';
import pg from 'pg';

let pool: pg.Pool | undefined;

// As superuser (global-setup): the app's user can't empty tables
const db = () => {
  pool ??= new pg.Pool({ connectionString: process.env.E2E_DB_ADMIN_URL, max: 2 });
  return pool;
};

export async function query<T extends pg.QueryResultRow = Record<string, unknown>>(
  text: string,
  params: unknown[] = [],
) {
  const { rows } = await db().query<T>(text, params);
  return rows;
}

export const PASSWORD = 'e2e-password';
// bcrypt of PASSWORD (cost 4: fast; the backend accepts any cost)
const PASSWORD_HASH = '$2b$04$AwQolFdjT/a1vw/olJpjZ.ZVpgcrV2r0SAlPyouSGHBRxZDXO7tV6';

// Reference data (reference-data.sql, deploy.sql): kept between tests
const KEEP = ['event_types', 'zone_types', 'invalid_reasons', 'categories', 'products',
  'spatial_ref_sys', 'notification_cursor'];

// Empty tables and the first admin (the API needs one to create everything else)
export async function resetDatabase() {
  const tables = await query<{ name: string }>(
    `SELECT format('%I.%I', schemaname, tablename) AS name
     FROM pg_tables
     WHERE schemaname IN ('public', 'dw') AND tablename <> ALL($1)`,
    [KEEP],
  );

  await query(`TRUNCATE ${tables.map((t) => t.name).join(', ')} RESTART IDENTITY CASCADE`);
  await query('UPDATE notification_cursor SET last_event_id = 0');

  const [admin] = await query<{ id: number }>(
    "INSERT INTO users (username, password) VALUES ('admin', $1) RETURNING id",
    [PASSWORD_HASH],
  );
  await query("INSERT INTO user_roles (user_id, role) VALUES ($1, 'admin')", [admin.id]);
}

// A gateway and its API key (only its hash is stored)
export async function createGateway() {
  const apiKey = `gw_e2e_${crypto.randomUUID()}`;
  const hash = crypto.createHash('sha256').update(apiKey).digest('hex');
  await query('INSERT INTO gateways (description, api_key_hash) VALUES ($1, $2)', ['e2e', hash]);
  return apiKey;
}
