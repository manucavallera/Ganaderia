import React, { useEffect, useState } from "react";
import { useBussinesMicroservicio } from "@/hooks/bussines";

const ListadoTerneroTratamiento = () => {
  const { obtenerTratamientoTerneroHook } = useBussinesMicroservicio();
  const [tratamientosTernero, setTratamientoTernero] = useState([]);

  const cargarTratamientoTerneroList = async () => {
    const resTratamientoTernero = await obtenerTratamientoTerneroHook();
    setTratamientoTernero(resTratamientoTernero?.data || []);
  };

  useEffect(() => {
    cargarTratamientoTerneroList();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="relative flex flex-col w-full h-full overflow-scroll text-slate-300 bg-slate-800 shadow-lg rounded-xl p-6">
        <h2 className="text-3xl font-bold mb-6 text-center text-gradient-to-r from-indigo-400 to-indigo-600">
          Listado de Tratamientos a Terneros
        </h2>
        <table className="w-full text-left table-auto min-w-max bg-gradient-to-b from-gray-800 via-gray-700 to-gray-800 border-separate border-spacing-0 rounded-lg shadow-2xl">
          <thead className="bg-slate-900">
            <tr>
              <th className="px-4 py-2 border-b border-slate-600 bg-slate-700">ID Ternero Tratamiento</th>
              <th className="px-4 py-2 border-b border-slate-600 bg-slate-700">Fecha Aplicacion</th>
              <th className="px-4 py-2 border-b border-slate-600 bg-slate-700">Ternero</th>
              <th className="px-4 py-2 border-b border-slate-600 bg-slate-700">Tratamiento</th>
            </tr>
          </thead>
          <tbody className="text-slate-300">
            {tratamientosTernero.map((tratamientoTernero) => (
              <tr key={tratamientoTernero.id_ternero_tratamiento} className="hover:bg-slate-600 transition-all duration-300">
                <td className="px-4 py-2 border-b border-slate-700">{tratamientoTernero.id_ternero_tratamiento}</td>
                <td className="px-4 py-2 border-b border-slate-700">{tratamientoTernero.fecha_aplicacion}</td>
                <td className="px-4 py-2 border-b border-slate-700">
                  <ul className="list-disc pl-5">
                    <li className="text-sm">RP_TERNERO: {tratamientoTernero.ternero.rp_ternero}</li>
                    <li className="text-sm">SEXO: {tratamientoTernero.ternero.sexo}</li>
                    <li className="text-sm">
                      <p className={`text-sm font-semibold ${tratamientoTernero.ternero.estado === "Vivo" ? "text-green-400" : "text-red-400"}`}>
                        ESTADO: {tratamientoTernero.ternero.estado}
                      </p>
                    </li>
                    <li className="text-sm">PESO_NACER: {tratamientoTernero.ternero.peso_nacer}</li>
                    <li className="text-sm">PESO_15DIAS: {tratamientoTernero.ternero.peso_15d}</li>
                    <li className="text-sm">PESO_30DIAS: {tratamientoTernero.ternero.peso_30d}</li>
                    <li className="text-sm">PESO_45DIAS: {tratamientoTernero.ternero.peso_45d}</li>
                    <li className="text-sm">PESO_LARGADO: {tratamientoTernero.ternero.peso_largado}</li>
                    <li className="text-sm">ESTIMATIVO: {tratamientoTernero.ternero.estimativo}</li>
                    <li className="text-sm">OBSERVACIONES: {tratamientoTernero.ternero.observaciones}</li>
                    <li className="text-sm">FECHA_NACIMIENTO: {tratamientoTernero.ternero.fecha_nacimiento}</li>
                  </ul>
                </td>
                <td className="px-4 py-2 border-b border-slate-700">
                  <ul className="list-disc pl-5">
                    <li className="text-sm">ID Tratamiento: {tratamientoTernero.tratamiento.id_tratamiento}</li>
                    <li className="text-sm">Nombre: {tratamientoTernero.tratamiento.nombre}</li>
                    <li className="text-sm">Descripción: {tratamientoTernero.tratamiento.descripcion}</li>
                    <li className="text-sm">Fecha Tratamiento: {tratamientoTernero.tratamiento.fecha_tratamiento}</li>
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListadoTerneroTratamiento;
