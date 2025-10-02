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

  @Column({ nullable: false, type: 'varchar', length: 50 })
  severidad: string;

  @Column({ nullable: false, type: 'varchar', length: 100 })
  rp_ternero: string; // ⬅️ NUEVO: RP del ternero

  @Column({ nullable: false, type: 'int', default: 1 })
  numero_episodio: number; // ⬅️ NUEVO: Contador de episodios

  @Column({ nullable: true, type: 'text' })
  observaciones: string; // ⬅️ NUEVO: Observaciones médicas

  // ⬅️ MANTENER: Relación original para integridad referencial
  @ManyToOne(() => TerneroEntity, (ternero) => ternero.diarreas, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'id_ternero' })
  ternero: TerneroEntity;

  // ⬅️ NUEVO: Métodos de conveniencia
  /**
   * Verifica si es el primer episodio de diarrea para este ternero
   */
  esPrimerEpisodio(): boolean {
    return this.numero_episodio === 1;
  }

  /**
   * Determina el nivel de severidad numérico para comparaciones
   */
  getSeveridadNivel(): number {
    const niveles = {
      Leve: 1,
      Moderada: 2,
      Severa: 3,
      Crítica: 4,
    };
    return niveles[this.severidad] || 0;
  }

  /**
   * Indica si requiere atención veterinaria urgente
   */
  requiereAtencionUrgente(): boolean {
    return this.severidad === 'Severa' || this.severidad === 'Crítica';
  }
}
