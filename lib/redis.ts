import { createClient } from 'redis';

const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

// Connect to Redis
redis.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redis.on('connect', () => {
  console.log('Connected to Redis');
});

// Initialize connection
if (!redis.isOpen) {
  redis.connect().catch(console.error);
}

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