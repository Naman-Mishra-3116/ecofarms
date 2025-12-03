import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import crypto from 'crypto';

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
    const expectedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(body.toString())
      .digest('hex');

    return expectedSignature === signature;
  }
}
