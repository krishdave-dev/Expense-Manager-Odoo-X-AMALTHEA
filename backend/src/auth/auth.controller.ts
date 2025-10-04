import { Body, Controller, Post, Patch, UseGuards, HttpCode, HttpStatus, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { SignupDto } from './dto/signup.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private prisma: PrismaService,
  ) {}

  /**
   * Company signup endpoint
   */
  @Public()
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  /**
   * User login endpoint
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * Change password endpoint
   */
  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUser() user: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user.id, changePasswordDto);
  }

  /**
   * Debug endpoint to check all users (TEMPORARY - REMOVE IN PRODUCTION)
   */
  @Public()
  @Get('debug/users')
  async debugUsers() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        is_active: true,
        is_temp_password: true,
        password_hash: true, // Include for debugging
        created_at: true,
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      message: 'DEBUG: All users in database',
      users: users.map(user => ({
        ...user,
        password_hash: user.password_hash ? `${user.password_hash.substring(0, 10)}...` : null, // Mask password for security
      })),
      total: users.length,
    };
  }
}