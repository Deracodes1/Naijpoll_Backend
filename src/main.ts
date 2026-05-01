import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VersioningType, ConsoleLogger } from '@nestjs/common';
import { AllExceptionsFilter } from './global/http-exception.filter';
import { TransformInterceptor } from './global/transform.interceptor';
import helmet from 'helmet';
async function bootstrap() {
  // this will toggle JSON based logging depending on whether the app is running on production or not
  const isProduction = process.env.NODE_ENV === 'production';
  const app = await NestFactory.create(AppModule, {
    logger: isProduction
      ? new ConsoleLogger({ json: true })
      : ['debug', 'error', 'fatal', 'log', 'verbose', 'warn'],
  });

  if (isProduction) {
    app.enableShutdownHooks();
  }

  app.use(helmet);
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
}
bootstrap().catch((err) => {
  console.error('Error during bootstrap:', err);
  process.exit(1);
});
