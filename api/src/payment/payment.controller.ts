import { Body, Controller, Post } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { SuccessPaymentDto } from './dto/success-payment.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}
  @Post('create')
  public createPayment(@Body() data: CreatePaymentDto) {
    return this.paymentService.createPayment(data);
  }

  @Post('success')
  public paymentSuccess(@Body() data: SuccessPaymentDto) {
    return this.paymentService.paymentSuccess(data);
  }

  
}
