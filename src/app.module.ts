import { CacheModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EthersModule } from 'nestjs-ethers';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    EthersModule.forRoot({
      cloudflare: true,
      quorum: 1,
      useDefaultProvider: false,
      etherscan: process.env.ETHERSCAN_API_KEY,
    }),
    CacheModule.register({
      store: redisStore,
      host: process.env.REDISHOST,
      port: process.env.REDISPORT,
      user: process.env.REDISUSER,
      password: process.env.REDISPASSWORD,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
