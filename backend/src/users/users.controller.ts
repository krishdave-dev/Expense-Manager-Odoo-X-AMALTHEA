import { Body, Controller, Get, Post, Patch, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorators';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  /**
   * Create a new user (Admin only)
   */
  @Post()
  @Roles(Role.ADMIN)
  async createUser(
    @CurrentUser() user: any,
    @Body() createUserDto: CreateUserDto,
  ) {
    return this.usersService.createUser(user.id, createUserDto);
  }

  /**
   * Get all users in company (Admin only)
   */
  @Get()
  @Roles(Role.ADMIN)
  async getAllUsers(@CurrentUser() user: any) {
    return this.usersService.getAllUsers(user.id);
  }

  /**
   * Get current user profile
   */
  @Get('profile')
  async getUserProfile(@CurrentUser() user: any) {
    return this.usersService.getUserProfile(user.id);
  }

  /**
   * Update user status (Admin only)
   */
  @Patch(':id/status')
  @Roles(Role.ADMIN)
  async updateUserStatus(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) targetUserId: number,
    @Body('isActive') isActive: boolean,
  ) {
    return this.usersService.updateUserStatus(user.id, targetUserId, isActive);
  }
}