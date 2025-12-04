import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ACTIVE_PERSON } from 'src/utils/constants';

export const Person = createParamDecorator(
  (data: keyof Payload, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const payload = req[ACTIVE_PERSON];
    return data ? payload[data] : payload;
  },
);
