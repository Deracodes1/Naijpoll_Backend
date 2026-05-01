import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
  if (process.env.NODE_ENV === 'production') {
    app.enableShutdownHooks();
  }

  // this will enable global versioning in our nest js application.
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
}
bootstrap().catch((err) => {
  console.error('Error during bootstrap:', err);
  process.exit(1);
});
