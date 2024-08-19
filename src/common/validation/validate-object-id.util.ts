import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

export function validateObjectId(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    throw new BadRequestException(`${id} is not a valid ObjectId`);
  }
}
