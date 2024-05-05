import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { startNacos } from './nacos';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.TCP,
    options: {
      port: 4000,
    },
  });

  startNacos({
    ip: 'localhost',
    port: 4000,
    serverName: 'ms_aaa',
  });

  await app.listen();
}
bootstrap();
