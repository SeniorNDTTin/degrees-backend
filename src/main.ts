import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';

import { AppModule } from './app.module';
import { ResponseInterceptor } from './interceptors/response-mapping.interceptor';
import benchBcrypt from './scripts/bench-bcrypt';
import benchHS256 from './scripts/bench-sha256';
import benchRS256 from './scripts/bench-rs256';
import benchSCRAMSHA1 from './scripts/bench-scram-sha-1';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // test algorithms
  // await benchBcrypt();
  // await benchHS256();
  // await benchRS256();
  await benchSCRAMSHA1();

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
