import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import crypto from 'crypto';
import { Hashing } from 'src/utils/enums/payment.enum';

@Injectable()
export class ValidatePaymentSignature {
  constructor(private readonly configService: ConfigService) {}

  public validatePaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string,
  ) {
    const secretKey = this.configService.get('payment.secret');
    const body = orderId + '|' + paymentId;
    const expectedSignature = this.cryptoHashing(body, secretKey);
    return expectedSignature === signature;
  }

  public validateWebHookSignature(rawBody: any, providedSignature: string) {
    const secret = this.configService.get('payment.webhookSecret');
    const expected = this.cryptoHashing(rawBody, secret);
    return expected === providedSignature;
  }

  private cryptoHashing(body: any, secret: string) {
    const expected = crypto
      .createHmac(Hashing.ALGORITHM, secret)
      .update(body)
      .digest(Hashing.DIGEST);
    return expected;
  }
}
