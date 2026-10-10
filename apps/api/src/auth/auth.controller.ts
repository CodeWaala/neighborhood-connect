import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { CurrentUserId } from './current-user-id.decorator';

type DevLoginBody = {
  email?: string;
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * TODO: Replace with Cognito JWT guard + DTO validation.
   * This endpoint is for local testing only.
   */
  @Post('dev-login')
  async devLogin(@Body() body: DevLoginBody) {
    const user = await this.authService.devLogin(body?.email);
    return { userId: user.id, email: user.email };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async me(@CurrentUserId() userId?: string) {
    return this.authService.me(userId);
  }
}
