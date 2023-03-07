import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class AlphanumericPipe implements PipeTransform {
  transform(value: string, metadata: ArgumentMetadata) {
    if (value?.match(/[^ \w]/)?.length)
      throw new BadRequestException(`no symbols allowed in ${metadata.data}`);
    return value;
  }
}
