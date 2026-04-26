import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Coupon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  code: string;

  @Column('decimal')
  discount: number;

  @Column({ default: 'percent' })
  type: string; // 'percent' | 'fixed'

  @Column()
  description: string;

  @Column('decimal')
  minimum: number;

  @Column()
  startDate: string;

  @Column()
  expiryDate: string;
}
