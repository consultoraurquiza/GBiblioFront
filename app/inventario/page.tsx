import Link from "next/link";
import BotonImprimir from "@/components/BotonImprimir"; // Ajustá la ruta según dónde lo guardaste

async function getInventario() {
  const res = await fetch("http://localhost:5078/api/libros/inventario", {
    cache: "no-store",
  });
  
  if (!res.ok) return [];
  return res.json();
}

export default async function InventarioGeneral() {
  const inventario = await getInventario();

  return (
    <main className="min-h-screen bg-gray-50 text-black print:bg-white print:min-h-0">
      
      {/* Escondemos la barra superior entera al imprimir */}
      <nav className="bg-slate-800 text-white p-4 shadow-md print:hidden">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📋</span>
            <h1 className="text-xl font-bold tracking-wider">INVENTARIO</h1>
          </div>
          <Link href="/" className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded text-sm font-medium transition">
            Volver al Catálogo
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-8 print:p-0 print:max-w-full">
        
        {/* Cabecera: Achicamos para papel y escondemos el botón */}
        <div className="flex justify-between items-end mb-6 border-b border-gray-200 pb-4 print:mb-2 print:pb-2">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 print:text-xl">Control de Inventario</h2>
            <p className="text-gray-500 mt-1 print:text-xs">Total a verificar: {inventario.length} ejemplares.</p>
          </div>
          <div className="flex gap-3 print:hidden">
            <BotonImprimir />
          </div>
        </div>

        {/* Tabla: Le sacamos las sombras y redondeos al imprimir */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden print:border-none print:shadow-none print:rounded-none">
          <div className="overflow-x-auto">
            {/* Achicamos toda la tabla para que rinda el espacio */}
            <table className="w-full text-left border-collapse print:text-xs">
              <thead>
                <tr className="bg-gray-50 text-gray-500 uppercase tracking-wider print:bg-white print:border-b-2 border-gray-800">
                  <th className="px-6 py-4 print:px-2 print:py-1 font-bold text-xs print:text-[10px]">Nº Inv</th>
                  <th className="px-6 py-4 print:px-2 print:py-1 font-bold text-xs print:text-[10px]">Título y Autor</th>
                  <th className="px-6 py-4 print:px-2 print:py-1 font-bold text-xs print:text-[10px]">Ubicación</th>
                  <th className="px-6 py-4 print:px-2 print:py-1 font-bold text-xs print:text-[10px]">Observaciones</th>
                  <th className="px-6 py-4 print:px-2 print:py-1 font-bold text-xs print:text-[10px] text-center">Tildar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 print:divide-gray-400">
                {inventario.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No hay ejemplares cargados en la base de datos.
                    </td>
                  </tr>
                ) : (
                  inventario.map((item: any) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition print:break-inside-avoid">
                      
                      <td className="px-6 py-4 print:px-2 print:py-1 font-mono font-bold text-purple-900 text-lg print:text-xs print:text-black">
                        {item.numeroInventario}
                      </td>
                      
                      <td className="px-6 py-4 print:px-2 print:py-1">
                        <span className="font-bold text-gray-900 block print:text-black print:leading-tight">
                          {item.titulo}
                        </span>
                        <span className="text-xs text-gray-500 print:text-black">{item.autor}</span>
                      </td>
                      
                      <td className="px-6 py-4 print:px-2 print:py-1">
                        <span className="block text-sm font-bold text-gray-700 print:text-xs print:text-black">{item.clasificacion || "-"}</span>
                        <span className="block font-mono text-xs text-gray-500 print:text-black">{item.cutter || "-"}</span>
                      </td>
                      
                      <td className="px-6 py-4 print:px-2 print:py-1 text-sm text-gray-600 print:text-xs print:text-black">
                        {item.observaciones || "-"}
                      </td>
                      
                      {/* En vez de imprimir si está prestado, dejamos un cuadradito vacío para que el humano tache */}
                      <td className="px-6 py-4 print:px-2 print:py-1 text-center">
                        <span className="print:hidden">
                          {item.disponible ? (
                            <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full border border-green-200">
                              DISPONIBLE
                            </span>
                          ) : (
                            <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full border border-red-200">
                              PRESTADO/DAÑADO
                            </span>
                          )}
                        </span>
                        {/* Cuadradito para lapicera que solo aparece en el papel */}
                        <div className="hidden print:block w-4 h-4 border border-black mx-auto"></div>
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