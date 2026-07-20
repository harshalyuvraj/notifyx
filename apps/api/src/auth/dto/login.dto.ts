import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'harshalyuv@gmail.com',
    description: 'Registered email address',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: '123456',
    description: 'User password',
  })
  @IsString()
  @MinLength(6)
  password!: string;
}
