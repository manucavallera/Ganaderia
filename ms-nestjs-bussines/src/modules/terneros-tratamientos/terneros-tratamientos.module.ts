import { Module } from '@nestjs/common';
import { TernerosTratamientosService } from './terneros-tratamientos.service';
import { TernerosTratamientosController } from './terneros-tratamientos.controller';
import { TerneroTratamientoEntity } from './entities/terneros-tratamiento.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TerneroEntity } from '../terneros/entities/ternero.entity';
import { TratamientoEntity } from '../tratamientos/entities/tratamiento.entity';
import { JwtStrategy } from '../auth/jwt.strategy';

@Module({
  imports:[TypeOrmModule.forFeature([TerneroTratamientoEntity,TerneroEntity,TratamientoEntity])],
  controllers: [TernerosTratamientosController],
  providers: [TernerosTratamientosService,JwtStrategy],
})
export class TernerosTratamientosModule {}
