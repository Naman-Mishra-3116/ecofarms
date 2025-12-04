import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import ImageKit from 'imageKit';
import { Model } from 'mongoose';
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
}
