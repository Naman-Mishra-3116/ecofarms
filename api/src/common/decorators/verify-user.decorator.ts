import { createParamDecorator } from '@nestjs/common';
import { OTP_USER } from 'src/utils/constants';

export const VerifiedUser = createParamDecorator(
  (data: keyof { email: string }, ctx) => {
    const req = ctx.switchToHttp().getRequest();
    const payload = req[OTP_USER];
    return data ? payload[data] : payload;
  },
);
