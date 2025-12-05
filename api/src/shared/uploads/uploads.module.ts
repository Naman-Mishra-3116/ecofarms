import { Global, Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { UploadClient } from './providers/upload-client.provider';
import { UserModule } from 'src/user/user.module';
import { ReceiptModule } from 'src/receipt/receipt.module';

@Global()
@Module({
  imports: [UserModule, ReceiptModule],
  exports: [UploadsService],
  controllers: [UploadsController],
  providers: [UploadsService, UploadClient],
})
export class UploadsModule {}
