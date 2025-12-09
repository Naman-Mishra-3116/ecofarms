import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { RazorPayProvider } from './providers/razorpay.provider';
import { ValidatePaymentSignature } from './providers/validate-signature.provider';
import { ReceiptModule } from 'src/receipt/receipt.module';

@Module({
  imports: [ReceiptModule],
  providers: [PaymentService, RazorPayProvider, ValidatePaymentSignature],
  controllers: [PaymentController],
})
export class PaymentModule {}
