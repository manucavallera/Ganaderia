import { useForm } from 'react-hook-form';
import React,{useState} from 'react';
import { useBussinesMicroservicio } from '@/hooks/bussines';
import SeleccionarMadre from './Select-Madre';
import SeleccionarTernero from './Select-Ternero';

const FormularioEvento = ({ setStep }) => {

  const {crearEventoHook} = useBussinesMicroservicio();
  
  const { register, handleSubmit, formState: { errors }, setValue ,reset} = useForm();
  const [eventoAlert, setEventoAlert] = useState({ status: false, message: "",estado:true });
  const [terneros, setTerneros] = useState([]);
  const [madres, setMadres] = useState([]);


  const handleObetenerMadre = (id) => {
    var idMadre = parseInt(id);
    setMadres([...madres,idMadre]);
  }

  const handleObetenerTernero = (id) => {
    var idTernero = parseInt(id);
    setTerneros([...terneros,idTernero]);
  }


  const onSubmit = async (data) => {
    let newEvento= {
      "fecha_evento": data.fecha_evento,
      "observacion": data.observacion,
      "id_ternero":terneros,
      "id_madre":madres 
    }
    
    if(newEvento.id_ternero.length ===0){
       setEventoAlert({ status: true, message: "POR FAVOR, INGRESAR AL MENOS UN TERNERO", estado:false });
    }else if(newEvento.id_madre.length ===0){
       setEventoAlert({ status: true, message: "POR FAVOR, INGRESAR AL MENOS UNA MADRE", estado:false });
    }else{
      const resEventoCreado = await crearEventoHook(newEvento);
      if(resEventoCreado?.status == 201){
         setEventoAlert({ status: true, message: "SE HA RESGISTRADO EL EVENTO CORRECTAMENTE",estado:true });
         reset();
         setTerneros();
         setMadres();
      }else{
          setEventoAlert({ status: true, message: "ERROR 401, SESSION CADUCADA", estado:false });
          reset();
          setTerneros();
          setMadres();
      }

     // Aquí puedes procesar los datos del evento
      // Puedes enviarlo a tu API o manejar los datos localmente
     /*  setStep(4); */ // Ir al siguiente formulario de Evento
    }
  };


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md mb-10 mt-10">
        <h2 className="text-2xl font-bold text-center mb-6">Formulario Evento</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label htmlFor="fecha_evento" className="block text-sm font-medium text-gray-700">Fecha del Evento</label>
            <input
              type="date"
              id="fecha_evento"
              {...register("fecha_evento", { required: "Este campo es obligatorio" })}
              className="w-full p-3 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.fecha_evento && <span className="text-red-500 text-sm">{errors.fecha_evento.message}</span>}
          </div>

          <div className="mb-4">
            <label htmlFor="observacion" className="block text-sm font-medium text-gray-700">Observaciones</label>
            <textarea
              id="observacion"
              {...register("observacion", { required: "Este campo es obligatorio" })}
              placeholder="Observaciones"
              className="w-full p-3 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.observacion && <span className="text-red-500 text-sm">{errors.observacion.message}</span>}
          </div>

          <div className="mb-4">
            <label htmlFor="ternero" className="block text-sm font-medium text-gray-700">Seleccionar Ternero</label>
            <SeleccionarTernero terneroSeleccionado={handleObetenerTernero}/>
          </div>

          <div className="mb-4">
            <label htmlFor="madre" className="block text-sm font-medium text-gray-700">Seleccionar Madre</label>
            <SeleccionarMadre madreSeleccionada={handleObetenerMadre}/>
          </div>

          <div className="mt-6 text-center">
            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Enviar
            </button>
          </div>
        </form>
        {eventoAlert.status && (
          <p
            className={`text-white text-center text-sm font-semibold p-2 rounded-md shadow-md mt-2 
              ${eventoAlert.estado ? 'bg-green-500' : 'bg-red-500'}`}
          >
            {eventoAlert.message}
          </p>
        )}
      </div>
    </div>
  );
};

export default FormularioEvento;


