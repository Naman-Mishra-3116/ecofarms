import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as fs from 'fs';
import ImageKit from 'imageKit';
import { Model, Types } from 'mongoose';
import * as path from 'path';
import PdfPrinter from 'pdfmake';
import { PaymentDocument } from 'src/payment/payment.schema';
import { ReceiptService } from 'src/receipt/receipt.service';
import { UserService } from 'src/user/user.service';
import { UPLOAD_CLIENT } from 'src/utils/constants';
import { FileType, UploadFolder } from 'src/utils/enums/upload.enum';
import { Upload, UploadDocument } from './uploads.schema';
import logo from 'public/images';

type MulterFile = Express.Multer.File;

@Injectable()
export class UploadsService {
  constructor(
    @InjectModel(Upload.name)
    private readonly uploadModel: Model<UploadDocument>,

    @Inject(UPLOAD_CLIENT)
    private readonly imageKit: ImageKit,

    private readonly userService: UserService,

    private readonly receiptService: ReceiptService,
  ) {}

  public async uploadFileService(
    file: MulterFile,
    folder: UploadFolder,
    type: FileType,
  ) {
    const uploaded = await this.imageKit.upload({
      file: file.buffer,
      fileName: file.originalname,
      folder: `/${folder}`,
    });

    if (!uploaded || !uploaded.url) {
      throw new InternalServerErrorException('Image uploading failed');
    }

    const created = await this.uploadModel.create({
      name: file.originalname,
      path: uploaded.url,
      type,
      mime: file.mimetype,
      size: file.size,
      publicId: uploaded.fileId,
    });

    return created._id;
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
        const qrImage = await this.receiptService.getQrCodeForReceipt(
          order._id,
        );

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
                          width: 30, // SAME visual height as text heading
                          margin: [0, 0, 20, 0],
                        },
                        {
                          text: 'Vrakshalaya Pvt. Ltd.',
                          style: 'company',
                          margin: [0, 5, 0, 0], // slight vertical align fix
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

            // CUSTOMER DETAILS
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
              layout: 'lightHorizontalLines',
              margin: [0, 0, 0, 20],
            },

            // PAYMENT DETAILS
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
                  ['Date', new Date().toLocaleString()],
                ],
              },
              layout: 'lightHorizontalLines',
              margin: [0, 0, 0, 20],
            },

            // BOOKING DETAILS
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
                  ['Date', '2025-03-22'],
                  ['Time', '10:00 AM'],
                ],
              },
              layout: 'lightHorizontalLines',
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

            const uploadedDocId = await this.uploadFileService(
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
