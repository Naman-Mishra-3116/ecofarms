import { SetMetadata } from '@nestjs/common';
import { PERMIT } from 'src/utils/constants';
import { Auth } from 'src/utils/enums/auth.enum';

export const Permit = (...auth: Auth[]) => SetMetadata(PERMIT, auth);
