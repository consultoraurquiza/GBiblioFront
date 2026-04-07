// Ejemplo de SeccionAjustes.tsx
export default function SeccionAjustes() {
  return (
    <div className="p-10 max-w-4xl mx-auto animate-fade-in">
      <h2 className="text-2xl font-bold mb-8">⏳ Ajustes de Préstamo</h2>
      
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 grid grid-cols-2 gap-8">
        <div>
          <label className="block text-xs font-black uppercase text-slate-400 mb-2">Días de Préstamo</label>
          <input type="number" className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500 font-bold" defaultValue={7} />
        </div>
        {/* ... más campos ... */}
      </div>

      <div className="mt-8 flex justify-end">
        <button className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold">Guardar Configuración</button>
      </div>
    </div>
  );
}