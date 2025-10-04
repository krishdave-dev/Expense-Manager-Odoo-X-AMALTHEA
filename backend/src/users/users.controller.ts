import { Body, Controller, Get, Post, Patch, Param, ParseIntPipe, UseGuards, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
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
   * Get company information for current user
   */
  @Get('company')
  async getCompanyInfo(@CurrentUser() user: any) {
    return this.usersService.getCompanyInfo(user.id);
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

  /**
   * Update user role (Admin only)
   */
  @Patch(':id/role')
  @Roles(Role.ADMIN)
  async updateUserRole(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) targetUserId: number,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.usersService.updateUserRole(user.id, targetUserId, updateRoleDto.role);
  }

  /**
   * Assign manager to employee (Admin only)
   */
  @Post(':employeeId/manager/:managerId')
  @Roles(Role.ADMIN)
  async assignManager(
    @CurrentUser() user: any,
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Param('managerId', ParseIntPipe) managerId: number,
  ) {
    return this.usersService.assignManager(user.id, employeeId, managerId);
  }

  /**
   * Remove manager from employee (Admin only)
   */
  @Delete(':employeeId/manager/:managerId')
  @Roles(Role.ADMIN)
  async removeManager(
    @CurrentUser() user: any,
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Param('managerId', ParseIntPipe) managerId: number,
  ) {
    return this.usersService.removeManager(user.id, employeeId, managerId);
  }

  /**
   * Get user's managers (Employee/Manager)
   */
  @Get(':id/managers')
  async getUserManagers(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) userId: number,
  ) {
    return this.usersService.getUserManagers(user.id, userId);
  }

  /**
   * Get user's employees (Manager only)
   */
  @Get(':id/employees')
  @Roles(Role.MANAGER, Role.ADMIN)
  async getUserEmployees(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) managerId: number,
  ) {
    return this.usersService.getUserEmployees(user.id, managerId);
  }
}