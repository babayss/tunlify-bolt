import { Redis } from 'redis';

const redis = new Redis({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

export default redis;

export const cacheKeys = {
  landingContent: (lang: string) => `landing:${lang}`,
  pricingContent: (lang: string) => `pricing:${lang}`,
  serverLocations: 'server_locations',
};

export const cacheTTL = {
  content: 3600, // 1 hour
  locations: 86400, // 24 hours
};