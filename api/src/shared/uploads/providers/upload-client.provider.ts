import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ImageKit from 'imageKit';
import { UPLOAD_CLIENT } from 'src/utils/constants';

export const UploadClient: Provider = {
  provide: UPLOAD_CLIENT,
  inject: [ConfigService],
  useFactory: (conf: ConfigService) => {
    return new ImageKit({
      privateKey: conf.get('uploader.private_key') as string,
      publicKey: conf.get('uploader.public_key') as string,
      urlEndpoint: conf.get('uploader.url') as string,
    });
  },
};
