import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VersioningType, ConsoleLogger, ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './global/http-exception.filter';
import { TransformInterceptor } from './global/transform.interceptor';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
async function bootstrap() {
  // this will toggle JSON based logging depending on whether the app is running on production or not
  const isProduction = process.env.NODE_ENV === 'production';
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: isProduction
      ? new ConsoleLogger({ json: true })
      : ['debug', 'error', 'fatal', 'log', 'verbose', 'warn'],
  });
  app.use(cookieParser());
  if (isProduction) {
    app.enableShutdownHooks();
  }

  app.use(helmet());
  app.getHttpAdapter().getInstance().set('trust proxy', 'loopback, linklocal');
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  console.log('DB URL:', process.env.DATABASE_URL ? 'SET' : 'MISSING');
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  app.enableCors({
    origin: ['https://naijpoll.netlify.app'],
    credentials: true, //will enable the permitted frontend apps to send access toekn via authorization headers
  });

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
}
bootstrap().catch((err) => {
  console.error('Error during bootstrap:', err);
  process.exit(1);
});
