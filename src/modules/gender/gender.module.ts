import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GenderService } from './gender.service';
import { GenderController } from './gender.controller';
import { Gender, GenderSchema } from './schemas/gender.schema';
import { CategoryModule } from '../category/category.module';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Gender.name, schema: GenderSchema }]),
    forwardRef(() => CategoryModule),
    DatabaseModule,
  ],
  controllers: [GenderController],
  providers: [GenderService],
  exports: [GenderService],
})
export class GenderModule {}
