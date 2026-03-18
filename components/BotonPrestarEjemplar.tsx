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
  const [dni, setDni] = useState("");
  const [usuario, setUsuario] = useState<any>(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const buscarLector = async () => {
    setError("");
    setUsuario(null);
    if (!dni) return;

    try {
      const res = await fetch(`http://localhost:5078/api/usuarios/buscar/${dni}`);
      if (res.ok) {
        setUsuario(await res.json());
      } else {
        setError("Lector no encontrado. Verificá el DNI.");
      }
    } catch (err) {
      setError("Error de conexión.");
    }
  };

  const confirmarPrestamo = async () => {
    if (!usuario) return;
    setCargando(true);

    try {
      const res = await fetch("http://localhost:5078/api/prestamos/prestar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ejemplarId: ejemplarId,
          usuarioId: usuario.id
        })
      });

      if (res.ok) {
        alert("¡Préstamo registrado con éxito!");
        setAbierto(false); // Cerramos el modal
        setDni("");
        setUsuario(null);
        router.refresh(); // Magia de Next.js: recarga la tabla de fondo para actualizar el stock
      } else {
        const data = await res.json();
        alert("Error: " + data.mensaje);
      }
    } catch (error) {
      alert("Error de conexión al intentar guardar.");
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
            <p className="text-sm text-gray-500 mb-5">
              Ejemplar <strong>Nº {numeroInventario}</strong> • {tituloLibro}
            </p>

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">DNI del Lector</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  className="border border-gray-300 p-2 rounded flex-1 focus:ring-2 focus:ring-purple-500 outline-none"
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && buscarLector()}
                  placeholder="Ej: 45123456"
                  autoFocus
                />
                <button onClick={buscarLector} className="bg-gray-100 hover:bg-gray-200 border border-gray-300 px-4 py-2 rounded font-medium text-gray-700 transition">
                  Buscar
                </button>
              </div>
              {error && <p className="text-red-500 text-sm mt-2 font-medium">{error}</p>}
            </div>

            {/* Si el lector existe, mostramos sus datos en verde */}
            {usuario && (
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-5">
                <p className="text-xs text-green-700 font-bold uppercase tracking-wider mb-1">✓ Lector Habilitado</p>
                <p className="text-lg font-bold text-green-900">{usuario.nombre} {usuario.apellido}</p>
                {usuario.rol === 0 && <p className="text-sm text-green-800 font-medium">Curso: {usuario.anio} "{usuario.division}"</p>}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button onClick={() => setAbierto(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 font-medium rounded transition">
                Cancelar
              </button>
              <button 
                onClick={confirmarPrestamo}
                disabled={!usuario || cargando}
                className={`px-5 py-2 rounded font-bold text-white transition ${(!usuario || cargando) ? 'bg-gray-300 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 shadow-md'}`}
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