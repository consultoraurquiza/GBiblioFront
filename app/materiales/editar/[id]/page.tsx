"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EditarMaterialPanol({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [nombre, setNombre] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [numeroSerie, setNumeroSerie] = useState("");
  const [ubicacionFisica, setUbicacionFisica] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [cantidadTotal, setCantidadTotal] = useState("1");
  const [habilitado, setHabilitado] = useState(true);
  
  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const cargarMaterial = async () => {
      try {
        const res = await fetch(`http://localhost:5078/api/materiales/${id}`);
        if (res.ok) {
          const data = await res.json();
          setNombre(data.nombre);
          setMarca(data.marca || "");
          setModelo(data.modelo || "");
          setNumeroSerie(data.numeroSerie || "");
          setUbicacionFisica(data.ubicacionFisica || "");
          setObservaciones(data.observaciones || "");
          setCantidadTotal(data.cantidadTotal.toString());
          // Si es un material viejo que no tenía el campo, por defecto lo ponemos true
          setHabilitado(data.habilitado !== false); 
        } else {
          alert("Material no encontrado.");
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

  const guardarEdicion = async (e: React.FormEvent) => {
    e.preventDefault();
    const cantidad = parseInt(cantidadTotal);
    
    if (isNaN(cantidad) || cantidad <= 0) {
      alert("La cantidad total debe ser mayor a cero."); return;
    }

    setGuardando(true);

    const payload = {
      id: parseInt(id),
      nombre, marca, modelo, numeroSerie, ubicacionFisica, observaciones,
      habilitado,
      cantidadTotal: cantidad
    };

    try {
      const res = await fetch(`http://localhost:5078/api/materiales/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("¡Ficha del equipo actualizada!");
        router.push("/panol");
      } else {
        const errorData = await res.json();
        alert("Error al guardar: " + (errorData.mensaje || "Revisá los datos."));
      }
    } catch (error) {
      alert("No se pudo conectar con el servidor.");
    } finally {
      setGuardando(false);
    }
  };

  if (cargandoDatos) return <div className="p-12 text-center text-blue-900 font-bold animate-pulse text-lg">Cargando datos del equipo...</div>;

  return (
    <main className="min-h-screen bg-gray-50 text-black">
      <nav className="bg-blue-900 text-white p-4 mb-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✏️</span>
            <h1 className="text-xl font-bold tracking-wider">EDITAR EQUIPO</h1>
          </div>
          <Link href="/panol" className="bg-blue-800 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-bold transition border border-blue-700">
            Cancelar
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-200 border-t-4 border-t-yellow-500 mt-6">
        <div className="border-b border-gray-200 pb-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Modificar Ficha Técnica</h1>
          <p className="text-gray-500 text-sm mt-1">Registro #{id}</p>
        </div>

        <form onSubmit={guardarEdicion} className="space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-1">Nombre del Material *</label>
              <input type="text" required className="w-full border-2 border-gray-300 p-3 rounded-lg focus:ring-0 focus:border-blue-500 outline-none font-bold text-blue-900 bg-blue-50/30 text-lg" value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Marca</label>
              <input type="text" className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={marca} onChange={(e) => setMarca(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Modelo</label>
              <input type="text" className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={modelo} onChange={(e) => setModelo(e.target.value)} />
            </div>

            <div className="col-span-1 md:col-span-2 bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-inner flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Número de Serie</label>
                <input type="text" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono font-bold text-gray-800" value={numeroSerie} onChange={(e) => setNumeroSerie(e.target.value)} />
              </div>
              <div className="w-full md:w-1/3">
                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Cantidad Total</label>
                <input type="number" required min="1" className="w-full border-2 border-yellow-300 p-3 rounded-lg focus:ring-0 focus:border-yellow-500 outline-none font-bold text-xl text-center text-yellow-900" value={cantidadTotal} onChange={(e) => setCantidadTotal(e.target.value)} />
              </div>
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-1">Ubicación Física</label>
              <input type="text" className="w-full border-2 border-gray-300 p-3 rounded-lg focus:ring-0 focus:border-blue-500 outline-none font-medium text-gray-800" value={ubicacionFisica} onChange={(e) => setUbicacionFisica(e.target.value)} />
            </div>
            
            {/* NUEVA SECCIÓN: ESTADO FÍSICO */}
            <div className="col-span-1 md:col-span-2 border-t border-gray-200 pt-6 mt-2">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Estado del Equipo</h2>
              
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/3">
                  <label className="block text-sm font-bold text-gray-700 mb-2">¿Está operativo?</label>
                  <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${habilitado ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                    <input type="checkbox" className="w-6 h-6 rounded border-gray-300" checked={habilitado} onChange={(e) => setHabilitado(e.target.checked)} />
                    <span className={`font-bold text-lg ${habilitado ? 'text-green-800' : 'text-red-800'}`}>
                      {habilitado ? '✅ Habilitado' : '❌ En Reparación'}
                    </span>
                  </label>
                  {!habilitado && <p className="text-xs text-red-600 font-bold mt-2">Este equipo NO se podrá prestar.</p>}
                </div>

                <div className="w-full md:flex-1">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Observaciones / Daños</label>
                  <textarea rows={3} placeholder="Ej: Falla el puerto HDMI, lámpara en las últimas..." className="w-full border-2 border-gray-300 p-3 rounded-lg focus:ring-0 focus:border-blue-500 outline-none font-medium text-gray-800" value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
                </div>
              </div>
            </div>

          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-8">
            <button type="submit" disabled={guardando} className={`px-10 py-3.5 rounded-xl font-bold text-white transition shadow-lg text-lg flex items-center gap-2 justify-center ${guardando ? 'bg-yellow-400 cursor-wait' : 'bg-yellow-500 hover:bg-yellow-600'}`}>
              {guardando ? '⏳ Guardando...' : '💾 Actualizar Ficha'}
            </button>
          </div>

        </form>
      </div>
    </main>
  );
}