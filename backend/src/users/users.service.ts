import { Injectable, ConflictException, NotFoundException, ForbiddenException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  /**
   * Create a new user (Admin only)
   */
  async createUser(adminUserId: number, createUserDto: CreateUserDto) {
    const { name, email, role } = createUserDto;

    // Get admin's company information
    const adminUser = await this.prisma.user.findUnique({
      where: { id: adminUserId },
      include: { company: true },
    });

    if (!adminUser || adminUser.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can create users');
    }

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Generate temporary password
    const tempPassword = this.generateRandomPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    try {
      // Create user
      const newUser = await this.prisma.user.create({
        data: {
          name,
          email,
          password_hash: hashedPassword,
          role,
          company_id: adminUser.company_id,
          is_temp_password: true,
          is_active: false, // New users start as inactive
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          is_active: true,
          is_temp_password: true,
          created_at: true,
        },
      });

      // Attempt to send email with temporary password
      try {
        await this.mailService.sendTemporaryPassword(
          email,
          name,
          tempPassword,
          adminUser.company.name,
        );
        
        return {
          message: 'User created successfully and email sent',
          user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            companyId: adminUser.company_id,
            isActive: newUser.is_active,
            isTempPassword: newUser.is_temp_password,
            createdAt: newUser.created_at.toISOString(),
          },
          tempPassword: undefined, // Don't expose password when email sent
        };
      } catch (emailError) {
        // User created successfully but email failed
        return {
          message: 'User created successfully but email delivery failed. Please share these credentials manually.',
          user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            companyId: adminUser.company_id,
            isActive: newUser.is_active,
            isTempPassword: newUser.is_temp_password,
            createdAt: newUser.created_at.toISOString(),
          },
          tempPassword: tempPassword, // Include password when email fails
          emailError: 'Email configuration issue - check server logs for details',
        };
      }
    } catch (error) {
      throw new Error('Failed to create user');
    }
  }

  /**
   * Get all users in the company (Admin only)
   */
  async getAllUsers(adminUserId: number) {
    const adminUser = await this.prisma.user.findUnique({
      where: { id: adminUserId },
    });

    if (!adminUser || adminUser.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can view all users');
    }

    const usersData = await this.prisma.user.findMany({
      where: { company_id: adminUser.company_id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        is_active: true,
        is_temp_password: true,
        created_at: true,
        updated_at: true,
        company_id: true,
        managers: {
          select: {
            manager: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    // Transform snake_case to camelCase for frontend
    const users = usersData.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.company_id,
      isActive: user.is_active,
      isTempPassword: user.is_temp_password,
      createdAt: user.created_at.toISOString(),
      updatedAt: user.updated_at?.toISOString(),
      managers: user.managers.map(relation => relation.manager),
    }));

    return {
      users,
      total: users.length,
    };
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        is_active: true,
        is_temp_password: true,
        created_at: true,
        updated_at: true,
        company: {
          select: {
            id: true,
            name: true,
            country: true,
            currency_code: true,
            currency_symbol: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Get company information for user
   */
  async getCompanyInfo(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        company: {
          select: {
            id: true,
            name: true,
            country: true,
            currency_code: true,
            currency_symbol: true,
          },
        },
      },
    });

    if (!user || !user.company) {
      throw new NotFoundException('User or company not found');
    }

    return {
      id: user.company.id,
      name: user.company.name,
      country: user.company.country,
      currency: {
        code: user.company.currency_code,
        symbol: user.company.currency_symbol,
      },
    };
  }

  /**
   * Update user status (Admin only)
   */
  async updateUserStatus(adminUserId: number, targetUserId: number, isActive: boolean) {
    const adminUser = await this.prisma.user.findUnique({
      where: { id: adminUserId },
      include: { company: true },
    });

    if (!adminUser || adminUser.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can update user status');
    }

    // Prevent admin from deactivating themselves
    if (adminUserId === targetUserId && !isActive) {
      throw new ForbiddenException('You cannot deactivate your own account');
    }

    const targetUser = await this.prisma.user.findFirst({
      where: { 
        id: targetUserId,
        company_id: adminUser.company_id,
      },
    });

    if (!targetUser) {
      throw new NotFoundException('User not found in your company');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: targetUserId },
      data: { is_active: isActive },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        is_active: true,
        is_temp_password: true,
        updated_at: true,
      },
    });

    // If activating a user with temporary password, resend the email
    if (isActive && targetUser.is_temp_password) {
      try {
        // Generate a new temporary password for security
        const newTempPassword = this.generateRandomPassword();
        const hashedPassword = await bcrypt.hash(newTempPassword, 12);

        // Update user with new temporary password
        await this.prisma.user.update({
          where: { id: targetUserId },
          data: { password_hash: hashedPassword },
        });

        // Send email with new temporary password
        await this.mailService.sendTemporaryPassword(
          targetUser.email,
          targetUser.name,
          newTempPassword,
          adminUser.company.name,
        );

        return {
          message: 'User activated successfully and temporary password email sent',
          user: {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            companyId: targetUser.company_id,
            isActive: updatedUser.is_active,
            isTempPassword: updatedUser.is_temp_password,
            updatedAt: updatedUser.updated_at?.toISOString(),
          },
          emailSent: true,
        };
      } catch (emailError) {
        return {
          message: 'User activated successfully but email delivery failed',
          user: {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            companyId: targetUser.company_id,
            isActive: updatedUser.is_active,
            isTempPassword: updatedUser.is_temp_password,
            updatedAt: updatedUser.updated_at?.toISOString(),
          },
          emailSent: false,
          emailError: 'Please check email configuration',
        };
      }
    }

    return {
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        companyId: targetUser.company_id,
        isActive: updatedUser.is_active,
        isTempPassword: updatedUser.is_temp_password,
        updatedAt: updatedUser.updated_at?.toISOString(),
      },
      emailSent: false,
    };
  }

  /**
   * Assign manager to employee
   */
  async assignManager(adminId: number, employeeId: number, managerId: number) {
    // Verify admin permissions
    const adminUser = await this.prisma.user.findUnique({
      where: { id: adminId },
      include: { company: true },
    });

    if (!adminUser || adminUser.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can assign managers');
    }

    // Verify both employee and manager exist and are in the same company
    const employee = await this.prisma.user.findUnique({ where: { id: employeeId } });
    const manager = await this.prisma.user.findUnique({ where: { id: managerId } });

    if (!employee || !manager) {
      throw new NotFoundException('Employee or manager not found');
    }

    if (employee.company_id !== adminUser.company_id || manager.company_id !== adminUser.company_id) {
      throw new ForbiddenException('Users must be in the same company');
    }

    if (manager.role !== 'MANAGER' && manager.role !== 'ADMIN') {
      throw new BadRequestException('Assigned user must have MANAGER or ADMIN role');
    }

    // Check if relationship already exists
    const existing = await this.prisma.managerRelation.findUnique({
      where: {
        employee_id_manager_id: {
          employee_id: employeeId,
          manager_id: managerId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Manager-employee relationship already exists');
    }

    // Create the relationship
    const relation = await this.prisma.managerRelation.create({
      data: {
        employee_id: employeeId,
        manager_id: managerId,
      },
      include: {
        employee: { select: { id: true, name: true, email: true, role: true } },
        manager: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    return {
      message: 'Manager assigned successfully',
      relation: {
        id: relation.id,
        employeeId: relation.employee_id,
        managerId: relation.manager_id,
        employee: relation.employee,
        manager: relation.manager,
      },
    };
  }

  /**
   * Remove manager from employee
   */
  async removeManager(adminId: number, employeeId: number, managerId: number) {
    // Verify admin permissions
    const adminUser = await this.prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!adminUser || adminUser.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can remove managers');
    }

    // Find and delete the relationship
    const relation = await this.prisma.managerRelation.findUnique({
      where: {
        employee_id_manager_id: {
          employee_id: employeeId,
          manager_id: managerId,
        },
      },
    });

    if (!relation) {
      throw new NotFoundException('Manager-employee relationship not found');
    }

    await this.prisma.managerRelation.delete({
      where: { id: relation.id },
    });

    return {
      message: 'Manager removed successfully',
    };
  }

  /**
   * Update user role (Admin only)
   */
  async updateUserRole(adminUserId: number, targetUserId: number, newRole: string) {
    const adminUser = await this.prisma.user.findUnique({
      where: { id: adminUserId },
    });

    if (!adminUser || adminUser.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can update user roles');
    }

    // Prevent admin from changing their own role
    if (adminUserId === targetUserId) {
      throw new ForbiddenException('You cannot change your own role');
    }

    // Validate role
    if (!['ADMIN', 'MANAGER', 'EMPLOYEE'].includes(newRole)) {
      throw new BadRequestException('Invalid role specified');
    }

    const targetUser = await this.prisma.user.findFirst({
      where: { 
        id: targetUserId,
        company_id: adminUser.company_id,
      },
    });

    if (!targetUser) {
      throw new NotFoundException('User not found in your company');
    }

    // If changing from MANAGER role, remove all manager-employee relationships
    if (targetUser.role === 'MANAGER' && newRole !== 'MANAGER') {
      await this.prisma.managerRelation.deleteMany({
        where: { manager_id: targetUserId },
      });
    }

    // Update the user's role
    const updatedUser = await this.prisma.user.update({
      where: { id: targetUserId },
      data: { role: newRole as any },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        is_active: true,
        is_temp_password: true,
        updated_at: true,
      },
    });

    return {
      message: `User role updated successfully to ${newRole}`,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        companyId: targetUser.company_id,
        isActive: updatedUser.is_active,
        isTempPassword: updatedUser.is_temp_password,
        updatedAt: updatedUser.updated_at?.toISOString(),
      },
    };
  }

  /**
   * Get user's managers
   */
  async getUserManagers(requesterId: number, userId: number) {
    // Users can view their own managers, or admins can view anyone's
    const requester = await this.prisma.user.findUnique({ where: { id: requesterId } });
    
    if (!requester) {
      throw new UnauthorizedException('Invalid user');
    }

    if (requesterId !== userId && requester.role !== 'ADMIN') {
      throw new ForbiddenException('Can only view your own managers unless you are an admin');
    }

    const relations = await this.prisma.managerRelation.findMany({
      where: { employee_id: userId },
      include: {
        manager: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    return relations.map(relation => ({
      id: relation.id,
      employeeId: relation.employee_id,
      managerId: relation.manager_id,
      manager: relation.manager,
    }));
  }

  /**
   * Get user's employees (for managers)
   */
  async getUserEmployees(requesterId: number, managerId: number) {
    // Only managers can view their employees, or admins can view anyone's
    const requester = await this.prisma.user.findUnique({ where: { id: requesterId } });
    
    if (!requester) {
      throw new UnauthorizedException('Invalid user');
    }

    if (requesterId !== managerId && requester.role !== 'ADMIN') {
      throw new ForbiddenException('Can only view your own employees unless you are an admin');
    }

    const relations = await this.prisma.managerRelation.findMany({
      where: { manager_id: managerId },
      include: {
        employee: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    return relations.map(relation => ({
      id: relation.id,
      employeeId: relation.employee_id,
      managerId: relation.manager_id,
      employee: relation.employee,
    }));
  }

  /**
   * Generate random password
   */
  private generateRandomPassword(): string {
    const length = 12;
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    return password;
  }
}