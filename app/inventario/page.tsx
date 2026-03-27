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

      <div className="max-w-7xl mx-auto p-8 print:p-0 print:max-w-full print:m-0">
        
        {/* Cabecera: Achicamos para papel y escondemos el botón */}
        <div className="flex justify-between items-end mb-6 border-b border-gray-200 pb-4 print:mb-2 print:pb-2">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 print:text-lg print:uppercase print:tracking-wide">Control de Inventario Físico</h2>
            <p className="text-gray-500 mt-1 print:text-xs">Total a verificar: {inventario.length} ejemplares.</p>
          </div>
          <div className="flex gap-3 print:hidden">
            <BotonImprimir />
          </div>
        </div>

        {/* ========================================================= */}
        {/* VISTA WEB (TABLA NORMAL) - SE OCULTA AL IMPRIMIR          */}
        {/* ========================================================= */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden print:hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 uppercase tracking-wider border-b">
                  <th className="px-6 py-4 font-bold text-xs">Nº Inv</th>
                  <th className="px-6 py-4 font-bold text-xs">Título y Autor</th>
                  <th className="px-6 py-4 font-bold text-xs">Ubicación</th>
                  <th className="px-6 py-4 font-bold text-xs">Observaciones</th>
                  <th className="px-6 py-4 font-bold text-xs text-center">Estado</th>
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
                        <span className="font-bold text-gray-900 block">
                          {item.titulo}
                        </span>
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
                            PRESTADO/DAÑADO
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

        {/* ========================================================= */}
        {/* VISTA DE IMPRESIÓN (2 COLUMNAS) - SE OCULTA EN LA WEB     */}
        {/* ========================================================= */}
        <div className="hidden print:block w-full">
          {/* Grilla a 2 columnas con espacio en el medio */}
          <div className="columns-2 gap-x-8 space-y-1">
            {inventario.map((item: any) => (
              // break-inside-avoid evita que un ítem se corte a la mitad entre dos páginas
              <div 
                key={item.id} 
                className="flex items-center gap-2 border-b border-gray-400 py-1 break-inside-avoid"
              >
                {/* 1. Cuadradito para lapicera */}
                <div className="w-4 h-4 border-2 border-black flex-shrink-0"></div>
                
                {/* 2. Número de Inventario */}
                <div className="font-mono text-xs font-bold w-12 flex-shrink-0 text-black">
                  {item.numeroInventario}
                </div>
                
                {/* 3. Título y Autor (Truncados si son muy largos) */}
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-bold text-black truncate leading-tight pr-2">
                    {item.titulo}
                  </div>
                  <div className="text-[9px] text-gray-800 truncate leading-tight">
                    {item.autor}
                  </div>
                </div>
                
                {/* 4. Ubicación Física (Alineada a la derecha) */}
                <div className="text-[10px] font-mono text-right w-16 leading-tight flex-shrink-0 text-black">
                  <div className="font-bold">{item.clasificacion || "-"}</div>
                  <div>{item.cutter || "-"}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}