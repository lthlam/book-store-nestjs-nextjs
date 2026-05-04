import { env } from '@/env';

export const API_URL =
  typeof window !== 'undefined'
    ? '/api/backend'
    : env.NEXT_PUBLIC_API_URL;
