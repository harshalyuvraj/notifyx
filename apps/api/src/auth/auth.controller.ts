import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: 'Register a new user',
    description: 'Creates a new user account.',
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully.',
  })
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @ApiOperation({
    summary: 'Login user',
    description: 'Authenticates a user and returns a JWT access token.',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful.',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials.',
  })
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user profile',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the authenticated user.',
  })
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req: any) {
    return this.authService.profile(req.user.userId);
  }
}
