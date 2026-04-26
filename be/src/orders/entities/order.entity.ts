import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user: User;

  @Column('jsonb', { default: [] })
  orderDetails: any[];

  @Column('jsonb', { nullable: true })
  address: any;

  @Column('decimal', { default: 0 })
  total: number;

  @Column('decimal', { default: 0 })
  shipping: number;

  @Column('decimal', { default: 0 })
  discount: number;

  @Column({ nullable: true })
  date: string;

  @Column({ default: 'pending' })
  status: string;

  @Column({ nullable: true })
  deliveryDate: string;

  @CreateDateColumn()
  createdAt: Date;
}
