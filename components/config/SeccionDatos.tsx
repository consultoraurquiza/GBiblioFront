"use client";

import { useState, useEffect } from "react";

export default function SeccionDatos() {
  const [config, setConfig] = useState<any>(null);
  const [descargando, setDescargando] = useState(false);
  const [restaurando, setRestaurando] = useState(false);

  // CONFIGURACIÓN Y TEMA
  const claseTema = config ? `tema-${config.temaId}` : 'tema-lumina';

  useEffect(() => {
    fetch("http://localhost:5078/api/configuracion")
      .then(res => res.json())
      .then(data => setConfig(data))
      .catch(err => console.error(err));
  }, []);

  // --- 1. EXPORTAR BACKUP ---
  const descargarBackup = async () => {
    setDescargando(true);
    try {
      const res = await fetch("http://localhost:5078/api/backup/exportar");

      if (!res.ok) {
  // Atrapamos el JSON con el error real que armamos en C#
  const errorData = await res.json().catch(() => null);
  throw new Error(errorData?.mensaje || "No se pudo generar la copia de seguridad");
}

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement("a");
      a.href = url;

      const fecha = new Date().toISOString().split('T')[0];
      a.download = `backup_biblioteca_${fecha}.sql`; 

      document.body.appendChild(a);
      a.click();
      
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al descargar el backup:", error);
      alert("Hubo un problema al intentar descargar el respaldo de la base de datos.");
    } finally {
      setDescargando(false);
    }
  };

  // --- 2. IMPORTAR BACKUP (RESTAURAR) ---
  const restaurarBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const confirmar = window.confirm(
      "⚠️ ¡ATENCIÓN! Restaurar una copia de seguridad sobrescribirá TODOS los datos actuales de la biblioteca. ¿Estás absolutamente seguro de continuar?"
    );

    if (!confirmar) {
      e.target.value = ''; // Limpiamos el input si cancela
      return;
    }

    setRestaurando(true);
    const formData = new FormData();
    formData.append("archivoBackup", file);

    try {
      // Endpoint imaginario en tu C# que recibe el archivo y hace el Restore
      const res = await fetch("http://localhost:5078/api/backup/restaurar", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        alert("✅ ¡Base de datos restaurada con éxito! El sistema se recargará.");
        window.location.reload(); // Forzamos recarga para limpiar estados viejos
      } else {
        const errorData = await res.json();
        alert("Error al restaurar: " + (errorData.mensaje || "Archivo inválido o corrupto."));
      }
    } catch (error) {
      console.error("Error al restaurar:", error);
      alert("No se pudo conectar con el servidor para restaurar la copia.");
    } finally {
      setRestaurando(false);
      e.target.value = ''; // Limpiamos el input al terminar
    }
  };

  return (
    <div className={`p-10 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 transition-colors ${claseTema}`}>
      <h2 className={`text-3xl font-black mb-2 ${config?.temaId === 'obsidian' ? 'text-white' : 'text-slate-800'}`}>
        📥 Gestión de Datos
      </h2>
      <p className={`mb-8 font-medium ${config?.temaId === 'obsidian' ? 'text-slate-400' : 'text-slate-500'}`}>
        Migraciones, resguardos y restauración de la base de datos.
      </p>

      {/* Cambiamos a 3 columnas en pantallas grandes para que entren las 3 tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* TARJETA 1: IMPORTAR KOHA */}
        <div className={`p-6 rounded-[2rem] shadow-sm border flex flex-col justify-between h-72 hover:shadow-md transition-shadow ${config?.temaId === 'obsidian' ? 'bg-[var(--card-bg)] border-white/10' : 'bg-white border-slate-200'}`}>
          <div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4 ${config?.temaId === 'obsidian' ? 'bg-orange-500/20' : 'bg-orange-100'}`}>
              📑
            </div>
            <h4 className={`font-bold text-lg leading-tight ${config?.temaId === 'obsidian' ? 'text-white' : 'text-slate-800'}`}>
              Migrar desde Koha
            </h4>
            <p className={`text-xs leading-relaxed mt-2 ${config?.temaId === 'obsidian' ? 'text-slate-400' : 'text-slate-500'}`}>
              Subí tu archivo CSV exportado de Koha para poblar el inventario automáticamente.
            </p>
          </div>
          <label className={`cursor-pointer text-center py-3 rounded-xl font-bold text-sm active:scale-95 transition-all ${config?.temaId === 'obsidian' ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
            Subir CSV
            <input type="file" className="hidden" accept=".csv" />
          </label>
        </div>

        {/* TARJETA 2: EXPORTAR BACKUP */}
        <div className={`p-6 rounded-[2rem] shadow-sm border flex flex-col justify-between h-72 hover:shadow-md transition-shadow ${config?.temaId === 'obsidian' ? 'bg-[var(--card-bg)] border-white/10' : 'bg-white border-slate-200'}`}>
          <div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4 ${config?.temaId === 'obsidian' ? 'bg-[var(--acento)]/20' : 'bg-[var(--acento)]/10'}`}>
              💾
            </div>
            <h4 className={`font-bold text-lg leading-tight ${config?.temaId === 'obsidian' ? 'text-white' : 'text-slate-800'}`}>
              Crear Respaldo
            </h4>
            <p className={`text-xs leading-relaxed mt-2 ${config?.temaId === 'obsidian' ? 'text-slate-400' : 'text-slate-500'}`}>
              Descargá un Dump SQL con todos los libros, usuarios y configuraciones para estar seguro.
            </p>
          </div>
          <button 
            onClick={descargarBackup}
            disabled={descargando}
            className="bg-[var(--acento)] text-white py-3 rounded-xl font-bold text-sm active:scale-95 transition-all shadow-lg hover:brightness-110 disabled:opacity-50"
          >
            {descargando ? '⏳ Generando...' : 'Descargar Backup'}
          </button>
        </div>

        {/* TARJETA 3: RESTAURAR BACKUP */}
        <div className={`p-6 rounded-[2rem] shadow-sm border flex flex-col justify-between h-72 hover:shadow-md transition-shadow ${config?.temaId === 'obsidian' ? 'bg-[var(--card-bg)] border-red-500/30' : 'bg-white border-red-200'}`}>
          <div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4 ${config?.temaId === 'obsidian' ? 'bg-red-500/20' : 'bg-red-100'}`}>
              🔄
            </div>
            <h4 className={`font-bold text-lg leading-tight ${config?.temaId === 'obsidian' ? 'text-white' : 'text-slate-800'}`}>
              Restaurar Sistema
            </h4>
            <p className={`text-xs leading-relaxed mt-2 ${config?.temaId === 'obsidian' ? 'text-slate-400' : 'text-slate-500'}`}>
              Subí un archivo `.sql` de respaldo para volver la base de datos a un estado anterior.
            </p>
          </div>
          <label className={`cursor-pointer text-center py-3 rounded-xl font-bold text-sm active:scale-95 transition-all ${restaurando ? 'bg-red-300 cursor-wait text-red-800' : 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/30'}`}>
            {restaurando ? '⏳ Restaurando...' : 'Subir y Restaurar'}
            <input 
              type="file" 
              className="hidden" 
              accept=".sql,.bak" 
              onChange={restaurarBackup} 
              disabled={restaurando}
            />
          </label>
        </div>

      </div>
    </div>
  );
}