import Link from "next/link";

async function getInventario() {
  const res = await fetch("http://localhost:5078/api/libros/inventario", {
    cache: "no-store", // Siempre datos frescos
  });
  
  if (!res.ok) return [];
  return res.json();
}

export default async function InventarioGeneral() {
  const inventario = await getInventario();

  return (
    <main className="min-h-screen bg-gray-50 text-black">
      <nav className="bg-slate-800 text-white p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📋</span>
            <h1 className="text-xl font-bold tracking-wider">INVENTARIO GENERAL</h1>
          </div>
          <Link href="/" className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded text-sm font-medium transition">
            Volver al Catálogo
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-8">
        <div className="flex justify-between items-end mb-6 border-b border-gray-200 pb-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Listado de Copias Físicas</h2>
            <p className="text-gray-500 mt-1">Ordenado por Número de Inventario.</p>
          </div>
          <div className="bg-purple-50 text-purple-800 px-4 py-2 rounded-lg font-bold border border-purple-200 shadow-sm">
            Total de ejemplares: {inventario.length}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-bold">Nº Inventario</th>
                  <th className="px-6 py-4 font-bold">Título y Autor</th>
                  <th className="px-6 py-4 font-bold">Ubicación</th>
                  <th className="px-6 py-4 font-bold">Observaciones</th>
                  <th className="px-6 py-4 font-bold text-center">Estado Físico</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {inventario.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No hay ejemplares cargados en la base de datos.
                    </td>
                  </tr>
                ) : (
                  inventario.map((item: any) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-mono font-bold text-purple-900 text-lg">
                        {item.numeroInventario}
                      </td>
                      <td className="px-6 py-4">
                        <Link href={`/libros/${item.libroId}`} className="font-bold text-gray-900 hover:text-purple-600 transition block">
                          {item.titulo}
                        </Link>
                        <span className="text-xs text-gray-500">{item.autor}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="block text-sm font-bold text-gray-700">{item.clasificacion || "-"}</span>
                        <span className="block font-mono text-xs text-gray-500">{item.cutter || "-"}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {item.observaciones || "-"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {item.disponible ? (
                          <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full border border-green-200">
                            DISPONIBLE
                          </span>
                        ) : (
                          <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full border border-red-200">
                            PRESTADO / BAJA
                          </span>
                        )}
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