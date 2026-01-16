/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsEmail, MinLength, IsString } from 'class-validator';

export class AuthDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
