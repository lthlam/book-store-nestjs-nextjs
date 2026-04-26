import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class ContactMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  subject: string;

  @Column('text')
  message: string;

  @Column({ default: 'new' })
  status: 'new' | 'read' | 'replied';

  @CreateDateColumn()
  createdAt: Date;
}
