import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // Import ConfigModule
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { OrdersModule } from './orders/orders.module';
import { EmailModule } from './email/email.module';
import { CakesModule } from './cakes/cakes.module';
import { CartModule } from './carts/cart.module';

@Module({
  imports: [
    ConfigModule.forRoot({ // Configure ConfigModule
      envFilePath: '../.env', // Specify the path to the .env file
      isGlobal: true, // Make ConfigModule available globally
    }),
    AuthModule,
    UsersModule,
    OrdersModule,
    EmailModule,
    CakesModule,
    CartModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
