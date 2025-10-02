import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsNotEmpty, IsNumber } from "class-validator";

export class CreateTernerosTratamientoDto {
    
    @ApiProperty({ description: 'ID del ternero', example: 5 })
    @IsNotEmpty()
    @IsNumber()
    id_ternero: number;
  
    @ApiProperty({ description: 'ID del tratamiento', example: 2 })
    @IsNotEmpty()
    @IsNumber()
    id_tratamiento: number;
  
    @ApiProperty({ description: 'Fecha de aplicación del tratamiento', example: '2024-02-27' })
    @IsNotEmpty()
    @IsDate()
    fecha_aplicacion: Date;
  

}
