import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Razorpay from 'razorpay';
import { RAZORPAY_CLIENT } from 'src/utils/constants';

export const RazorPayProvider: Provider = {
  provide: RAZORPAY_CLIENT,
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    return new Razorpay({
      key_id: config.get('payment.key'),
      key_secret: config.get('payment.secret'),
    });
  },
};
