import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth/jwt-auth.guard';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import { Throttle } from '@nestjs/throttler';
import { ChangePasswordDto } from './dto/change-password.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Creates a new user account and sends an email verification link.',
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully. Email verification required.',
  })
  @Throttle({
    default: {
      limit: 5,
      ttl: 60000,
    },
  })
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @ApiOperation({
    summary: 'Verify email address',
    description: 'Verifies a user email using the token sent by email.',
  })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired verification token.',
  })
  @Get('verify-email')
  verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
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
    description: 'Invalid credentials or unverified email.',
  })
  @Throttle({
    default: {
      limit: 5,
      ttl: 60000,
    },
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

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all users (Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns all users.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden.',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('users')
  getAllUsers() {
    return this.authService.findAllUsers();
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Change current user password',
  })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Current password is incorrect.',
  })
  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(
      req.user.userId,
      dto.currentPassword,
      dto.newPassword,
    );
  }
  @ApiOperation({
    summary: 'Request password reset',
    description:
      'Sends a password reset link if an account exists for the email.',
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset request processed.',
  })
  @Throttle({
    default: {
      limit: 3,
      ttl: 60000,
    },
  })
  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }
  @ApiOperation({
    summary: 'Reset password',
    description: 'Sets a new password using a valid one-time reset token.',
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired reset token.',
  })
  @Post('reset-password')
  resetPassword(@Query('token') token: string, @Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(token, dto.newPassword);
  }
}
