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
  
  const [abierto, setAbierto] = useState(false);
  
  // ESTADOS DEL MODO HÍBRIDO
  const [nombreLector, setNombreLector] = useState(""); 
  const [usuarioId, setUsuarioId] = useState<number | null>(null);
  
  // Datos manuales adicionales (solo se usan si usuarioId es null)
  const [cursoOAula, setCursoOAula] = useState("");
  const [telefonoManual, setTelefonoManual] = useState("");
  
  // Autocompletado
  const [sugerencias, setSugerencias] = useState<any[]>([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [buscandoUsuarios, setBuscandoUsuarios] = useState(false);

  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  // 🔍 FUNCIÓN PARA BUSCAR USUARIOS MIENTRAS ESCRIBE
  const manejarCambioLector = async (texto: string) => {
    setNombreLector(texto);
    setUsuarioId(null); // Si modifica el texto, reseteamos el ID porque ya no es la selección exacta
    if (error) setError("");

    if (texto.length >= 2) {
      setBuscandoUsuarios(true);
      try {
        const res = await fetch(`http://localhost:5078/api/usuarios/buscar?q=${texto}`);
        if (res.ok) {
          const data = await res.json();
          setSugerencias(data);
          setMostrarSugerencias(true);
        }
      } catch (e) {
        console.error("Error buscando usuarios", e);
      } finally {
        setBuscandoUsuarios(false);
      }
    } else {
      setMostrarSugerencias(false);
    }
  };

  // ✅ FUNCIÓN AL HACER CLIC EN UN USUARIO EXISTENTE
  const seleccionarUsuario = (usuario: any) => {
    setUsuarioId(usuario.id);
    // Asumiendo que tu usuario tiene 'nombre' y 'apellido'
    setNombreLector(`${usuario.nombre} ${usuario.apellido || ""}`.trim());
    setMostrarSugerencias(false);
  };

  const confirmarPrestamo = async () => {
    if (!nombreLector.trim()) {
      setError("Tenés que indicar a quién se le presta el libro.");
      return;
    }

    setCargando(true);
    setError("");

    try {
      // Usamos el DTO que armamos en C#
      const res = await fetch("http://localhost:5078/api/prestamos/prestar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ejemplarId: ejemplarId,
          usuarioId: usuarioId, // Si seleccionó alguien, viaja el ID
          nombreManual: usuarioId ? null : nombreLector, // Si no, viaja como manual
          cursoManual: usuarioId ? null : cursoOAula,
          telefonoManual: usuarioId ? null : telefonoManual
        })
      });

      if (res.ok) {
        alert("¡Préstamo registrado con éxito!");
        
        setAbierto(false); 
        setNombreLector("");
        setUsuarioId(null);
        setCursoOAula("");
        setTelefonoManual("");
        setSugerencias([]);
        
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
      <button 
        onClick={() => setAbierto(true)}
        className="bg-[var(--acento)] text-white hover:brightness-110 px-5 py-2 rounded-lg text-sm font-bold shadow-md transition disabled:opacity-50"
      >
        Prestar
      </button>

      {abierto && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-md w-full text-left border-t-4 border-purple-600 relative">
            <h3 className="text-xl font-bold mb-1 text-gray-800">Salida de Material</h3>
            <p className="text-sm text-gray-500 mb-5 pb-4 border-b border-gray-100">
              Ejemplar <strong>Nº {numeroInventario}</strong> • {tituloLibro}
            </p>

            <div className="space-y-4 mb-6">
              
              {/* CAMPO HÍBRIDO (Buscador + Manual) */}
              <div className="relative">
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  ¿Quién se lo lleva? *
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    className={`w-full border-2 p-2.5 rounded-lg focus:ring-0 outline-none font-medium transition-colors ${usuarioId ? 'border-green-500 bg-green-50 text-green-900' : 'border-gray-300 focus:border-purple-500'}`}
                    value={nombreLector}
                    onChange={(e) => manejarCambioLector(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && nombreLector && confirmarPrestamo()}
                    placeholder="Buscá un usuario o escribí un nombre..."
                    autoFocus
                  />
                  {usuarioId && (
                    <span className="absolute right-3 top-3 text-green-600 font-bold" title="Usuario Registrado">
                      ✅ Registrado
                    </span>
                  )}
                  {buscandoUsuarios && (
                    <span className="absolute right-3 top-3 text-gray-400 text-sm animate-pulse">
                      Buscando...
                    </span>
                  )}
                </div>

                {/* SUGERENCIAS DE USUARIOS */}
                {mostrarSugerencias && sugerencias.length > 0 && (
                  <ul className="absolute z-10 w-full mt-1 bg-white rounded-xl shadow-xl border border-gray-200 max-h-48 overflow-y-auto">
                    {sugerencias.map((user) => (
                      <li 
                        key={user.id} 
                        className="p-3 hover:bg-purple-50 cursor-pointer border-b last:border-0"
                        onClick={() => seleccionarUsuario(user)}
                      >
                        <div className="font-bold text-gray-800">{user.nombre} {user.apellido}</div>
                        <div className="text-xs text-gray-500">
                          {user.dni ? `DNI: ${user.dni}` : ""} {user.curso ? `• Curso: ${user.curso}` : ""}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* CAMPOS MANUALES: Se muestran SOLO si no hay usuario oficial seleccionado */}
              {!usuarioId && nombreLector.length > 0 && (
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3 animate-fade-in">
                  <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-2">
                    Carga Rápida (Usuario Temporal)
                  </p>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">
                      Curso / Aula (Opcional)
                    </label>
                    <input 
                      type="text" 
                      className="w-full border border-gray-300 p-2 rounded-lg focus:border-purple-500 outline-none text-sm text-gray-700"
                      value={cursoOAula}
                      onChange={(e) => setCursoOAula(e.target.value)}
                      placeholder="Ej: 5to B / Sala de Maestros"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">
                      Teléfono (Opcional)
                    </label>
                    <input 
                      type="text" 
                      className="w-full border border-gray-300 p-2 rounded-lg focus:border-purple-500 outline-none text-sm text-gray-700"
                      value={telefonoManual}
                      onChange={(e) => setTelefonoManual(e.target.value)}
                      placeholder="Ej: 341 555-1234"
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded text-sm font-bold mt-2">
                  ⚠️ {error}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button 
                onClick={() => {
                  setAbierto(false);
                  setError(""); 
                }} 
                className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-5 py-2 rounded-lg text-sm font-bold transition"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmarPrestamo}
                disabled={cargando || !nombreLector.trim()}
                className={`px-5 py-2 rounded font-bold text-white transition ${(!nombreLector.trim() || cargando) ? 'bg-purple-300 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 shadow-md'}`}
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