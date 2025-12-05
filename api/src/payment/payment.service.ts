import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import Razorpay from 'razorpay';
import { ReceiptService } from 'src/receipt/receipt.service';
import { UploadsService } from 'src/shared/uploads/uploads.service';
import { RAZORPAY_CLIENT } from 'src/utils/constants';
import { PAYMENT_STATUS } from 'src/utils/enums/payment.enum';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { SuccessPaymentDto } from './dto/success-payment.dto';
import { Payment, PaymentDocument } from './payment.schema';
import { ValidatePaymentSignature } from './providers/validate-signature.provider';

@Injectable()
export class PaymentService {
  constructor(
    @Inject(RAZORPAY_CLIENT)
    private readonly paymentClient: Razorpay,
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
    private readonly validateSignature: ValidatePaymentSignature,
    private readonly uploadService: UploadsService,
    private readonly receiptService: ReceiptService,
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

  // public async paymentSuccess(data: SuccessPaymentDto) {
  //   const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;
  //   const paymentDbId = new Types.ObjectId(data.paymentDbId);
  //   const order = await this.paymentModel
  //     .findById(paymentDbId)
  //     .populate('userId');

  //   if (!order) {
  //     throw new BadRequestException('Order not found!');
  //   }

  //   const isSignatureValid = this.validateSignature.validatePaymentSignature(
  //     razorpay_order_id,
  //     razorpay_payment_id,
  //     razorpay_signature,
  //   );

  //   if (!isSignatureValid) {
  //     await this.paymentModel.findByIdAndUpdate(paymentDbId, {
  //       status: PAYMENT_STATUS.FAILED,
  //     });
  //     throw new BadRequestException('Invalid signature');
  //   }

  //   const updatedPayment = await this.paymentModel.findByIdAndUpdate(
  //     paymentDbId,
  //     {
  //       paymentId: razorpay_payment_id,
  //       orderId: razorpay_order_id,
  //       signature: razorpay_signature,
  //       status: PAYMENT_STATUS.VERIFIED,
  //     },
  //     { new: true },
  //   );

  //   return {
  //     status: 'success',
  //     error: false,
  //     success: true,
  //     message: 'Payment verified successfully',
  //     data: updatedPayment,
  //   };
  // }

  public async webhookMethod(rawBody: any, razorpaySignature: string) {
    try {
      const isValidSignature = this.validateSignature.validateWebHookSignature(
        rawBody,
        razorpaySignature,
      );

      if (!isValidSignature) {
        return { status: 'failed' };
      }

      const event = JSON.parse(rawBody.toString());
      const razorpayOrderId = event.payload.payment.entity.order_id;
      const order = await this.paymentModel.findOne({
        orderId: razorpayOrderId,
      });

      if (!order) {
        console.log('order not found');
        return;
      }

      if (event.event !== 'payment.captured') {
        await this.paymentModel.findByIdAndUpdate(order._id, {
          status: PAYMENT_STATUS.FAILED,
        });
        return {
          status: 'Payment Failed',
        };
      }

      await this.paymentModel.findByIdAndUpdate(order._id, {
        status: PAYMENT_STATUS.SUCCESS,
      });

      const uploadedDocId = await this.uploadService.generatePdfReceipt(order);
      await this.receiptService.createReceipt(uploadedDocId, order._id);
      return { status: 'success' };
    } catch (error) {
      console.log('Webhook Error:', error);
    }
  }
}
