import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';

import { AppModule } from './app.module';
import { ResponseInterceptor } from './interceptors/response-mapping.interceptor';
import benchDesCrypt from './scripts/bench-unix';
import benchPBKDF2LowRounds from './scripts/bench-pbkdf2';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // test algorithms
  // await benchHS256();
  // await benchRS256();
  // await benchBcrypt();
  // await benchHmacSha1();
  // await benchHmacMd5();
  // await benchRsaSha1();
  await benchDesCrypt();
  // await benchPBKDF2LowRounds();

  // cors
  app.enableCors();

  // validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // interceptor
  app.useGlobalInterceptors(new ResponseInterceptor());

  // versioning
  app.enableVersioning({
    type: VersioningType.URI,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
