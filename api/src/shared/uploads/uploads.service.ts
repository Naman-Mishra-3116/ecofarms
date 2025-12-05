import {
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
import { UPLOAD_CLIENT } from 'src/utils/constants';
import { FileType, UploadFolder } from 'src/utils/enums/upload.enum';
import { Upload, UploadDocument } from './uploads.schema';

type MulterFile = Express.Multer.File;

@Injectable()
export class UploadsService {
  constructor(
    @InjectModel(Upload.name)
    private readonly uploadModel: Model<UploadDocument>,

    @Inject(UPLOAD_CLIENT)
    private readonly imageKit: ImageKit,
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
        const fontsPath = path.join(process.cwd(), 'fonts');

        const fonts = {
          Roboto: {
            normal: fs.readFileSync(path.join(fontsPath, 'Roboto-Regular.ttf')),
            bold: fs.readFileSync(path.join(fontsPath, 'Roboto-Medium.ttf')),
            italics: fs.readFileSync(path.join(fontsPath, 'Roboto-Italic.ttf')),
          },
        };
        const printer = new PdfPrinter(fonts);

        const docDefinition = {
          content: [
            { text: 'VRAKSHALAYA', style: 'company', alignment: 'center' },
            {
              text: 'Payment Receipt',
              style: 'header',
              alignment: 'center',
              margin: [0, 5],
            },

            {
              style: 'tableExample',
              table: {
                widths: ['*', '*'],
                body: [
                  ['Receipt ID', `receipt-${order._id}`],
                  ['User ID', order.userId.toString()],
                  ['Product ID', order.productId],
                  ['Quantity', order.quantity.toString()],
                  ['Amount Paid', `₹${order.amount}`],
                  ['Currency', order.currency],
                  ['Payment ID', order.paymentId || 'N/A'],
                  ['Status', 'Paid ✅'],
                  ['Date', new Date().toLocaleString()],
                ],
              },
              layout: {
                fillColor: (rowIndex: number) =>
                  rowIndex % 2 === 0 ? '#f3f3f3' : null,
              },
              margin: [0, 20, 0, 0],
            },

            {
              text: 'Thank you for your payment!',
              style: 'thanks',
              alignment: 'center',
              margin: [0, 20],
            },
          ],

          styles: {
            company: { fontSize: 18, bold: true, color: '#4CAF50' },
            header: { fontSize: 16, bold: true },
            tableExample: { fontSize: 12 },
            thanks: { fontSize: 14, italics: true, color: '#4CAF50' },
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
