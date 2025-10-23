import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { MadresModule } from './modules/madres/madres.module';
import { TernerosModule } from './modules/terneros/terneros.module';
import { EventosModule } from './modules/eventos/eventos.module';
import { TratamientosModule } from './modules/tratamientos/tratamientos.module';
// import { TernerosTratamientosModule } from './modules/terneros-tratamientos/terneros-tratamientos.module'; // ⚠️ COMENTADO: Módulo legacy con errores
import { DiarreaTernerosModule } from './modules/diarrea-terneros/diarrea-terneros.module';
import { ResumenSaludModule } from './modules/resumen-salud/resumen-salud.module';
import { EstablecimientosModule } from './modules/establecimientos/establecimientos.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.name'),
        synchronize: false,
        autoLoadEntities: true,
      }),
    }),
    UsersModule,
    AuthModule,
    MadresModule,
    TernerosModule,
    EventosModule,
    TratamientosModule,
    // TernerosTratamientosModule, // ⚠️ COMENTADO: Módulo legacy con errores
    DiarreaTernerosModule,
    ResumenSaludModule,
    EstablecimientosModule,
    RodeosModule, // ⬅️ AGREGAR ESTO
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
