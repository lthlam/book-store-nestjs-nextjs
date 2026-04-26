import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Ward } from './ward.entity';

@Entity()
export class Address {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user: User;

  @Column()
  street: string;

  @ManyToOne(() => Ward)
  @JoinColumn({ name: 'wardCode' })
  ward: Ward;

  @Column()
  wardCode: string;

  @Column({ nullable: true })
  contactName: string;

  @Column({ nullable: true })
  phoneNumber: string;
}
