import { ConflictException, Injectable } from '@nestjs/common';
import { ReceiptDocument, Receipt } from './receipt.schema';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import qrCode from 'qrcode';
import { FileType, UploadFolder } from 'src/utils/enums/upload.enum';
import moment from 'moment';
import * as fs from 'fs';
import * as path from 'path';
import { UserService } from 'src/user/user.service';
import PdfPrinter from 'pdfmake';
import { PaymentDocument } from 'src/payment/payment.schema';
import { UploadsService } from 'src/shared/uploads/uploads.service';

@Injectable()
export class ReceiptService {
  constructor(
    @InjectModel(Receipt.name)
    private readonly receiptModel: Model<ReceiptDocument>,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly uploadService: UploadsService,
  ) {}

  public async createReceipt(
    docId: Types.ObjectId,
    paymentDocId: Types.ObjectId,
  ) {
    return await this.receiptModel.create({
      paymentId: paymentDocId,
      receiptDocId: docId,
    });
  }

  public async getQrCodeForReceipt(paymentDocId: Types.ObjectId) {
    const verifyLink = this.configService.get('client.qrLink');
    const actualLink = verifyLink.replace(':paymentId', paymentDocId);
    const qrCodeImage = await qrCode.toDataURL(actualLink);
    return qrCodeImage;
  }

