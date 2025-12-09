import { Global, Module } from '@nestjs/common';
import { UploadClient } from './providers/upload-client.provider';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';

@Global()
@Module({
  exports: [UploadsService],
  controllers: [UploadsController],
  providers: [UploadsService, UploadClient],
})
export class UploadsModule {}
