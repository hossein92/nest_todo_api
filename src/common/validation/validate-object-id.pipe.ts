import { BadRequestException, PipeTransform, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class ValidateObjectId implements PipeTransform<any> {
  transform(value: any) {
    console.log(value);

    // If the value is an object with an '_id' property, extract the '_id'
    if (value && typeof value === 'object' && '_id' in value) {
      value = value._id;
    }

    // Now check if the value is a valid ObjectId
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException(`${value} is not a valid ObjectId`);
    }

    return value;
  }
}
