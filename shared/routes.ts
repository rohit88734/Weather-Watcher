import { z } from 'zod';
import { insertLocationSchema, locations } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  locations: {
    list: {
      method: 'GET' as const,
      path: '/api/locations',
      responses: {
        200: z.array(z.custom<typeof locations.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/locations',
      input: insertLocationSchema,
      responses: {
        201: z.custom<typeof locations.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/locations/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
    search: {
      method: 'GET' as const,
      path: '/api/locations/search',
      input: z.object({ query: z.string() }),
      responses: {
        200: z.array(z.object({
          name: z.string(),
          latitude: z.number(),
          longitude: z.number(),
          country: z.string().optional(),
          admin1: z.string().optional(),
        })),
      },
    }
  },
  weather: {
    get: {
      method: 'GET' as const,
      path: '/api/weather/:id',
      responses: {
        200: z.object({
          temperature: z.number(),
          weatherCode: z.number(),
          windSpeed: z.number(),
          humidity: z.number(),
          condition: z.string(),
          isDay: z.number(),
        }),
        404: errorSchemas.notFound,
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
