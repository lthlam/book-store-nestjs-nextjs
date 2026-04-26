import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Province } from './province.entity';

@Entity('wards')
export class Ward {
  @PrimaryColumn()
  code: string;

  @Column()
  name: string;

  @ManyToOne(() => Province, (province) => province.wards, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'provinceCode' })
  province: Province;

  @Column()
  provinceCode: string;
}
