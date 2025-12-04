import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { RazorPayProvider } from './providers/razorpay.provider';
import { ValidatePaymentSignature } from './providers/validate-signature.provider';

@Module({
  providers: [PaymentService, RazorPayProvider, ValidatePaymentSignature],
  controllers: [PaymentController],
})
export class PaymentModule {}
