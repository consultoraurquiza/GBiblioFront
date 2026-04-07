"use client";
import { useState, useEffect } from "react";

export default function SeccionPersonalizacion() {
  const [nombreEscuela, setNombreEscuela] = useState("");
  const [temaElegido, setTemaElegido] = useState("oxford");
  const [cargando, setCargando] = useState(false);

  // 1. CARGAR CONFIGURACIÓN AL ENTRAR
  useEffect(() => {
    const obtenerConfig = async () => {
      try {
        const res = await fetch("http://localhost:5078/api/configuracion");
        if (res.ok) {
          const data = await res.json();
          setNombreEscuela(data.nombreEscuela);
          setTemaElegido(data.temaId);
        }
      } catch (error) {
        console.error("Error al cargar configuración", error);
      }
    };
    obtenerConfig();
  }, []);

  // 2. GUARDAR CONFIGURACIÓN
  const guardarCambios = async () => {
    setCargando(true);
    try {
      const res = await fetch("http://localhost:5078/api/configuracion", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: 1, // Siempre el ID 1
          nombreEscuela: nombreEscuela,
          temaId: temaElegido,
          // Mantenemos valores por defecto para los otros campos por ahora
          diasPrestamo: 7,
          maxLibrosPorPersona: 3
        }),
      });

      if (res.ok) {
        alert("¡Identidad de la escuela actualizada correctamente!");
        // Opcional: Recargar la página para que el Layout se entere del cambio
        window.location.reload(); 
      }
    } catch (error) {
      alert("Error al conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  };

  const temasSoberbios = [
  { id: "lumina", nombre: "Lumina", desc: "Minimalista & Limpio", clase: "from-gray-50 to-white", acento: "bg-blue-600" },
  { id: "sepia", nombre: "Sepia", desc: "Modo Lectura Relajante", clase: "from-[#fdfaf6] to-[#f3ede4]", acento: "bg-orange-700" },
  { id: "obsidian", nombre: "Obsidian", desc: "Dark Mode Elegante", clase: "from-slate-900 to-black", acento: "bg-cyan-500" }
];

  return (
    <div className="p-10 max-w-4xl mx-auto animate-fade-in">
      <h2 className="text-3xl font-black text-slate-800 mb-2">🎨 Personalización</h2>
      <p className="text-slate-500 mb-8 font-medium">Adaptá el OPAC a la identidad visual de la institución.</p>

      <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-10">
        
        {/* NOMBRE DE LA ESCUELA */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="md:col-span-2">
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Nombre de la Institución</label>
            <input 
              type="text" 
              value={nombreEscuela}
              onChange={(e) => setNombreEscuela(e.target.value)}
              placeholder="Ej: E.E.T.P. N° 464" 
              className="w-full p-4 bg-slate-50 rounded-2xl outline-none border border-slate-100 font-bold focus:ring-2 focus:ring-purple-500 transition-all text-slate-700" 
            />
          </div>
          {/* ... (Logo omitido para brevedad, sigue igual que antes) ... */}
        </div>

        {/* SELECTOR DE TEMAS */}
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Estilo Visual de la Biblioteca</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {temasSoberbios.map((tema) => (
              <button 
                key={tema.id} 
                onClick={() => setTemaElegido(tema.id)}
                className={`group p-4 rounded-[2rem] border-2 transition-all text-left flex flex-col gap-3 ${
                  temaElegido === tema.id ? 'border-purple-600 bg-purple-50/30' : 'border-slate-50 bg-slate-50/50 hover:border-slate-200'
                }`}
              >
                <div className={`w-full h-24 rounded-2xl bg-gradient-to-br ${tema.clase} p-3 flex flex-col justify-between shadow-inner`}>
                  <div className={`w-6 h-1 rounded-full ${tema.acento}`}></div>
                  <div className="space-y-1 opacity-20">
                    <div className="w-full h-1 bg-white rounded-full"></div>
                    <div className="w-2/3 h-1 bg-white rounded-full"></div>
                  </div>
                </div>
                <div>
                  <span className="text-sm font-black text-slate-800 block leading-tight">{tema.nombre}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">{tema.desc}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-50">
          <button 
            onClick={guardarCambios}
            disabled={cargando}
            className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold shadow-xl active:scale-95 transition-all hover:bg-black disabled:opacity-50"
          >
            {cargando ? "Guardando..." : "Aplicar Cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}