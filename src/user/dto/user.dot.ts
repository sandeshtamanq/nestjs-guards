import { IsNotEmpty, MinLength } from 'class-validator';

export class UserDto {
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @MinLength(7)
  password: string;
}
