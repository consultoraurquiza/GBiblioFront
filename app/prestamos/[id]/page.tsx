import Link from "next/link";
import BotonDevolver from "@/components/BotonDevolver";

// Función para traer el préstamo desde tu API
async function getDetallePrestamo(id: string) {
  console.log("Buscando préstamo ID:", id);
  const res = await fetch(`http://localhost:5078/api/prestamos/${id}`, {
    cache: "no-store"
  });
  if (!res.ok) {
    console.log("Error del backend:", res.status);
    return null;
  }
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

export default async function DetallePrestamo({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const prestamo = await getDetallePrestamo(resolvedParams.id);
  const config = await getConfiguracion();
  
  const claseTema = config ? `tema-${config.temaId}` : 'tema-lumina';

  if (!prestamo) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center transition-colors duration-700 ${claseTema} bg-[var(--bg-principal)]`}>
        <h1 className="text-2xl font-bold text-red-500 mb-4">Préstamo no encontrado</h1>
        <Link href="/" className="text-[var(--acento)] hover:underline font-bold">Volver al inicio</Link>
      </div>
    );
  }

  // Cálculos de fechas
  const fechaSalida = new Date(prestamo.fechaSalida);
  const fechaVencimiento = new Date(prestamo.fechaVencimiento);
  const hoy = new Date();
  
  // Calculamos los días de diferencia
  const diasRetraso = Math.floor((hoy.getTime() - fechaVencimiento.getTime()) / (1000 * 60 * 60 * 24));
  const estaVencido = prestamo.estado === 0 && diasRetraso > 0;

  return (
    <main className={`min-h-screen transition-colors duration-700 ${claseTema} bg-[var(--bg-principal)] pb-12`}>
      <nav className="p-4 mb-4 shadow-md bg-[var(--bg-header)] text-[var(--texto-header)] transition-colors print:hidden">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📋</span>
            <h1 className="text-xl font-bold tracking-wider">DETALLE DEL PRÉSTAMO</h1>
          </div>
          <Link href={"/prestamos"} className="bg-[var(--acento)] hover:brightness-110 px-4 py-2 rounded-lg text-sm font-bold text-white transition shadow-sm border border-[var(--acento)]">
            Volver a Préstamos
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-4 md:p-0 mt-6">
        
        {/* Encabezado con estado */}
        <div className={`flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b pb-4 gap-4 ${config?.temaId === 'obsidian' ? 'border-white/10' : 'border-gray-200'}`}>
          <div className="flex items-center gap-4">
            <h1 className={`text-3xl font-bold ${config?.temaId === 'obsidian' ? 'text-white' : 'text-gray-800'}`}>
              Detalle del Préstamo #{prestamo.id}
            </h1>
          </div>
          
          <div className="flex gap-3 items-center w-full md:w-auto justify-end">
            {prestamo.estado === 0 ? (
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold border shadow-sm ${estaVencido ? (config?.temaId === 'obsidian' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-red-100 text-red-700 border-red-200') : (config?.temaId === 'obsidian' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-green-100 text-green-700 border-green-200')}`}>
                {estaVencido ? `VENCIDO (Hace ${diasRetraso} días)` : 'ACTIVO'}
              </span>
            ) : (
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold border shadow-sm ${config?.temaId === 'obsidian' ? 'bg-slate-700 text-slate-300 border-slate-600' : 'bg-gray-200 text-gray-700 border-gray-300'}`}>
                DEVUELTO
              </span>
            )}
            
            {/* Si está activo, mostramos tu botón de devolver acá también */}
            {prestamo.estado === 0 && (
              <BotonDevolver prestamoId={prestamo.id} tituloLibro={prestamo.ejemplar?.libro?.titulo  || "Libro"} />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Tarjeta del Lector
          <div className={`p-6 rounded-xl shadow-sm border border-t-4 transition-colors ${config?.temaId === 'obsidian' ? 'bg-[var(--card-bg)] border-white/10 border-t-green-500' : 'bg-white border-gray-200 border-t-green-500'}`}>
            <h2 className={`text-xl font-bold mb-4 border-b pb-2 ${config?.temaId === 'obsidian' ? 'text-white border-white/10' : 'text-gray-800 border-gray-100'}`}>Datos del Lector</h2>
            <div className="space-y-3">
              <p>
                <span className={`text-sm block uppercase tracking-wide font-bold mb-1 ${config?.temaId === 'obsidian' ? 'text-slate-400' : 'text-gray-500'}`}>Nombre Completo</span>
                <span className={`font-semibold text-xl ${config?.temaId === 'obsidian' ? 'text-white' : 'text-gray-900'}`}>{prestamo.nombreLector}</span>
              </p>
              <p>
                <span className={`text-sm block uppercase tracking-wide font-bold mb-1 ${config?.temaId === 'obsidian' ? 'text-slate-400' : 'text-gray-500'}`}>Curso o Aula</span>
                <span className={`font-semibold text-lg ${config?.temaId === 'obsidian' ? 'text-white' : 'text-gray-900'}`}>{prestamo.cursoOAula}</span>
              </p>
            </div>
          </div> */}
          {/* Tarjeta del Lector */}
          <div className={`p-6 rounded-xl shadow-sm border border-t-4 transition-colors ${config?.temaId === 'obsidian' ? 'bg-[var(--card-bg)] border-white/10 border-t-green-500' : 'bg-white border-gray-200 border-t-green-500'}`}>
            
            <div className="flex justify-between items-start mb-6 border-b pb-4 border-gray-100">
              <h2 className={`text-xl font-bold ${config?.temaId === 'obsidian' ? 'text-white' : 'text-gray-800'}`}>Datos del Lector</h2>
              {/* Etiqueta Visual de Tipo de Préstamo */}
              {prestamo.usuario ? (
                 <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                   ✅ Usuario Registrado
                 </span>
              ) : (
                 <span className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                   ⚠️ Temporal (Carga Rápida)
                 </span>
              )}
            </div>

            <div className="space-y-5">
              <p>
                <span className={`text-xs block uppercase tracking-wider font-bold mb-1 ${config?.temaId === 'obsidian' ? 'text-slate-400' : 'text-gray-500'}`}>Nombre Completo</span>
                <span className={`font-semibold text-xl ${config?.temaId === 'obsidian' ? 'text-white' : 'text-gray-900'}`}>
                  {prestamo.usuario ? `${prestamo.usuario.nombre} ${prestamo.usuario.apellido}` : prestamo.nombreLector}
                </span>
              </p>

              {/* Fila a dos columnas para aprovechar el espacio */}
              <div className="grid grid-cols-2 gap-4">
                <p>
                  <span className={`text-xs block uppercase tracking-wider font-bold mb-1 ${config?.temaId === 'obsidian' ? 'text-slate-400' : 'text-gray-500'}`}>Curso / Perfil</span>
                  <span className={`font-semibold text-lg ${config?.temaId === 'obsidian' ? 'text-white' : 'text-gray-900'}`}>
                    {prestamo.usuario 
                      ? (prestamo.usuario.rol === 0 ? (prestamo.usuario.grupo?.nombre || 'Alumno') : 'Docente / Admin')
                      : (prestamo.cursoOAula|| '-')}
                  </span>
                </p>

                {/* Si es oficial mostramos DNI, si es manual mostramos el teléfono rápido */}
                {prestamo.usuario ? (
                  <p>
                    <span className={`text-xs block uppercase tracking-wider font-bold mb-1 ${config?.temaId === 'obsidian' ? 'text-slate-400' : 'text-gray-500'}`}>DNI</span>
                    <span className={`font-semibold text-lg ${config?.temaId === 'obsidian' ? 'text-white' : 'text-gray-900'}`}>{prestamo.usuario.dni}</span>
                  </p>
                ) : (
                  <p>
                    <span className={`text-xs block uppercase tracking-wider font-bold mb-1 ${config?.temaId === 'obsidian' ? 'text-slate-400' : 'text-gray-500'}`}>Teléfono de Contacto</span>
                    <span className={`font-semibold text-lg ${config?.temaId === 'obsidian' ? 'text-white' : 'text-gray-900'}`}>{prestamo.telefonoManual || 'No registrado'}</span>
                  </p>
                )}
              </div>
              
              {/* Si es un usuario oficial y además tiene teléfono cargado en su perfil, lo sumamos */}
              {prestamo.usuario && prestamo.usuario.telefono && (
                <p>
                    <span className={`text-xs block uppercase tracking-wider font-bold mb-1 ${config?.temaId === 'obsidian' ? 'text-slate-400' : 'text-gray-500'}`}>Teléfono de Contacto</span>
                    <span className={`font-semibold text-lg ${config?.temaId === 'obsidian' ? 'text-white' : 'text-gray-900'}`}>{prestamo.usuario.telefono}</span>
                </p>
              )}
            </div>
          </div>

          {/* Tarjeta del Libro */}
          <div className={`p-6 rounded-xl shadow-sm border border-t-4 transition-colors ${config?.temaId === 'obsidian' ? 'bg-[var(--card-bg)] border-white/10 border-t-[var(--acento)]' : 'bg-white border-gray-200 border-t-[var(--acento)]'}`}>
            <h2 className={`text-xl font-bold mb-4 border-b pb-2 ${config?.temaId === 'obsidian' ? 'text-white border-white/10' : 'text-gray-800 border-gray-100'}`}>Libro Retirado</h2>
            <div className="space-y-3">
              <p>
                <span className={`text-sm block uppercase tracking-wide font-bold mb-1 ${config?.temaId === 'obsidian' ? 'text-slate-400' : 'text-gray-500'}`}>Título</span>
                <span className={`font-bold text-lg leading-tight block ${config?.temaId === 'obsidian' ? 'text-[var(--acento)]' : 'text-[var(--acento)]'}`}>{prestamo.ejemplar?.libro?.titulo || "Sin título"}</span>
              </p>
              <p className={`font-medium ${config?.temaId === 'obsidian' ? 'text-slate-300' : 'text-gray-700'}`}>
                <span className={`text-sm block uppercase tracking-wide font-bold mb-1 ${config?.temaId === 'obsidian' ? 'text-slate-400' : 'text-gray-500'}`}>Autor</span> 
                {prestamo.ejemplar?.libro?.autorPrincipal || "Desconocido"}
              </p>
              
              <div className="grid grid-cols-2 gap-4 mt-2">
                <p className={`font-mono text-sm ${config?.temaId === 'obsidian' ? 'text-slate-300' : 'text-gray-700'}`}>
                  <span className={`font-sans text-sm block uppercase tracking-wide font-bold mb-1 ${config?.temaId === 'obsidian' ? 'text-slate-400' : 'text-gray-500'}`}>ISBN</span> 
                  {prestamo.ejemplar?.libro?.isbn || "N/A"}
                </p>
                <p className={`font-mono text-sm ${config?.temaId === 'obsidian' ? 'text-slate-300' : 'text-gray-700'}`}>
                  <span className={`font-sans text-sm block uppercase tracking-wide font-bold mb-1 ${config?.temaId === 'obsidian' ? 'text-slate-400' : 'text-gray-500'}`}>Inventario</span> 
                  Nº {prestamo.ejemplar?.numeroInventario || "N/A"}
                </p>
              </div>
            </div>

            {/* Tarjeta interna de Fechas */}
            <div className={`mt-6 p-4 rounded-lg border shadow-inner ${config?.temaId === 'obsidian' ? 'bg-slate-800/50 border-white/5' : 'bg-gray-50 border-gray-200'}`}>
              <h3 className={`text-sm font-bold mb-3 uppercase tracking-wider ${config?.temaId === 'obsidian' ? 'text-slate-400' : 'text-gray-600'}`}>Cronograma</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className={`text-xs block font-bold uppercase mb-1 ${config?.temaId === 'obsidian' ? 'text-slate-500' : 'text-gray-500'}`}>Fecha de Salida</span>
                  <span className={`font-medium ${config?.temaId === 'obsidian' ? 'text-slate-200' : 'text-gray-800'}`}>{fechaSalida.toLocaleDateString('es-AR')}</span>
                </div>
                <div>
                  <span className={`text-xs block font-bold uppercase mb-1 ${estaVencido ? 'text-red-500' : (config?.temaId === 'obsidian' ? 'text-slate-500' : 'text-gray-500')}`}>Fecha de Vencimiento</span>
                  <span className={`font-medium ${estaVencido ? 'text-red-500' : (config?.temaId === 'obsidian' ? 'text-slate-200' : 'text-gray-800')}`}>{fechaVencimiento.toLocaleDateString('es-AR')}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}