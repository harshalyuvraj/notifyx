import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: '123456',
    description: 'Password (minimum 6 characters)',
  })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({
    example: 'Harshal',
    description: 'Full name',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;
}
