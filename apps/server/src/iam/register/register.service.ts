import { Injectable } from '@nestjs/common';
import { HashingService } from '../../shared/hashing/hashing.service';
import { AccountsUsers } from '../../users/interfaces/accounts-users.interface';
import { UsersService } from '../../users/users.service';
import { RegisterUserDto } from './dto/register-user.dto';

@Injectable()
export class RegisterService {
  constructor(
    private readonly usersService: UsersService,
    private readonly hashingService: HashingService,
  ) {}

  public async register(
    registerUserDto: RegisterUserDto,
  ): Promise<AccountsUsers> {
    registerUserDto.password = await this.hashingService.hash(
      registerUserDto.password,
    );

    return this.usersService.create(registerUserDto);
  }
}
