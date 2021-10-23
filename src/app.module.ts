import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {GraphQLModule} from '@nestjs/graphql';
import {TypeOrmModule} from '@nestjs/typeorm';
import {join} from 'path';
import {BullModule} from '@nestjs/bull';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {databaseConfigService} from './config/database-config-service/database-config-service.service';
import {UserModule} from './user/user.module';
import {AuthModule} from './auth/auth.module';
import {RedisCacheModule} from './redis-cache/redis-cache.module';
import {EmailModule} from './email/email.module';
import {SchedulerModule} from './scheduler/scheduler.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfigService),
    ConfigModule.forRoot({isGlobal: true}),
    UserModule,
    GraphQLModule.forRoot({
      installSubscriptionHandlers: true,
      introspection: true,
      playground: true,
      fieldResolverEnhancers: ['guards'],
      autoSchemaFile: join(process.cwd(), 'src/schema.graphql'),
    }),
    AuthModule,
    RedisCacheModule,
    EmailModule,
    SchedulerModule,
    BullModule.forRoot({
      redis: {
        host: 'redis',
        port: 6379,
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
// eslint-disable-next-line import/prefer-default-export
export class AppModule {}
