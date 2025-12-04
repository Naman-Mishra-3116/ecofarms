import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { REFRESH_USER } from 'src/utils/constants';

export const RequestUser = createParamDecorator(
  (data: keyof RefreshPayload, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const payload = req[REFRESH_USER];
    return data ? payload[data] : payload;
  },
);
