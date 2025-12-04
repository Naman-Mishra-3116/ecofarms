import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { FileType } from 'src/utils/enums/upload.enum';

@Schema({ timestamps: true })
export class Upload {
  @Prop({ type: String, required: true })
  path: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ enum: FileType, required: true, default: FileType.Image })
  type: FileType;

  @Prop({ type: String, required: true })
  mime: string;

  @Prop({ type: Number, required: true })
  size: number;

  @Prop({ type: String, required: true })
  publicId: string;
}

export const UploadSchema = SchemaFactory.createForClass(Upload);
export type UploadDocument = HydratedDocument<Upload>;
