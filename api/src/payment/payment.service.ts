import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import Razorpay from 'razorpay';
import { RAZORPAY_CLIENT } from 'src/utils/constants';
import { PAYMENT_STATUS } from 'src/utils/enums/payment.enum';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { SuccessPaymentDto } from './dto/success-payment.dto';
import { Payment, PaymentDocument } from './payment.schema';
import { ValidatePaymentSignature } from './providers/validate-signature.provider';
import axios from 'axios';
import { UploadsService } from 'src/shared/uploads/uploads.service';
import { FileType, UploadFolder } from 'src/utils/enums/upload.enum';
import { InvoiceService } from 'src/invoice/invoice.service';
import { UserDocument } from 'src/user/user.schema';
import { Invoices } from 'razorpay/dist/types/invoices';

@Injectable()
export class PaymentService {
  constructor(
    @Inject(RAZORPAY_CLIENT)
    private readonly paymentClient: Razorpay,
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
    private readonly validateSignature: ValidatePaymentSignature,
    private readonly uploadService: UploadsService,
    private readonly invoiceService: InvoiceService,
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
    const order = await this.paymentModel
      .findById(paymentDbId)
      .populate('userId');

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

    const invoice = await this.createRazorpayInvoice(
      order,
      razorpay_payment_id,
    );
    const file = await this.getInvoiceBuffer(
      invoice.short_url as string,
      paymentDbId,
    );

    const invoiceDocId = await this.uploadService.uploadFileService(
      file,
      UploadFolder.Invoice,
      FileType.Pdf,
    );

    await this.invoiceService.createInvoice(
      invoiceDocId,
      paymentDbId,
      invoice.id,
    );


    return {
      status: 'success',
      error: false,
      success: true,
      message: 'Payment verified successfully',
      data: updatedPayment,
      url: invoice.short_url,
    };
  }

  public async getInvoiceBuffer(url: string, paymentDbId: Types.ObjectId) {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
    });

    const buffer = Buffer.from(response.data);
    return {
      originalname: `invoice-${paymentDbId}.pdf`,
      buffer,
      mimetype: 'application/pdf',
      size: buffer.length,
    } as Express.Multer.File;
  }

  private async createRazorpayInvoice(
    order: PaymentDocument,
    razorpayPaymentId: string,
  ) {
    const invoiceData = {
      type: 'invoice' as const,
      customer: {
        name: 'Naman Mishra',
        email: 'namanwebd@gmail.com',
      },
      line_items: [
        {
          name: 'Product Purchase',
          description: 'Order Payment',
          amount: order.amount * 100,
          currency: 'INR',
          quantity: order.quantity,
        },
      ],
      receipt: `rcpt_${order._id}`,
      payment_id: razorpayPaymentId,
    };

    const invoice = await this.paymentClient.invoices.create(invoiceData);

    if (invoice.status === 'issued') {
      return invoice;
    }

    const finalized = await this.paymentClient.invoices.issue(invoice.id);

    return finalized;
  }
}
