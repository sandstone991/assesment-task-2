import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UtilsModule } from '../shared/utils/utils.module';
import { UsersModule } from '../users/users.module';

import { LoginModule } from './login/login.module';
import { RegisterModule } from './register/register.module';

@Module({
  imports: [
    LoginModule,
    RegisterModule,
    UsersModule,
    UtilsModule,
  ],
  providers: [JwtService],
})
export class IamModule {}
