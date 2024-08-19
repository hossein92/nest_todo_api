import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { SignupDto } from 'src/auth/dto/signup.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async findOne(email: string): Promise<User> {
    const findUser = await this.userModel.findOne({ email }).exec();
    if (!findUser) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return findUser;
  }
  async findUser(email: string): Promise<User> {
    const findUser = await this.userModel.findOne({ email }).exec();
    return findUser;
  }

  async singUpUser(signupDto: SignupDto): Promise<User> {
    const createUser = await this.userModel.create(signupDto);
    return createUser;
  }
}
