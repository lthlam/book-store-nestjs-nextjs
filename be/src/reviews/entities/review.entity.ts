import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';

@Entity()
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('smallint')
  rating: number;

  @Column('text')
  comment: string;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Product)
  product: Product;

  @CreateDateColumn()
  createdAt: Date;
}
