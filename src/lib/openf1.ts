import Redis from "ioredis";

const BASE_URL = "https://api.openf1.org/v1";
const memoryCache = new Map<string, { value: unknown; expires: number }>();
let redis: Redis | null = null;

function getRedis() {
  if (!process.env.REDIS_URL) return null;
  redis ??= new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: 1, lazyConnect: true });
  return redis;
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function openF1Fetch<T>(path: string, ttlSeconds = 300): Promise<T> {
  const key = `openf1:${path}`;
  const now = Date.now();
  const cached = memoryCache.get(key);
  if (cached && cached.expires > now) return cached.value as T;

  const redisClient = getRedis();
  if (redisClient) {
    try {
      const cachedRedis = await redisClient.get(key);
      if (cachedRedis) return JSON.parse(cachedRedis) as T;
    } catch {
      // Redis is optional in local development.
    }
  }

  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(`${BASE_URL}${path}`, {
        next: { revalidate: ttlSeconds },
        headers: { accept: "application/json" },
      });
      if (!response.ok) throw new Error(`Race data service ${response.status}`);
      const value = (await response.json()) as T;
      memoryCache.set(key, { value, expires: now + ttlSeconds * 1000 });
      if (redisClient) {
        try {
          await redisClient.set(key, JSON.stringify(value), "EX", ttlSeconds);
        } catch {}
      }
      return value;
    } catch (error) {
      lastError = error;
      await sleep(250 * (attempt + 1));
    }
  }
  throw lastError;
}

export type OpenF1Session = {
  session_key: number;
  meeting_key: number;
  session_name: string;
  session_type: string;
  location: string;
  country_name: string;
  circuit_short_name: string;
  date_start: string;
  date_end: string;
};

export async function getLatestSessions() {
  return openF1Fetch<OpenF1Session[]>("/sessions?year=2026", 600);
}
