import Link from "next/link";

async function getTablaCutter() {
  const res = await fetch("http://localhost:5078/api/libros/cutter-table", {
    cache: "no-store", 
  });
  
  if (!res.ok) return {};
  // Carga el JSON, que es Dictionary<string, int>
  return res.json(); 
}

export default async function VisualizadorCutter() {
  const tabla = await getTablaCutter();
  
  // Convertimos el objeto en una lista de tuplas [key, value] y ordenamos alfabéticamente
  const registros = Object.entries(tabla)
    .sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <main className="min-h-screen bg-gray-50 text-black">
      <nav className="bg-slate-800 text-white p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📏</span>
            <h1 className="text-xl font-bold tracking-wider">HERRAMIENTAS BIBLIOTECOLÓGICAS</h1>
          </div>
          <Link href="/" className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded text-sm font-medium transition">
            Volver al Catálogo
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto p-8">
        <div className="flex justify-between items-end mb-6 border-b border-gray-200 pb-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Tabla Cutter-Sanborn Tres Cifras</h2>
            <p className="text-gray-500 mt-1">Tabla de consulta para la asignación de códigos de autor. Basada en el archivo cargado en el sistema.</p>
          </div>
          <div className="bg-purple-50 text-purple-800 px-4 py-2 rounded-lg font-bold border border-purple-200 shadow-sm font-mono">
            {registros.length.toLocaleString('es-AR')} Entradas
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden p-6">
          {/* Usamos un grid de CSS para mostrarlo en 4 columnas y ahorrar espacio vertical */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-2 font-mono text-sm">
            
            {/* Cabeceras del grid */}
            <div className="font-bold text-gray-500 pb-2 border-b hidden md:block">Prefijo | Código</div>
            <div className="font-bold text-gray-500 pb-2 border-b hidden md:block">Prefijo | Código</div>
            <div className="font-bold text-gray-500 pb-2 border-b hidden md:block">Prefijo | Código</div>
            <div className="font-bold text-gray-500 pb-2 border-b hidden md:block">Prefijo | Código</div>

            {registros.length === 0 ? (
              <p className="col-span-4 text-center py-10 text-red-500 font-sans">Error: No se pudo cargar la tabla Cutter desde el backend.</p>
            ) : (
              registros.map(([prefijo, codigo]) => (
                <div key={prefijo} className="flex justify-between items-center py-1 border-b border-gray-100 hover:bg-purple-50 px-1 rounded">
                  <span className="text-gray-900 font-bold">{prefijo}</span>
                  <span className="text-purple-700">{String(codigo)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}