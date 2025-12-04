import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileType, UploadFolder } from 'src/utils/enums/upload.enum';
import { Permit } from 'src/common/decorators/auth.decorator';
import { Auth } from 'src/utils/enums/auth.enum';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadService: UploadsService) {}

  @Permit(Auth.User)
  @UseInterceptors(FileInterceptor('file'))
  @Post('file')
  public uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.uploadService.uploadFileService(
      file,
      UploadFolder.Upload,
      FileType.Image,
    );
  }
}
