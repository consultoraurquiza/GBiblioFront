"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NuevoMaterialPanol() {
  const router = useRouter();

  // Estados del Material
  const [nombre, setNombre] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [numeroSerie, setNumeroSerie] = useState("");
  const [ubicacionFisica, setUbicacionFisica] = useState("");
  
  // Por defecto arranca en 1 (ideal para proyectores o notebooks)
  const [cantidadTotal, setCantidadTotal] = useState("1");
  
  const [cargando, setCargando] = useState(false);

  const guardarMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cantidad = parseInt(cantidadTotal);
    if (isNaN(cantidad) || cantidad <= 0) {
      alert("La cantidad debe ser un número mayor a cero.");
      return;
    }

    // Pequeña validación lógica de escuela:
    if (numeroSerie.trim() !== "" && cantidad > 1) {
      const confirmar = window.confirm(
        "⚠️ Atención: Ingresaste un Número de Serie pero pusiste más de 1 en cantidad. " +
        "Los números de serie son únicos por aparato. ¿Estás seguro de querer guardar este lote entero con el mismo número de serie?"
      );
      if (!confirmar) return;
    }

    setCargando(true);

    // Armamos el objeto tal cual lo espera tu backend en C#
    const payload = {
      nombre,
      marca,
      modelo,
      numeroSerie,
      ubicacionFisica,
      cantidadTotal: cantidad,
      cantidadDisponible: cantidad // Cuando ingresa nuevo, todo está disponible
    };

    try {
      const res = await fetch("http://localhost:5078/api/materiales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("¡Material ingresado al Pañol correctamente!");
        // Redirigimos al inventario del pañol (ajustá esta ruta si es necesario)
        router.push("/panol"); 
      } else {
        const errorData = await res.json();
        alert("Error al guardar: " + (errorData.mensaje || "Revisá los datos."));
      }
    } catch (error) {
      console.error("Error:", error);
      alert("No se pudo conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 text-black">
      {/* NAV CON COLOR AZUL PARA DIFERENCIAR DEL CATÁLOGO DE LIBROS */}
      <nav className="bg-blue-900 text-white p-4 mb-4 shadow-md print:hidden">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔌</span>
            <h1 className="text-xl font-bold tracking-wider">PAÑOL TECNOLÓGICO</h1>
          </div>
          <Link href="/panol" className="bg-blue-800 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-bold transition border border-blue-700 shadow-sm">
            Volver al Inventario
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-200 border-t-4 border-t-blue-600 mt-6">
        <div className="border-b border-gray-200 pb-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Ingresar Nuevo Equipo o Material</h1>
          <p className="text-gray-500 text-sm mt-1">Completá los datos para registrar un elemento en el inventario físico.</p>
        </div>

        <form onSubmit={guardarMaterial} className="space-y-8">
          
          {/* SECCIÓN 1: IDENTIFICACIÓN DEL EQUIPO */}
          <section>
            <h2 className="text-lg font-bold text-blue-900 mb-4 bg-blue-50 p-3 rounded-lg border border-blue-100 flex items-center gap-2">
              <span>1️⃣</span> Identificación del Material
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1">Nombre del Material *</label>
                <input 
                  type="text" required 
                  placeholder="Ej: Proyector Epson, Caja de Calculadoras, Alargue 5mts..." 
                  className="w-full border-2 border-gray-300 p-3 rounded-lg focus:ring-0 focus:border-blue-500 outline-none font-bold text-blue-900 bg-blue-50/30 text-lg" 
                  value={nombre} 
                  onChange={(e) => setNombre(e.target.value)} 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Marca</label>
                <input 
                  type="text" 
                  placeholder="Ej: Epson, Casio, Exo..." 
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                  value={marca} 
                  onChange={(e) => setMarca(e.target.value)} 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Modelo</label>
                <input 
                  type="text" 
                  placeholder="Ej: PowerLite S31" 
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                  value={modelo} 
                  onChange={(e) => setModelo(e.target.value)} 
                />
              </div>

              <div className="col-span-1 md:col-span-2 bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-inner">
                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Número de Serie</label>
                <p className="text-xs text-gray-500 mb-2">Fundamental para garantías o para identificar aparatos costosos únicos (Notebooks, Proyectores).</p>
                <input 
                  type="text" 
                  placeholder="SN: 4390284X..." 
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono font-bold text-gray-800" 
                  value={numeroSerie} 
                  onChange={(e) => setNumeroSerie(e.target.value)} 
                />
              </div>

            </div>
          </section>

          {/* SECCIÓN 2: INVENTARIO Y UBICACIÓN */}
          <section>
            <h2 className="text-lg font-bold text-blue-900 mb-4 bg-blue-50 p-3 rounded-lg border border-blue-100 flex items-center gap-2">
              <span>2️⃣</span> Inventario y Ubicación Física
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 shadow-inner">
                <label className="block text-sm font-bold text-yellow-900 mb-1 uppercase tracking-wide">Cantidad que ingresa *</label>
                <p className="text-[11px] text-yellow-700 mb-3">Si tiene Nº de Serie, poné 1. Si son cables genéricos, poné el total.</p>
                <input 
                  type="number" required min="1"
                  className="w-full border-2 border-yellow-300 p-3 rounded-lg focus:ring-0 focus:border-yellow-500 outline-none font-bold text-2xl text-center text-yellow-900" 
                  value={cantidadTotal} 
                  onChange={(e) => setCantidadTotal(e.target.value)} 
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-inner">
                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Ubicación Física</label>
                <p className="text-[11px] text-gray-500 mb-3">¿En qué armario, caja o sala se guarda permanentemente?</p>
                <input 
                  type="text" 
                  placeholder="Ej: Armario 2 - Preceptoría" 
                  className="w-full border-2 border-gray-300 p-3 rounded-lg focus:ring-0 focus:border-blue-500 outline-none font-medium text-gray-800 text-center" 
                  value={ubicacionFisica} 
                  onChange={(e) => setUbicacionFisica(e.target.value)} 
                />
              </div>

            </div>
          </section>

          {/* BOTONES */}
          <div className="flex flex-col md:flex-row justify-end gap-3 pt-6 border-t border-gray-200 mt-8">
            <Link href="/panol" className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition text-center order-2 md:order-1 border border-gray-200 md:border-none">
              Cancelar
            </Link>
            <button 
              type="submit" 
              disabled={cargando} 
              className={`px-10 py-3 rounded-xl font-bold text-white transition shadow-lg text-lg order-1 md:order-2 flex items-center gap-2 justify-center ${cargando ? 'bg-blue-400 cursor-wait' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {cargando ? '⏳ Guardando...' : '💾 Guardar Material'}
            </button>
          </div>

        </form>
      </div>
    </main>
  );
}