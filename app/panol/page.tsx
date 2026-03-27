import Link from "next/link";

async function getMateriales() {
  const res = await fetch("http://localhost:5078/api/materiales", {
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function InventarioPanol() {
  const materiales = await getMateriales();

  return (
    <main className="min-h-screen bg-gray-50 text-black">
      {/* NAV AZUL */}
      <nav className="bg-blue-900 text-white p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔌</span>
            <h1 className="text-xl font-bold tracking-wider">PAÑOL TECNOLÓGICO</h1>
          </div>
          <Link href="/" className="bg-blue-800 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-bold transition border border-blue-700">
            Volver al Menú Principal
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-8">
        
        {/* CABECERA */}
        <div className="flex justify-between items-end mb-6 border-b border-gray-200 pb-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Inventario de Equipos</h2>
            <p className="text-gray-500 mt-1">Gestión de proyectores, notebooks, adaptadores y materiales a granel.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/panol/prestamos" className="bg-white border-2 border-blue-600 text-blue-700 hover:bg-blue-50 px-5 py-2.5 rounded-xl font-bold transition shadow-sm flex items-center gap-2">
              📋 Ver Equipos en Uso
            </Link>
            
            <Link href="/materiales/nuevo" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition shadow-md flex items-center gap-2">
              ➕ Registrar Equipo
            </Link>
          </div>
        </div>

        {/* TABLA DE INVENTARIO */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 uppercase tracking-wider border-b">
                  <th className="px-6 py-4 font-bold text-xs">Equipo / Detalle</th>
                  <th className="px-6 py-4 font-bold text-xs">Nº Serie</th>
                  <th className="px-6 py-4 font-bold text-xs">Ubicación</th>
                  <th className="px-6 py-4 font-bold text-xs text-center">Stock</th>
                  <th className="px-6 py-4 font-bold text-xs text-right">Acciones Rápidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {materiales.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 font-medium">
                      El pañol está vacío. ¡Empezá a cargar los equipos desde el botón de arriba!
                    </td>
                  </tr>
                ) : (
                  materiales.map((item: any) => (
                    // Si está deshabilitado, le damos un fondo levemente rojo a la fila entera
                    <tr key={item.id} className={`transition ${item.habilitado === false ? 'bg-red-50/40 hover:bg-red-50' : 'hover:bg-blue-50/50'}`}>
                      
                      {/* 1. Nombre, Marca y OBSERVACIONES */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-bold block text-lg ${item.habilitado === false ? 'text-red-900' : 'text-blue-900'}`}>
                            {item.nombre}
                          </span>
                          {/* Cartelito rojo de Roto */}
                          {item.habilitado === false && (
                            <span className="bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded border border-red-200 font-bold uppercase tracking-wider">
                              En Reparación
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 font-medium uppercase tracking-wide block mb-1">
                          {item.marca || "S/M"} {item.modelo ? `• ${item.modelo}` : ""}
                        </span>
                        
                        {/* Cartelito amarillo de Observaciones */}
                        {item.observaciones && (
                          <p className={`text-xs mt-1 inline-block px-2 py-1 rounded border shadow-sm ${item.habilitado === false ? 'bg-red-100 border-red-200 text-red-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                            ⚠️ {item.observaciones}
                          </p>
                        )}
                      </td>
                      
                      {/* 2. Número de Serie */}
                      <td className="px-6 py-4 font-mono text-sm text-gray-600 font-bold">
                        {item.numeroSerie || <span className="text-gray-400 italic font-sans font-normal">No aplica</span>}
                      </td>
                      
                      {/* 3. Ubicación */}
                      <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                        {item.ubicacionFisica || "-"}
                      </td>
                      
                      {/* 4. El control visual de Stock */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <span className={`text-xl font-black ${item.cantidadDisponible > 0 && item.habilitado !== false ? 'text-green-600' : 'text-red-500'}`}>
                            {item.cantidadDisponible} <span className="text-sm text-gray-400 font-medium">/ {item.cantidadTotal}</span>
                          </span>
                          {item.cantidadDisponible === 0 && item.habilitado !== false && (
                            <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full mt-1 font-bold tracking-wider">
                              AGOTADO
                            </span>
                          )}
                        </div>
                      </td>
                      
                      {/* 5. Botonera Inteligente */}
                      <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                        {/* Validación: Si hay stock Y el equipo no está roto, deja prestar */}
                        {item.cantidadDisponible > 0 && item.habilitado !== false ? (
                          <Link 
                            href={`/panol/prestar/${item.id}`} 
                            className="inline-block text-sm bg-blue-100 text-blue-800 hover:bg-blue-200 px-4 py-2 rounded-lg font-bold transition border border-blue-200 shadow-sm"
                          >
                            🤝 Prestar
                          </Link>
                        ) : (
                          <button 
                            disabled 
                            className="text-sm bg-gray-100 text-gray-400 px-4 py-2 rounded-lg font-bold border border-gray-200 cursor-not-allowed shadow-sm"
                            title={item.habilitado === false ? "Equipo en reparación" : "No hay stock para prestar"}
                          >
                            {item.habilitado === false ? '❌ Roto' : '🤝 Prestar'}
                          </button>
                        )}

                        <Link 
                          href={`/materiales/editar/${item.id}`} 
                          className="inline-block text-sm bg-white text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-lg font-bold transition border border-gray-300 shadow-sm"
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