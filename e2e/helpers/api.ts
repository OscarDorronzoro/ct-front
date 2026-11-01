import { expect, type APIRequestContext } from '@playwright/test';
import { PASSWORD } from './database';

// [lat, lon] as the API takes them
export type Points = [number, number][];

export const square = (lat: number, lon: number, half: number): Points => [
  [lat - half, lon - half],
  [lat - half, lon + half],
  [lat + half, lon + half],
  [lat + half, lon - half],
];

// What the backend checks of a firmware: the first byte of an ESP image
export const FIRMWARE_IMAGE = Buffer.from([0xe9, 1, 2, 3]);

// What a test prepares through the API, logged in as admin (faster and steadier than through the
// screens it isn't testing)
export class Api {
  constructor(private readonly request: APIRequestContext) {}

  private async send(method: 'post' | 'put', url: string, data: object) {
    const res = await this.request[method](url, { data });
    expect(res.ok(), `${method} ${url}: ${res.status()} ${await res.text()}`).toBe(true);
    return res.status() === 204 ? null : res.json();
  }

  async login(username = 'admin') {
    await this.send('post', '/api/auth/login', { username, password: PASSWORD });
  }

  async createUser(username: string, roles: string[]) {
    return (await this.send('post', '/api/users', { username, password: PASSWORD, roles })).user;
  }

  async createCollar(code: number, description = `Collar ${code}`) {
    return (await this.send('post', '/api/collars', { code, description })).collar;
  }

  async createGroup(name: string) {
    return (await this.send('post', '/api/groups', { name })).group;
  }

  async createZone(name: string, zoneTypeId: number, points: Points) {
    return (await this.send('post', '/api/zones', { name, zoneTypeId, points })).zone;
  }

  async createCow(values: object) {
    return (await this.send('post', '/api/cows', values)).cow;
  }

  async categories(): Promise<{ id: number; name: string; sex: string }[]> {
    return (await this.request.get('/api/categories')).json();
  }

  async uploadFirmware(code: number, version: string) {
    const res = await this.request.post('/api/firmwares', {
      multipart: {
        code: String(code),
        version,
        file: { name: 'collar.bin', mimeType: 'application/octet-stream', buffer: FIRMWARE_IMAGE },
      },
    });
    expect(res.ok(), await res.text()).toBe(true);
  }

  // The gateway reports the result of the commands it was handed
  async reportResults(apiKey: string, results: { id: number; result: string }[]) {
    const res = await this.request.post('/api/rf/commands/results', {
      data: { results },
      headers: { 'X-API-Key': apiKey },
    });
    expect(res.ok(), await res.text()).toBe(true);
  }

  // A message of a collar, as the gateway sends it
  async sendMessage(apiKey: string, message: object) {
    const res = await this.request.post('/api/rf', { data: message, headers: { 'X-API-Key': apiKey } });
    expect(res.status()).toBe(202);
    return res.json();
  }
}
