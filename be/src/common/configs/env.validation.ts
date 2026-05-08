import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsString,
  validateSync,
  IsOptional,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  PORT: number;

  @IsString()
  DATABASE_HOST: string;

  @IsNumber()
  DATABASE_PORT: number;

  @IsString()
  DATABASE_USER: string;

  @IsString()
  DATABASE_PASSWORD: string;

  @IsString()
  DATABASE_NAME: string;

  @IsOptional()
  @IsString()
  DATABASE_SSL: string;

  @IsString()
  JWT_ACCESS_SECRET: string;

  @IsString()
  JWT_REFRESH_SECRET: string;

  @IsString()
  JWT_ACCESS_EXPIRES_IN: string;

  @IsString()
  JWT_REFRESH_EXPIRES_IN: string;

  @IsString()
  CORS_ORIGIN: string;

  @IsString()
  CLOUDINARY_CLOUD_NAME: string;

  @IsString()
  CLOUDINARY_KEY: string;

  @IsString()
  CLOUDINARY_SECRET: string;

  @IsString()
  VNPAY_SECURE_SECRET: string;

  @IsString()
  VNPAY_TMN_CODE: string;

  @IsString()
  VNPAY_RETURN_URL: string;

  @IsString()
  MOMO_PARTNER_CODE: string;

  @IsString()
  MOMO_ACCESS_KEY: string;

  @IsString()
  MOMO_SECRET_KEY: string;

  @IsString()
  MOMO_REDIRECT_URL: string;

  @IsString()
  MOMO_IPN_URL: string;

  @IsOptional()
  @IsString()
  COOKIE_DOMAIN: string;

  @IsOptional()
  @IsString()
  GOOGLE_API_KEY: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
