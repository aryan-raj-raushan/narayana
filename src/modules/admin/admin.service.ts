import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Admin } from './schemas/admin.schema';
import { UpdateAdminDto } from './dto/update-admin.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name)
    private adminModel: Model<Admin>,
  ) {}

  async findByEmail(email: string): Promise<Admin | null> {
    return this.adminModel.findOne({ email: email.toLowerCase() }).exec();
  }

  async findById(id: string): Promise<Admin | null> {
    return this.adminModel.findById(id).select('-password').exec();
  }

  async createAdmin(email: string, password: string): Promise<Admin> {
    const existingAdmin = await this.findByEmail(email);
    if (existingAdmin) {
      throw new ConflictException('Admin with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new this.adminModel({
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    return admin.save();
  }

  async updateAdmin(adminId: string, updateAdminDto: UpdateAdminDto): Promise<Admin> {
    const admin = await this.adminModel.findById(adminId);
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    if (updateAdminDto.email) {
      const existingAdmin = await this.findByEmail(updateAdminDto.email);
      if (existingAdmin && existingAdmin._id.toString() !== adminId) {
        throw new ConflictException('Email already in use');
      }
      admin.email = updateAdminDto.email.toLowerCase();
    }

    if (updateAdminDto.password) {
      admin.password = await bcrypt.hash(updateAdminDto.password, 10);
    }

    return admin.save();
  }

  async updateLastLogin(adminId: string): Promise<void> {
    await this.adminModel.findByIdAndUpdate(adminId, {
      lastLoginAt: new Date(),
    });
  }

  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
