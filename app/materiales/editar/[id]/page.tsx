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

  // CONFIGURACIÓN Y TEMA
  const [config, setConfig] = useState<any>(null);
  const claseTema = config ? `tema-${config.temaId}` : 'tema-lumina';

  useEffect(() => {
    fetch("http://localhost:5078/api/configuracion")
      .then(res => res.json())
      .then(data => setConfig(data))
      .catch(err => console.error(err));
  }, []);

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

  // CLASES BASE PARA LOS INPUTS
  const inputBaseClass = `w-full border p-2.5 rounded-lg outline-none transition font-medium ${config?.temaId === 'obsidian' ? 'bg-slate-800 border-slate-700 text-white focus:border-[var(--acento)]' : 'bg-gray-50 border-gray-300 focus:ring-2 focus:ring-[var(--acento)] text-gray-900'}`;
  const labelBaseClass = `block text-sm font-bold mb-1 ${config?.temaId === 'obsidian' ? 'text-slate-400' : 'text-gray-700'}`;

  if (cargandoDatos) return <div className={`min-h-screen p-12 text-center font-bold animate-pulse text-lg transition-colors duration-700 ${claseTema} bg-[var(--bg-principal)] ${config?.temaId === 'obsidian' ? 'text-slate-400' : 'text-gray-500'}`}>Cargando datos del equipo...</div>;

  return (
    <main className={`min-h-screen transition-colors duration-700 ${claseTema} bg-[var(--bg-principal)] pb-12`}>
      <nav className="p-4 mb-4 shadow-md bg-[var(--bg-header)] text-[var(--texto-header)] transition-colors print:hidden">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✏️</span>
            <h1 className="text-xl font-bold tracking-wider">EDITAR EQUIPO</h1>
          </div>
          <Link href="/panol" className="bg-[var(--acento)] hover:brightness-110 px-4 py-2 rounded-lg text-sm font-bold text-white transition flex items-center gap-2 shadow-sm border border-[var(--acento)]">
            Cancelar
          </Link>
        </div>
      </nav>

      <div className={`max-w-4xl mx-auto p-8 rounded-2xl shadow-sm border border-t-4 transition-colors mt-6 mb-12 ${config?.temaId === 'obsidian' ? 'bg-[var(--card-bg)] border-white/10 border-t-[var(--acento)]' : 'bg-white border-gray-200 border-t-[var(--acento)]'}`}>
        <div className={`border-b pb-4 mb-6 ${config?.temaId === 'obsidian' ? 'border-white/10' : 'border-gray-200'}`}>
          <h1 className={`text-2xl font-bold ${config?.temaId === 'obsidian' ? 'text-white' : 'text-gray-800'}`}>Modificar Ficha Técnica</h1>
          <p className={`text-sm mt-1 ${config?.temaId === 'obsidian' ? 'text-slate-400' : 'text-gray-500'}`}>Registro #{id}</p>
        </div>

        <form onSubmit={guardarEdicion} className="space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2">
              <label className={labelBaseClass}>Nombre del Material *</label>
              <input 
                type="text" 
                required 
                className={inputBaseClass} 
                value={nombre} 
                onChange={(e) => setNombre(e.target.value)} 
              />
            </div>

            <div>
              <label className={labelBaseClass}>Marca</label>
              <input type="text" className={inputBaseClass} value={marca} onChange={(e) => setMarca(e.target.value)} />
            </div>

            <div>
              <label className={labelBaseClass}>Modelo</label>
              <input type="text" className={inputBaseClass} value={modelo} onChange={(e) => setModelo(e.target.value)} />
            </div>

            <div className={`col-span-1 md:col-span-2 p-4 rounded-xl border shadow-inner flex flex-col md:flex-row gap-6 ${config?.temaId === 'obsidian' ? 'bg-slate-800/50 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex-1">
                <label className={`block text-sm font-bold uppercase tracking-wide mb-1 ${config?.temaId === 'obsidian' ? 'text-slate-400' : 'text-gray-700'}`}>Número de Serie</label>
                <input 
                  type="text" 
                  className={`w-full border p-3 rounded-lg outline-none font-mono font-bold transition ${config?.temaId === 'obsidian' ? 'bg-slate-900 border-slate-700 text-slate-300 focus:border-[var(--acento)]' : 'bg-white border-gray-300 text-gray-800 focus:ring-2 focus:ring-[var(--acento)]'}`} 
                  value={numeroSerie} 
                  onChange={(e) => setNumeroSerie(e.target.value)} 
                />
              </div>
              <div className="w-full md:w-1/3">
                <label className={`block text-sm font-bold uppercase tracking-wide mb-1 ${config?.temaId === 'obsidian' ? 'text-slate-400' : 'text-gray-700'}`}>Cantidad Total</label>
                <input 
                  type="number" 
                  required 
                  min="1" 
                  className={`w-full border-2 p-3 rounded-lg outline-none font-bold text-xl text-center transition ${config?.temaId === 'obsidian' ? 'bg-slate-900 border-yellow-500/50 text-yellow-500 focus:border-yellow-400' : 'bg-white border-yellow-300 text-yellow-900 focus:ring-0 focus:border-yellow-500'}`} 
                  value={cantidadTotal} 
                  onChange={(e) => setCantidadTotal(e.target.value)} 
                />
              </div>
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className={labelBaseClass}>Ubicación Física</label>
              <input 
                type="text" 
                className={`w-full border-2 p-3 rounded-lg outline-none font-medium transition ${config?.temaId === 'obsidian' ? 'bg-slate-800 border-slate-700 text-white focus:border-[var(--acento)]' : 'bg-white border-gray-300 text-gray-800 focus:border-[var(--acento)] focus:ring-0'}`} 
                value={ubicacionFisica} 
                onChange={(e) => setUbicacionFisica(e.target.value)} 
              />
            </div>
            
            {/* NUEVA SECCIÓN: ESTADO FÍSICO */}
            <div className={`col-span-1 md:col-span-2 border-t pt-6 mt-2 ${config?.temaId === 'obsidian' ? 'border-white/10' : 'border-gray-200'}`}>
              <h2 className={`text-lg font-bold mb-4 ${config?.temaId === 'obsidian' ? 'text-white' : 'text-gray-800'}`}>Estado del Equipo</h2>
              
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/3">
                  <label className={labelBaseClass}>¿Está operativo?</label>
                  <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${habilitado ? (config?.temaId === 'obsidian' ? 'border-green-500/50 bg-green-900/20' : 'border-green-500 bg-green-50') : (config?.temaId === 'obsidian' ? 'border-red-500/50 bg-red-900/20' : 'border-red-500 bg-red-50')}`}>
                    <input type="checkbox" className={`w-6 h-6 rounded ${config?.temaId === 'obsidian' ? 'bg-slate-800 border-slate-600 focus:ring-green-500' : 'border-gray-300 focus:ring-green-500'}`} checked={habilitado} onChange={(e) => setHabilitado(e.target.checked)} />
                    <span className={`font-bold text-lg ${habilitado ? (config?.temaId === 'obsidian' ? 'text-green-400' : 'text-green-800') : (config?.temaId === 'obsidian' ? 'text-red-400' : 'text-red-800')}`}>
                      {habilitado ? '✅ Habilitado' : '❌ En Reparación'}
                    </span>
                  </label>
                  {!habilitado && <p className="text-xs text-red-500 font-bold mt-2">Este equipo NO se podrá prestar.</p>}
                </div>

                <div className="w-full md:flex-1">
                  <label className={labelBaseClass}>Observaciones / Daños</label>
                  <textarea 
                    rows={3} 
                    placeholder="Ej: Falla el puerto HDMI, lámpara en las últimas..." 
                    className={`w-full border-2 p-3 rounded-lg outline-none font-medium transition ${config?.temaId === 'obsidian' ? 'bg-slate-800 border-slate-700 text-slate-200 focus:border-[var(--acento)] placeholder-slate-600' : 'bg-white border-gray-300 text-gray-800 focus:border-[var(--acento)]'}`} 
                    value={observaciones} 
                    onChange={(e) => setObservaciones(e.target.value)} 
                  />
                </div>
              </div>
            </div>

          </div>

          <div className={`flex justify-end gap-3 pt-6 border-t mt-8 ${config?.temaId === 'obsidian' ? 'border-white/10' : 'border-gray-200'}`}>
            <button type="submit" disabled={guardando} className={`px-10 py-3.5 rounded-xl font-bold transition shadow-lg text-lg flex items-center gap-2 justify-center ${guardando ? 'bg-[var(--acento)] cursor-wait text-white' : 'bg-[var(--acento)] hover:brightness-110 text-white'}`}>
              {guardando ? '⏳ Guardando...' : '💾 Actualizar Ficha'}
            </button>
          </div>

        </form>
      </div>
    </main>
  );
}