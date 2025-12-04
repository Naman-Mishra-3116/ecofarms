import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { UploadClient } from './providers/upload-client.provider';

@Module({
  controllers: [UploadsController],
  providers: [UploadsService, UploadClient],
})
export class UploadsModule {}
