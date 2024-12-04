import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

// Helper to determine the environment
const isCloudflare = typeof globalThis.fetch !== 'undefined';

export const env = createEnv({
  server: {
    PGLITE: z
      .string()
      .default('true')
      .transform((v) => v === 'true'),
    DATABASE_URL: z.string().url().default("postgres://postgres:postgres@0.0.0.0:5432/postgres"),
    NODE_ENV: z.union([z.literal('development'), z.literal('production'), z.literal('test')]).default("development"),
    PORT: z.string().optional(),
    UNSUBSCRIBE_TOKEN_SECRET: z.string().default('secret'),

    ARGON_SECRET: z.string().default('secret'),
    REMOTE_SYSTEM_ACCESS_IP: z.string().default("*"),

    NOVU_API_KEY: z.string().optional(),
    NOVU_SUB_ID: z.string().optional(),
    NOVU_SLACK_WEBHOOK: z.string().optional(),

    SEND_ALL_TO_EMAIL: z.string().optional(),
    SENDGRID_API_KEY: z.string().optional(),

    PADDLE_API_KEY: z.string().optional(),
    PADDLE_WEBHOOK_KEY: z.string().optional(),

    LOGTAIL_TOKEN: z.string().optional(),

    GITHUB_CLIENT_ID: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    MICROSOFT_TENANT_ID: z.string().optional(),
    MICROSOFT_CLIENT_ID: z.string().optional(),
    MICROSOFT_CLIENT_SECRET: z.string().optional(),

    AWS_S3_UPLOAD_ACCESS_KEY_ID: z.string().default(''),
    AWS_S3_UPLOAD_SECRET_ACCESS_KEY: z.string().default(''),
    AWS_CLOUDFRONT_KEY_ID: z.string().default(''),
    AWS_CLOUDFRONT_PRIVATE_KEY: z.string().default(''),
    TUS_UPLOAD_API_SECRET: z.string().default('very_secret'),
  },
  runtimeEnv: isCloudflare
    ? // Cloudflare Workers pass environment variables via the `env` parameter
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      (globalThis as any).ENV
    : // For Node.js, use `process.env`
      process.env,
  emptyStringAsUndefined: true,
});
