import Link from "next/link";

async function getMateriales() {
  const res = await fetch("http://localhost:5078/api/materiales", {
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

async function getConfiguracion() {
  try {
    const res = await fetch("http://localhost:5078/api/configuracion", {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    return null;
  }
}

export default async function InventarioPanol() {
  const materiales = await getMateriales();
  const config = await getConfiguracion();
  
  const claseTema = config ? `tema-${config.temaId}` : 'tema-lumina';

  return (
    <main className={`min-h-screen transition-colors duration-700 ${claseTema} bg-[var(--bg-principal)] pb-12`}>
      
      {/* NAV SINCRONIZADA AL TEMA GLOBAL */}
      <nav className="p-4 shadow-md transition-colors print:hidden bg-[var(--bg-header)] text-[var(--texto-header)]">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔌</span>
            <h1 className="text-xl font-bold tracking-wider">PAÑOL TECNOLÓGICO</h1>
          </div>
          <Link href="/admin" className="bg-[var(--acento)] hover:brightness-110 px-4 py-2 rounded-lg text-sm font-bold text-white transition border border-[var(--acento)] shadow-sm">
            Volver al Menú Principal
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-8">
        
        {/* CABECERA */}
        <div className={`flex justify-between items-end mb-6 border-b pb-4 ${config?.temaId === 'obsidian' ? 'border-white/10' : 'border-gray-200'}`}>
          <div>
            <h2 className={`text-3xl font-bold ${config?.temaId === 'obsidian' ? 'text-white' : 'text-gray-800'}`}>Inventario de Equipos</h2>
            <p className={`mt-1 ${config?.temaId === 'obsidian' ? 'text-slate-400' : 'text-gray-500'}`}>Gestión de proyectores, notebooks, adaptadores y materiales a granel.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/panol/prestamos" className={`border-2 border-[var(--acento)] text-[var(--acento)] px-5 py-2.5 rounded-xl font-bold transition shadow-sm flex items-center gap-2 ${config?.temaId === 'obsidian' ? 'hover:bg-slate-800' : 'hover:bg-gray-50'}`}>
              📋 Ver Equipos en Uso
            </Link>
            
            <Link href="/materiales/nuevo" className="bg-[var(--acento)] text-white hover:brightness-110 px-5 py-2.5 rounded-xl font-bold transition shadow-md flex items-center gap-2">
              ➕ Registrar Equipo
            </Link>
          </div>
        </div>

        {/* TABLA DE INVENTARIO */}
        <div className={`rounded-2xl shadow-sm border overflow-hidden bg-[var(--card-bg)] ${config?.temaId === 'obsidian' ? 'border-white/10' : 'border-gray-200'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`uppercase tracking-wider border-b ${config?.temaId === 'obsidian' ? 'bg-slate-800/80 text-slate-400 border-white/10' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                  <th className="px-6 py-4 font-bold text-xs">Equipo / Detalle</th>
                  <th className="px-6 py-4 font-bold text-xs">Nº Serie</th>
                  <th className="px-6 py-4 font-bold text-xs">Ubicación</th>
                  <th className="px-6 py-4 font-bold text-xs text-center">Stock</th>
                  <th className="px-6 py-4 font-bold text-xs text-right">Acciones Rápidas</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${config?.temaId === 'obsidian' ? 'divide-white/5' : 'divide-gray-100'}`}>
                {materiales.length === 0 ? (
                  <tr>
                    <td colSpan={5} className={`px-6 py-12 text-center font-medium ${config?.temaId === 'obsidian' ? 'text-slate-500' : 'text-gray-500'}`}>
                      El pañol está vacío. ¡Empezá a cargar los equipos desde el botón de arriba!
                    </td>
                  </tr>
                ) : (
                  materiales.map((item: any) => (
                    // Fondo rojo sutil si está roto, si no un hover neutral que queda bien en cualquier tema
                    <tr key={item.id} className={`transition ${item.habilitado === false ? (config?.temaId === 'obsidian' ? 'bg-red-900/10 hover:bg-red-900/20' : 'bg-red-50/50 hover:bg-red-50') : (config?.temaId === 'obsidian' ? 'hover:bg-slate-800/60' : 'hover:bg-gray-50')}`}>
                      
                      {/* 1. Nombre, Marca y OBSERVACIONES */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-bold block text-lg ${item.habilitado === false ? (config?.temaId === 'obsidian' ? 'text-red-400' : 'text-red-600') : 'text-[var(--acento)]'}`}>
                            {item.nombre}
                          </span>
                          {/* Cartelito rojo de Roto */}
                          {item.habilitado === false && (
                            <span className={`text-[10px] px-2 py-0.5 rounded border font-bold uppercase tracking-wider ${config?.temaId === 'obsidian' ? 'bg-red-900/40 text-red-300 border-red-800' : 'bg-red-100 text-red-700 border-red-200'}`}>
                              En Reparación
                            </span>
                          )}
                        </div>
                        <span className={`text-xs font-medium uppercase tracking-wide block mb-1 ${config?.temaId === 'obsidian' ? 'text-slate-500' : 'text-gray-500'}`}>
                          {item.marca || "S/M"} {item.modelo ? `• ${item.modelo}` : ""}
                        </span>
                        
                        {/* Cartelito amarillo de Observaciones */}
                        {item.observaciones && (
                          <p className={`text-xs mt-1 inline-block px-2 py-1 rounded border shadow-sm ${item.habilitado === false ? (config?.temaId === 'obsidian' ? 'bg-red-900/20 border-red-800/50 text-red-300' : 'bg-red-100 border-red-200 text-red-800') : (config?.temaId === 'obsidian' ? 'bg-amber-900/20 border-amber-700/50 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-800')}`}>
                            ⚠️ {item.observaciones}
                          </p>
                        )}
                      </td>
                      
                      {/* 2. Número de Serie */}
                      <td className={`px-6 py-4 font-mono text-sm font-bold ${config?.temaId === 'obsidian' ? 'text-slate-300' : 'text-gray-600'}`}>
                        {item.numeroSerie || <span className={`italic font-sans font-normal ${config?.temaId === 'obsidian' ? 'text-slate-600' : 'text-gray-400'}`}>No aplica</span>}
                      </td>
                      
                      {/* 3. Ubicación */}
                      <td className={`px-6 py-4 text-sm font-medium ${config?.temaId === 'obsidian' ? 'text-slate-300' : 'text-gray-700'}`}>
                        {item.ubicacionFisica || "-"}
                      </td>
                      
                      {/* 4. El control visual de Stock */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <span className={`text-xl font-black ${item.cantidadDisponible > 0 && item.habilitado !== false ? 'text-green-500' : 'text-red-500'}`}>
                            {item.cantidadDisponible} <span className={`text-sm font-medium ${config?.temaId === 'obsidian' ? 'text-slate-500' : 'text-gray-400'}`}>/ {item.cantidadTotal}</span>
                          </span>
                          {item.cantidadDisponible === 0 && item.habilitado !== false && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full mt-1 font-bold tracking-wider ${config?.temaId === 'obsidian' ? 'bg-red-900/40 text-red-400' : 'bg-red-100 text-red-700'}`}>
                              AGOTADO
                            </span>
                          )}
                        </div>
                      </td>
                      
                      {/* 5. Botonera Inteligente */}
                      <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                        {item.cantidadDisponible > 0 && item.habilitado !== false ? (
                          <Link 
                            href={`/panol/prestar/${item.id}`} 
                            className="inline-block text-sm px-4 py-2 rounded-lg font-bold transition border shadow-sm border-[var(--acento)] text-[var(--acento)] hover:opacity-70"
                          >
                            🤝 Prestar
                          </Link>
                        ) : (
                          <button 
                            disabled 
                            className={`text-sm px-4 py-2 rounded-lg font-bold border cursor-not-allowed shadow-sm ${config?.temaId === 'obsidian' ? 'bg-slate-800 text-slate-500 border-slate-700' : 'bg-gray-100 text-gray-400 border-gray-200'}`}
                            title={item.habilitado === false ? "Equipo en reparación" : "No hay stock para prestar"}
                          >
                            {item.habilitado === false ? '❌ Roto' : '🤝 Prestar'}
                          </button>
                        )}

                        <Link 
                          href={`/materiales/editar/${item.id}`} 
                          className={`inline-block text-sm px-3 py-2 rounded-lg font-bold transition border shadow-sm ${config?.temaId === 'obsidian' ? 'bg-slate-700 text-slate-300 hover:bg-slate-600 border-slate-600' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'}`}
                        >
                          ✏️ Editar
                        </Link>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}