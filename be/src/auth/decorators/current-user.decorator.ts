import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface JwtPayload {
  sub: string; // user/admin ID
  email?: string;
  username?: string;
  role?: string;
}

/**
 * Lấy thông tin user đang đăng nhập từ JWT payload.
 * Dùng trong controller để lấy ID mà không cần nhận từ request body.
 *
 * @example
 * findOne(@CurrentUser() user: JwtPayload) {
 *   return this.service.findOne(user.sub);
 * }
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
