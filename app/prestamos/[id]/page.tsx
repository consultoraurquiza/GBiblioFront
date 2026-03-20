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

export default async function DetallePrestamo({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const prestamo = await getDetallePrestamo(resolvedParams.id);

  if (!prestamo) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Préstamo no encontrado</h1>
        <Link href="/" className="text-blue-600 underline">Volver al inicio</Link>
      </div>
    );
  }

  // Cálculos de fechas
  const fechaSalida = new Date(prestamo.fechaSalida);
  const fechaVencimiento = new Date(prestamo.fechaVencimiento);
  const hoy = new Date();
  
  // Calculamos los días de diferencia (1 día = 1000 * 60 * 60 * 24 milisegundos)
  const diasRetraso = Math.floor((hoy.getTime() - fechaVencimiento.getTime()) / (1000 * 60 * 60 * 24));
  const estaVencido = prestamo.estado === 0 && diasRetraso > 0;

  return (
    <main className="min-h-screen bg-gray-100  text-black">
      <nav className="bg-slate-800 text-white p-4 mb-4 shadow-md print:hidden">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📋</span>
            <h1 className="text-xl font-bold tracking-wider">DETALLE DEL PRÉSTAMO</h1>
          </div>
          <Link href={"/prestamos"} className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded text-sm font-medium transition">
            Volver a Prestamos
          </Link>
        </div>
      </nav>
      <div className="max-w-4xl mx-auto">
        
        {/* Encabezado con estado */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            {/* <Link href="/" className="text-gray-500 hover:text-gray-800 transition font-medium">
              ← Volver
            </Link> */}
            <h1 className="text-3xl font-bold text-gray-800">Detalle del Préstamo #{prestamo.id}</h1>
          </div>
          
          <div className="flex gap-3 items-center">
            {prestamo.estado === 0 ? (
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${estaVencido ? 'bg-red-100 text-red-700 border-red-200' : 'bg-green-100 text-green-700 border-green-200'}`}>
                {estaVencido ? `VENCIDO (Hace ${diasRetraso} días)` : 'ACTIVO'}
              </span>
            ) : (
              <span className="bg-gray-200 text-gray-700 px-4 py-1.5 rounded-full text-sm font-bold border border-gray-300">
                DEVUELTO
              </span>
            )}
            
            {/* Si está activo, mostramos tu botón de devolver acá también */}
            {prestamo.estado === 0 && (
              <BotonDevolver prestamoId={prestamo.id} tituloLibro={prestamo.ejemplar?.libro?.titulo || "Libro"} />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Tarjeta del Lector */}
          <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-green-500">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Datos del Lector</h2>
            <div className="space-y-3">
              <p><span className="text-gray-500 text-sm block">Nombre Completo</span>
                <span className="font-semibold text-lg">{prestamo.nombreLector}</span>
              </p>
              <p><span className="text-gray-500 text-sm block">Curso o Aula</span>
                <span className="font-semibold text-lg">{prestamo.cursoOAula}</span>
              </p>
              {/* <p><span className="text-gray-500 text-sm block">Nombre Completo</span>
                <span className="font-semibold text-lg">{prestamo.usuario.nombre} {prestamo.usuario.apellido}</span>
              </p>
              <div className="grid grid-cols-2 gap-4">
                <p><span className="text-gray-500 text-sm block">DNI</span> {prestamo.usuario.dni}</p>
                <p><span className="text-gray-500 text-sm block">Rol</span> {prestamo.usuario.rol === 0 ? 'Alumno' : 'Profesor'}</p>
              </div>
              
              {prestamo.usuario.rol === 0 && (
                <p><span className="text-gray-500 text-sm block">Curso</span> {prestamo.usuario.anio} "{prestamo.usuario.division}"</p>
              )} */}

              {/* El teléfono gigante para llamar */}
              {/* <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-100 flex items-center justify-between">
                <div>
                  <span className="text-green-800 text-sm font-bold block mb-1">Contacto telefónico</span>
                  <span className="font-mono text-lg font-medium text-gray-800">
                    {prestamo.usuario.telefono ? prestamo.usuario.telefono : "No registrado"}
                  </span>
                </div>
                {prestamo.usuario.telefono && (
                  <a href={`tel:${prestamo.usuario.telefono}`} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition">
                    Llamar
                  </a>
                )}
              </div> */}
            </div>
          </div>

          {/* Tarjeta del Libro */}
          <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-purple-500">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Libro Retirado</h2>
            <div className="space-y-3">
              <p><span className="text-gray-500 text-sm block">Título</span>
                <span className="font-semibold text-lg">{prestamo.ejemplar?.libro?.titulo || "Sin título"}</span>
              </p>
              <p><span className="text-gray-500 text-sm block">Autor</span> {prestamo.ejemplar?.libro?.autorPrincipal || "Desconocido"}</p>
              
              <div className="grid grid-cols-2 gap-4 mt-2">
                <p><span className="text-gray-500 text-sm block">ISBN</span> {prestamo.ejemplar?.libro?.isbn || "N/A"}</p>
                <p><span className="text-gray-500 text-sm block">Inventario</span> Nº {prestamo.ejemplar?.numeroInventario || "N/A"}</p>
              </div>
            </div>

            {/* Tarjeta interna de Fechas */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-sm font-bold text-gray-600 mb-3 uppercase tracking-wider">Cronograma</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-500 text-xs block">Fecha de Salida</span>
                  <span className="font-medium">{fechaSalida.toLocaleDateString('es-AR')}</span>
                </div>
                <div>
                  <span className={`text-xs block font-bold ${estaVencido ? 'text-red-600' : 'text-gray-500'}`}>Fecha de Vencimiento</span>
                  <span className={`font-medium ${estaVencido ? 'text-red-600' : ''}`}>{fechaVencimiento.toLocaleDateString('es-AR')}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}