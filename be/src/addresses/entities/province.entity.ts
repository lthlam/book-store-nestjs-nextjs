import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Ward } from './ward.entity';

@Entity('provinces')
export class Province {
  @PrimaryColumn()
  code: string;

  @Column()
  name: string;

  @Column()
  shortName: string;

  @Column()
  type: string;

  @OneToMany(() => Ward, (ward) => ward.province)
  wards: Ward[];
}
