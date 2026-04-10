"use client"; // Le dice a Next.js que este botoncito es interactivo

import { useRouter } from "next/navigation";

// Definimos qué datos necesita recibir el botón
interface Props {
  prestamoId: number;
  tituloLibro: string;
  onDevuelto: () => void; // Función opcional para actualizar la lista en el frontend
}

export default function BotonDevolver({ prestamoId, tituloLibro, onDevuelto }: Props) {
  const router = useRouter();

  const handleDevolver = async () => {
    // Pedimos confirmación para evitar clics por accidente
    const confirmar = window.confirm(`¿Confirmar la devolución de "${tituloLibro}"?`);
    if (!confirmar) return;

    try {
      // Llamamos a tu API de C#
      const res = await fetch(`http://localhost:5078/api/prestamos/devolver/${prestamoId}`, {
        method: "POST",
      });

      if (res.ok) {
        alert("¡Libro devuelto y stock actualizado!");
        // Esta es la magia de Next.js: recarga los datos de la tabla en el fondo sin parpadear
        router.refresh();
        if (onDevuelto) onDevuelto();
      } else {
        const data = await res.json();
        alert("Error: " + data.mensaje);
      }
    } catch (error) {
      console.error("Error al devolver", error);
      alert("Ocurrió un error al intentar comunicarse con el servidor.");
    }
  };

  return (
    <button 
      onClick={handleDevolver}
      className="bg-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white px-3 py-1 rounded transition font-medium text-sm shadow-sm"
    >
      Devolver
    </button>
  );
}