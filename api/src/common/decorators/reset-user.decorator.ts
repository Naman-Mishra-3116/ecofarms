import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RESET_USER } from 'src/utils/constants';

export const ResetUser = createParamDecorator(
  (data: keyof { email: string }, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const payload = req[RESET_USER];

    return data ? payload[data] : payload;
  },
);
