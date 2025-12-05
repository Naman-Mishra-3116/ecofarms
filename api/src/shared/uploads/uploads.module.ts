import { Global, Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { UploadClient } from './providers/upload-client.provider';

@Global()
@Module({
  exports: [UploadsService],
  controllers: [UploadsController],
  providers: [UploadsService, UploadClient],
})
export class UploadsModule {}
