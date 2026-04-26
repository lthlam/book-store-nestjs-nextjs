import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  DeleteDateColumn,
} from 'typeorm';
import { Genre } from '../../genres/entities/genre.entity';
import { Author } from '../../authors/entities/author.entity';
import { Publisher } from '../../publishers/entities/publisher.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @ManyToOne(() => Genre, (genre) => genre.products)
  genre: Genre;

  @ManyToOne(() => Author, (author) => author.products)
  author: Author;

  @ManyToOne(() => Publisher, (publisher) => publisher.products)
  publisher: Publisher;

  @Column()
  image: string;

  @Column('text')
  description: string;

  @Column('decimal')
  price: number;

  @Column({ default: false })
  special: boolean;

  @Column({ default: 0 })
  soldCount: number;

  @Column()
  year: number;

  @Column('decimal', { precision: 2, scale: 1, default: 0 })
  rating: number;

  @Column({ default: 0 })
  reviewCount: number;

  @DeleteDateColumn()
  deletedAt: Date;
}
