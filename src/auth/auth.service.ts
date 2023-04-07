import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersRepository } from './users.Repository';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthCredentialsDTO } from './dto/auth-credentials.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './dto/jwt-interface.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UsersRepository)
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async signUp(authCredentialsDto: AuthCredentialsDTO): Promise<void> {
    await this.usersRepository.createUser(authCredentialsDto);
  }

  async signIn(
    authCredentialsDto: AuthCredentialsDTO,
  ): Promise<{ accessToken: string }> {
    const { username, password } = authCredentialsDto;
    const userExist = await this.usersRepository.findOneBy({ username });
    if (userExist && (await bcrypt.compare(password, userExist.password))) {
      const payload: JwtPayload = { username };
      const accessToken = await this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_SECRET'),
      });
      return { accessToken };
    } else
      throw new UnauthorizedException('Please check the login credentials');
  }
}
