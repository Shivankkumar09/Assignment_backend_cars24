import { config as loadDotenv } from 'dotenv';
import { z } from 'zod';

// Ensure dotenv loads before parsing process.env
loadDotenv();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  DATABASE_PATH: z.string().min(1).default('./data/cars24_ops.db'),
  // Transform empty strings ("") into undefined so fallback works correctly
  GEMINI_API_KEY: z
    .string()
    .trim()
    .transform((val) => (val === '' ? undefined : val))
    .optional(),
  GOOGLE_API_KEY: z
    .string()
    .trim()
    .transform((val) => (val === '' ? undefined : val))
    .optional(),
  GEMINI_MODEL: z.string().min(1).default('gemini-2.5-flash'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
  throw new Error(`Invalid environment configuration: ${issues}`);
}

const geminiApiKey = parsed.data.GEMINI_API_KEY ?? parsed.data.GOOGLE_API_KEY ?? '';

export const env = {
  nodeEnv: parsed.data.NODE_ENV,
  port: parsed.data.PORT,
  logLevel: parsed.data.LOG_LEVEL,
  databasePath: parsed.data.DATABASE_PATH,
  geminiApiKey,
  geminiModel: parsed.data.GEMINI_MODEL,
  isProduction: parsed.data.NODE_ENV === 'production',
} as const;

export function assertGeminiConfigured(): void {
  if (!env.geminiApiKey) {
    throw new Error(
      'GEMINI_API_KEY (or GOOGLE_API_KEY) is required. Please set a valid key in your .env file.',
    );
  }
}