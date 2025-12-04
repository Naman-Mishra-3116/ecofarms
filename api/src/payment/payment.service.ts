import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import Razorpay from 'razorpay';
import { RAZORPAY_CLIENT } from 'src/utils/constants';
import { Payment, PaymentDocument } from './payment.schema';
import { Model, Types } from 'mongoose';
import { PAYMENT_STATUS } from 'src/utils/enums/payment.enum';
import { ValidatePaymentSignature } from './providers/validate-signature.provider';
import { SuccessPaymentDto } from './dto/success-payment.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentService {
  constructor(
    @Inject(RAZORPAY_CLIENT)
    private readonly paymentClient: Razorpay,
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
    private readonly validateSignature: ValidatePaymentSignature,
  ) {}

  public async createPayment(data: CreatePaymentDto) {
    const { userId, amount, productId, quantity } = data;
    const payableAmount = quantity * amount;
    const order = await this.paymentClient.orders.create({
      amount: payableAmount * 100,
      currency: 'INR',
    });

    const created = await this.paymentModel.create({
      userId: new Types.ObjectId(userId),
      quantity,
      productId,
      amount: payableAmount,
      currency: 'INR',
      orderId: order.id,
      status: PAYMENT_STATUS.PENDING,
    });

    return {
      _id: created._id.toString(),
      orderId: order.id,
      amount: order.amount,
    };
  }

  public async paymentSuccess(data: SuccessPaymentDto) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;
    const paymentDbId = new Types.ObjectId(data.paymentDbId);
    const order = this.paymentModel.findById(paymentDbId);

    if (!order) {
      throw new BadRequestException('Order not found!');
    }

    const isSignatureValid = this.validateSignature.validatePaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    );

    if (!isSignatureValid) {
      await this.paymentModel.findByIdAndUpdate(paymentDbId, {
        status: PAYMENT_STATUS.FAILED,
      });
      throw new BadRequestException('Invalid signature');
    }

    const updatedPayment = await this.paymentModel.findByIdAndUpdate(
      paymentDbId,
      {
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        signature: razorpay_signature,
        status: PAYMENT_STATUS.SUCCESS,
      },
      { new: true },
    );

    return {
      status: 'success',
      error: false,
      success: true,
      message: 'Payment verified successfully',
      data: updatedPayment,
    };
  }
}
