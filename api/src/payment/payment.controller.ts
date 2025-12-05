import { Body, Controller, Headers, Post, Req } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}
  @Post('create')
  public createPayment(@Body() data: CreatePaymentDto) {
    return this.paymentService.createPayment(data);
  }

  // @Post('success')
  // public paymentSuccess(@Body() data: SuccessPaymentDto) {
  //   return this.paymentService.paymentSuccess(data);
  // }

  @Post('razorpay/webhook')
  public callWebHook(
    @Req() req,
    @Headers('x-razorpay-signature') razorpaySignature: string,
  ) {
    return this.paymentService.webhookMethod(req.rawBody, razorpaySignature);
  }
}
