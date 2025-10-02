import { EventoEntity } from "src/modules/eventos/entities/evento.entity";
import { PadreEntity } from "src/modules/padres/entities/padre.entity";
import { TerneroEntity } from "src/modules/terneros/entities/ternero.entity";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('madres')
export class MadreEntity {
    
    @PrimaryGeneratedColumn()
    id_madre: number;
  
    @Column({nullable:false,type: 'varchar'})
    nombre: string;

    @Column({nullable:false,type: 'integer'})
    rp_madre: number;

    @Column({ type: "enum", enum: ["Seca", "En Tambo"] })
    estado: string;

    @Column({nullable:false,type: 'varchar'})
    observaciones: string;

    @Column({ type: 'date',nullable:false})
    fecha_nacimiento: Date;
    
    // Relación de 1 a muchos con Ternero
    @OneToMany(() => TerneroEntity, (ternero) => ternero.madre, { onDelete: 'CASCADE' })
    terneros: TerneroEntity[];

    // Relación de muchos a muchos con Evento
    @ManyToMany(()=> EventoEntity,(evento) => evento.madres)
    eventos: EventoEntity[];

    @ManyToMany(() => PadreEntity,(padre) => padre.madres,{
        onDelete: 'SET NULL', // Permite que id_padre quede NULL al eliminar la padre
        nullable: true // Hace que el campo pueda aceptar valores nulos
    })
    @JoinTable({
    name: 'madres_padres', // Nombre de la tabla intermedia
    joinColumn: { name: 'madre_id', referencedColumnName: 'id_madre' },
    inverseJoinColumn: { name: 'padre_id', referencedColumnName: 'id_padre' }
    })
    padres: PadreEntity[];
    

}

