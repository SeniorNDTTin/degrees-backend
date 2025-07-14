import { Request } from 'express';

import { LoginDto } from 'src/apis/auth/dto/login.dto';

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();
    return request.user as LoginDto;
  },
);
