import { z } from 'zod';

const isServer = typeof window === 'undefined';

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
  GOOGLE_CLIENT_ID: isServer ? z.string().min(1) : z.string().optional(),
  GOOGLE_CLIENT_SECRET: isServer ? z.string().min(1) : z.string().optional(),
  NEXTAUTH_URL: isServer ? z.string().url() : z.string().optional(),
  NEXTAUTH_SECRET: isServer ? z.string().min(1) : z.string().optional(),
  FACEBOOK_CLIENT_ID: isServer ? z.string().min(1) : z.string().optional(),
  FACEBOOK_CLIENT_SECRET: isServer ? z.string().min(1) : z.string().optional(),
});

const _env = envSchema.safeParse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  FACEBOOK_CLIENT_ID: process.env.FACEBOOK_CLIENT_ID,
  FACEBOOK_CLIENT_SECRET: process.env.FACEBOOK_CLIENT_SECRET,
});

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  throw new Error('Invalid environment variables');
}

export const env = _env.data;