  public async generatePdfReceipt(
    order: PaymentDocument,
  ): Promise<Types.ObjectId> {
    return new Promise(async (resolve, reject) => {
      try {
        const logoPath = path.join(
          process.cwd(),
          'public',
          'images',
          'logo.png',
        );
        const logoBase64 = fs.readFileSync(logoPath).toString('base64');
        const logoImage = `data:image/png;base64,${logoBase64}`;
        const fontsPath = path.join(process.cwd(), 'public', 'fonts');
        const user = await this.userService.findUserById(order.userId);
        const qrImage = await this.getQrCodeForReceipt(order._id);

        if (!user) {
          throw new ConflictException('User could not be found!');
        }

        const fonts = {
          Roboto: {
            normal: fs.readFileSync(path.join(fontsPath, 'Roboto-Regular.ttf')),
            bold: fs.readFileSync(path.join(fontsPath, 'Roboto-Medium.ttf')),
            italics: fs.readFileSync(path.join(fontsPath, 'Roboto-Italic.ttf')),
          },
        };
        const printer = new PdfPrinter(fonts);
        const docDefinition = {
          background: [
            {
              image: logoImage,
              width: 400,
              opacity: 0.07,
              absolutePosition: { x: 100, y: 160 },
            },
          ],

          content: [
            {
              columns: [
                {
                  stack: [
                    {
                      columns: [
                        {
                          image: logoImage,
                          width: 30,
                          margin: [0, 0, 0, 0],
                        },
                        {
                          text: 'Vrakshalaya Pvt. Ltd.',
                          style: 'company',
                          margin: [10, 5, 0, 0],
                        },
                      ],
                    },

                    {
                      text: 'Payment Receipt',
                      style: 'header',
                      margin: [0, 2, 0, 15],
                    },
                  ],
                  width: '*',
                },

                {
                  image: qrImage,
                  width: 90,
                  alignment: 'right',
                  margin: [0, 15, 0, 0],
                },
              ],
              margin: [0, 0, 0, 25],
            },

            {
              text: 'Customer Details',
              style: 'sectionHeader',
              margin: [0, 0, 0, 6],
            },
            {
              style: 'tableSection',
              table: {
                widths: ['30%', '*'],
                body: [
                  [
                    { text: 'Name', style: 'tableLabel' },
                    user.userName || 'N/A',
                  ],
                  [{ text: 'Email', style: 'tableLabel' }, user.email || 'N/A'],
                  [
                    { text: 'User ID', style: 'tableLabel' },
                    order.userId.toString(),
                  ],
                ],
              },
              layout: {
                hLineWidth: () => 0.5,
                vLineWidth: () => 0.5,
                hLineColor: () => '#bbb',
                vLineColor: () => '#bbb',
                paddingLeft: () => 4,
                paddingRight: () => 4,
                paddingTop: () => 2,
                paddingBottom: () => 2,
              },
              margin: [0, 0, 0, 20],
            },

            {
              text: 'Payment Details',
              style: 'sectionHeader',
              margin: [0, 0, 0, 6],
            },
            {
              style: 'tableSection',
              table: {
                widths: ['30%', '*'],
                body: [
                  ['Receipt ID', `receipt-${order._id}`],
                  ['Product ID', order.productId],
                  ['Quantity', order.quantity.toString()],
                  ['Amount Paid', `₹${order.amount}`],
                  ['Currency', order.currency],
                  ['Payment ID', order.paymentId || 'N/A'],
                  ['Status', 'Paid'],
                  ['Date', moment().format('Do MMM, YYYY')],
                ],
              },
              layout: {
                hLineWidth: () => 0.5,
                vLineWidth: () => 0.5,
                hLineColor: () => '#bbb',
                vLineColor: () => '#bbb',
                paddingLeft: () => 4,
                paddingRight: () => 4,
                paddingTop: () => 2,
                paddingBottom: () => 2,
              },
              margin: [0, 0, 0, 20],
            },

            {
              text: 'Booking Details',
              style: 'sectionHeader',
              margin: [0, 0, 0, 6],
            },
            {
              style: 'tableSection',
              table: {
                widths: ['30%', '*'],
                body: [
                  ['Booking ID', 'BKG-001'],
                  ['Slot', 'Morning'],
                  ['Date', moment().format('Do MMM, YYYY')],
                  ['Time', '10:00 AM'],
                ],
              },
              layout: {
                hLineWidth: () => 0.5,
                vLineWidth: () => 0.5,
                hLineColor: () => '#bbb',
                vLineColor: () => '#bbb',
                paddingLeft: () => 4,
                paddingRight: () => 4,
                paddingTop: () => 2,
                paddingBottom: () => 2,
              },
              margin: [0, 0, 0, 30],
            },

            {
              text: 'Thank you for your booking!',
              style: 'thanks',
              alignment: 'center',
              margin: [0, 10],
            },
            {
              text: 'If you have any questions, feel free to contact support.',
              style: 'footerNote',
              alignment: 'center',
            },
          ],

          styles: {
            company: {
              fontSize: 22,
              bold: true,
              color: '#2E7D32',
              letterSpacing: 1,
            },
            header: {
              fontSize: 17,
              bold: true,
              color: '#444',
            },
            sectionHeader: {
              fontSize: 15,
              bold: true,
              color: '#2E7D32',
            },
            tableSection: {
              fontSize: 11,
            },
            tableLabel: {
              bold: true,
              color: '#444',
            },
            thanks: {
              fontSize: 13,
              bold: true,
              color: '#2E7D32',
            },
            footerNote: {
              fontSize: 10,
              italics: true,
              color: '#777',
            },
          },
        };

        const pdfDoc = printer.createPdfKitDocument(docDefinition);
        const buffers: Buffer[] = [];

        pdfDoc.on('data', (chunk) => buffers.push(chunk));
        pdfDoc.on('end', async () => {
          try {
            const pdfBuffer = Buffer.concat(buffers);
            const file: Express.Multer.File = {
              originalname: `receipt-${order._id}.pdf`,
              buffer: pdfBuffer,
              mimetype: 'application/pdf',
              size: pdfBuffer.length,
              fieldname: 'file',
              destination: '',
              filename: `receipt-${order._id}.pdf`,
              path: '',
              stream: null,
            } as any;

            const uploadedDocId = await this.uploadService.uploadFileService(
              file,
              UploadFolder.Invoice,
              FileType.Pdf,
            );
            resolve(uploadedDocId);
          } catch (err) {
            reject(err);
          }
        });

        pdfDoc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}
