import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({
    summary: 'Create user (Admin only)',
    description: 'Creates a new user account.',
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Admin access required.',
  })
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @ApiOperation({
    summary: 'Get all users (Admin only)',
    description: 'Returns all users without passwords.',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns all users.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Admin access required.',
  })
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @ApiOperation({
    summary: 'Admin overview statistics',
    description: 'Returns platform-wide user and notification statistics.',
  })
  @ApiResponse({
    status: 200,
    description: 'Overview statistics returned successfully.',
  })
  @Get('admin/overview')
  getAdminOverview() {
    return this.usersService.getAdminOverview();
  }

  @ApiOperation({
    summary: 'Admin user statistics',
    description: 'Returns notification statistics for all users.',
  })
  @ApiResponse({
    status: 200,
    description: 'User statistics returned successfully.',
  })
  @Get('admin/stats')
  getAdminStats() {
    return this.usersService.getAdminStats();
  }

  @ApiOperation({
    summary: 'Get user by ID (Admin only)',
    description: 'Returns a single user without the password.',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns a single user.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Admin access required.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @ApiOperation({
    summary: 'Update user (Admin only)',
    description:
      'Updates user information. Passwords are hashed before storage.',
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Admin access required.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @ApiOperation({
    summary: 'Delete user (Admin only)',
    description: 'Deletes a user and their related data.',
  })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Admin access required.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
