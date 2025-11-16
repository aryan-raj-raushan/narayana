import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../schemas/order.schema';

export class UpdateOrderStatusDto {
  @ApiProperty({
    description: 'New status for the order',
    example: 'confirmed',
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
  })
  @IsEnum(OrderStatus, {
    message: 'Status must be one of: pending, confirmed, shipped, delivered, cancelled',
  })
  status: OrderStatus;
}
