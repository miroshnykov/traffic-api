import IORedis from 'ioredis';
import * as dotenv from 'dotenv';

dotenv.config();

export type RedisSentinel = { host: string; port: number };
export type RedisClientOptions = {
  host?: string;
  port?: number;
  url?: string;
  password?: string;
  sentinelPassword?: string;
  sentinels?: Array<RedisSentinel>;
  name?: string
};

export class RedisHelper {
  static createClient = (conf: RedisClientOptions): any => new IORedis(conf);

  static readOptions = (): RedisClientOptions => {
    let sentinels: Array<RedisSentinel> | undefined;
    let name: string | undefined;
    if (process.env.REDIS_SENTINELS) {
      sentinels = process.env.REDIS_SENTINELS.split(',').map((hostPort) => {
        const [host, port = '26379'] = hostPort.split(':');
        return { host, port: parseInt(port, 10) };
      });
      if (!process.env.REDIS_SENTINEL_MASTER) {
        throw new Error('process.env.REDIS_SENTINEL_MASTER must be set');
      }
      name = process.env.REDIS_SENTINEL_MASTER;
    }

    return {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : undefined,
      url: process.env.REDIS_URL,
      password: process.env.REDIS_PASSWORD,
      sentinelPassword: process.env.REDIS_SENTINEL_PASSWORD,
      sentinels,
      name,
    };
  };
}
