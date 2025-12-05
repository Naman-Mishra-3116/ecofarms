import { Module } from '@nestjs/common';
import { ReceiptService } from './receipt.service';
import { UserModule } from 'src/user/user.module';
import { UploadsModule } from 'src/shared/uploads/uploads.module';

@Module({
  imports: [UserModule, UploadsModule],
  providers: [ReceiptService],
  exports: [ReceiptService],
})
export class ReceiptModule {}
