"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  ejemplarId: number;
  numeroInventario: string;
  tituloLibro: string;
}

export default function BotonPrestarEjemplar({ ejemplarId, numeroInventario, tituloLibro }: Props) {
  const router = useRouter();
  
  // Estados para controlar la ventana flotante (Modal)
  const [abierto, setAbierto] = useState(false);
  
  // NUEVOS ESTADOS: Datos manuales del préstamo
  const [nombreLector, setNombreLector] = useState("");
  const [cursoOAula, setCursoOAula] = useState("");
  
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const confirmarPrestamo = async () => {
    // Validación básica: al menos necesitamos saber quién se lo lleva
    if (!nombreLector.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }

    setCargando(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5078/api/prestamos/prestar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ejemplarId: ejemplarId,
          nombreLector: nombreLector,
          cursoOAula: cursoOAula
        })
      });

      if (res.ok) {
        alert("¡Préstamo registrado con éxito!");
        // Limpiamos todo
        setAbierto(false); 
        setNombreLector("");
        setCursoOAula("");
        // Magia de Next.js: recarga la tabla de fondo para actualizar el stock
        router.refresh(); 
      } else {
        const data = await res.json();
        setError("Error: " + data.mensaje);
      }
    } catch (error) {
      setError("Error de conexión al intentar guardar.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <>
      {/* El botón que se ve en la tabla */}
      <button 
        onClick={() => setAbierto(true)}
        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-medium transition shadow-sm"
      >
        Prestar
      </button>

      {/* La ventana oscura que flota por encima (Modal) */}
      {abierto && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-md w-full text-left border-t-4 border-purple-600">
            <h3 className="text-xl font-bold mb-1 text-gray-800">Salida de Material</h3>
            <p className="text-sm text-gray-500 mb-5 pb-4 border-b border-gray-100">
              Ejemplar <strong>Nº {numeroInventario}</strong> • {tituloLibro}
            </p>

            {/* FORMULARIO MANUAL RÁPIDO */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  ¿Quién se lo lleva? *
                </label>
                <input 
                  type="text" 
                  className="w-full border-2 border-gray-300 p-2.5 rounded-lg focus:border-purple-500 focus:ring-0 outline-none font-medium"
                  value={nombreLector}
                  onChange={(e) => {
                    setNombreLector(e.target.value);
                    if(error) setError(""); // Limpiamos el error si empieza a escribir
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && nombreLector && confirmarPrestamo()}
                  placeholder="Ej: Mateo / Prof. Gómez"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Curso / Aula (Opcional)
                </label>
                <input 
                  type="text" 
                  className="w-full border-2 border-gray-300 p-2.5 rounded-lg focus:border-purple-500 focus:ring-0 outline-none font-medium text-gray-600"
                  value={cursoOAula}
                  onChange={(e) => setCursoOAula(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && nombreLector && confirmarPrestamo()}
                  placeholder="Ej: 5to B / Sala de Maestros"
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded text-sm font-bold mt-2">
                  ⚠️ {error}
                </div>
              )}
            </div>

            {/* BOTONERA */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button 
                onClick={() => {
                  setAbierto(false);
                  setError(""); // Limpiamos errores si cancela
                }} 
                className="px-4 py-2 text-gray-500 hover:bg-gray-100 font-medium rounded transition"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmarPrestamo}
                disabled={cargando || !nombreLector.trim()}
                className={`px-5 py-2 rounded font-bold text-white transition ${(!nombreLector.trim() || cargando) ? 'bg-gray-300 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 shadow-md'}`}
              >
                {cargando ? 'Procesando...' : 'Confirmar Préstamo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}