"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PrestarEquipoPanol({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [material, setMaterial] = useState<any>(null);
  const [cantidad, setCantidad] = useState("1");
  
  // AHORA ES TEXTO LIBRE
  const [nombreSolicitante, setNombreSolicitante] = useState(""); 
  
  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const cargarMaterial = async () => {
      try {
        const res = await fetch(`http://localhost:5078/api/materiales/${id}`);
        if (res.ok) {
          const data = await res.json();
          setMaterial(data);
        } else {
          alert("No se encontró el material.");
          router.push("/panol");
        }
      } catch (error) {
        alert("Error de conexión.");
      } finally {
        setCargandoDatos(false);
      }
    };
    cargarMaterial();
  }, [id, router]);

  const registrarPrestamo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cantidadNumerica = parseInt(cantidad);
    
    if (isNaN(cantidadNumerica) || cantidadNumerica <= 0) {
      alert("La cantidad debe ser mayor a cero.");
      return;
    }
    
    if (cantidadNumerica > material.cantidadDisponible) {
      alert(`No podés prestar más de lo que hay. Stock actual: ${material.cantidadDisponible}`);
      return;
    }

    if (!nombreSolicitante.trim()) {
      alert("Debes escribir a quién se lo prestás.");
      return;
    }

    setGuardando(true);

    try {
      const res = await fetch("http://localhost:5078/api/prestamosmateriales/prestar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          materialId: parseInt(id),
          nombreSolicitante: nombreSolicitante.trim(), // Mandamos el texto
          cantidad: cantidadNumerica
        }),
      });

      if (res.ok) {
        alert("¡Préstamo registrado con éxito!");
        router.push("/panol");
      } else {
        const err = await res.json();
        alert("Error: " + (err.mensaje || "Revisá los datos."));
      }
    } catch (error) {
      alert("No se pudo conectar con el servidor.");
    } finally {
      setGuardando(false);
    }
  };

  if (cargandoDatos) return <div className="p-12 text-center text-blue-900 font-bold animate-pulse text-lg">Cargando datos del equipo...</div>;
  if (!material) return null;

  return (
    <main className="min-h-screen bg-gray-50 text-black">
      <nav className="bg-blue-900 text-white p-4 mb-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🤝</span>
            <h1 className="text-xl font-bold tracking-wider">REGISTRAR PRÉSTAMO</h1>
          </div>
          <Link href="/panol" className="bg-blue-800 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-bold transition border border-blue-700 shadow-sm">
            Cancelar
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-200 border-t-4 border-t-green-500 mt-6">
        <div className="border-b border-gray-200 pb-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Entregar al Docente</h1>
          <p className="text-gray-500 text-sm mt-1">Registrá la salida de este equipo del pañol.</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 p-5 rounded-xl mb-8 flex justify-between items-center shadow-inner">
          <div>
            <h3 className="text-xl font-black text-blue-900">{material.nombre}</h3>
            <p className="text-sm font-bold text-blue-700 uppercase tracking-wide mt-1">
              {material.marca || "S/M"} {material.modelo ? `• ${material.modelo}` : ""}
            </p>
            {material.numeroSerie && (
              <p className="text-xs font-mono text-gray-600 mt-2 bg-white inline-block px-2 py-1 rounded border border-gray-300">
                SN: {material.numeroSerie}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-gray-500 uppercase">Stock Actual</p>
            <p className="text-4xl font-black text-green-600 leading-none mt-1">{material.cantidadDisponible}</p>
          </div>
        </div>

        <form onSubmit={registrarPrestamo} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 1. SELECCIÓN DE PROFESOR (TEXTO LIBRE) */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">¿A quién se lo prestás? *</label>
              <input 
                type="text" required 
                placeholder="Ej: Prof. Juan Pérez - 3ro B" 
                className="w-full border-2 border-gray-300 p-3 rounded-lg focus:ring-0 focus:border-blue-500 outline-none font-bold text-blue-900 bg-blue-50/30" 
                value={nombreSolicitante} 
                onChange={(e) => setNombreSolicitante(e.target.value)} 
              />
              <p className="text-[11px] text-gray-500 font-medium mt-1 pl-1">
                Escribí el nombre y el curso/destino.
              </p>
            </div>

            {/* 2. CANTIDAD A LLEVARSE */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">¿Cuántos se lleva? *</label>
              <input 
                type="number" required min="1" max={material.cantidadDisponible}
                className="w-full border-2 border-green-300 p-3 rounded-lg focus:ring-0 focus:border-green-500 outline-none font-black text-2xl text-center text-green-800 bg-green-50" 
                value={cantidad} 
                onChange={(e) => setCantidad(e.target.value)} 
                disabled={material.cantidadDisponible === 1}
                title={material.cantidadDisponible === 1 ? "Solo hay 1 unidad disponible" : ""}
              />
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-gray-200 mt-8">
            <button 
              type="submit" 
              disabled={guardando} 
              className={`px-10 py-3.5 rounded-xl font-bold text-white transition shadow-lg text-lg flex items-center gap-2 ${guardando ? 'bg-green-400 cursor-wait' : 'bg-green-600 hover:bg-green-700'}`}
            >
              {guardando ? '⏳ Procesando...' : '✅ Confirmar Entrega'}
            </button>
          </div>

        </form>
      </div>
    </main>
  );
}