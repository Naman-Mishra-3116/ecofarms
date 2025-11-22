import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BcryptService {
  public async hashPassword(password: Buffer | string): Promise<string> {
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(password, salt);
    return hash;
  }

  public async verifyPassword(
    original: string | Buffer,
    encrypted: string,
  ): Promise<boolean> {
    const isValid = await bcrypt.compare(original, encrypted);
    return isValid;
  }
}
