import { TerneroEntity } from 'src/modules/terneros/entities/ternero.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('diarrea_terneros')
export class DiarreaTerneroEntity {
  @PrimaryGeneratedColumn()
  id_diarrea_ternero: number;

  @Column({ type: 'date', nullable: false })
  fecha_diarrea_ternero: Date;

  @Column({ nullable: false, type: 'varchar' })
  severidad: string;

  @ManyToOne(() => TerneroEntity, (ternero) => ternero.diarreas, {
    onDelete: 'SET NULL', // Permite que id_ternero quede NULL al eliminar la madre
    nullable: true, // Hace que el campo pueda aceptar valores nulos
  })
  @JoinColumn({ name: 'id_ternero' })
  ternero: TerneroEntity;
}
