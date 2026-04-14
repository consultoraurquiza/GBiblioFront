import Link from 'next/link';

export default function AcercaDe({ config }: { config: any }) {
  return (
    <main className={`min-h-screen p-8 transition-colors duration-700 ${config?.temaId === 'obsidian' ? 'bg-slate-900 text-slate-300' : 'bg-gray-50 text-gray-700'}`}>
      <div className="max-w-2xl mx-auto mt-12">
        <h1 className={`text-3xl font-bold mb-8 text-center ${config?.temaId === 'obsidian' ? 'text-white' : 'text-gray-900'}`}>
          Acerca del Sistema
        </h1>
        
        <div className={`p-8 rounded-2xl shadow-sm border ${config?.temaId === 'obsidian' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200/20">
            <span className="text-5xl">📚</span>
            <div>
              <h2 className="text-xl font-bold text-[var(--acento)]">Gestión de Biblioteca V1.0</h2>
              <p className="text-sm opacity-80">Plataforma integral de catalogación y préstamos.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-bold uppercase tracking-wider text-xs mb-2 opacity-60">Desarrollo y Arquitectura</h3>
              <p className="font-medium">El Loco de la 2 (Licata Ivan)</p>
              <p className="text-sm opacity-80">Full-Stack Developer (Next.js, C#, PostgreSQL)(casi)</p>
            </div>

            <div>
              <h3 className="font-bold uppercase tracking-wider text-xs mb-2 opacity-60">Coordinación y Requerimientos</h3>
              <p className="font-medium">Cecilia Coletti</p>
              <p className="text-sm opacity-80">Bibliotecario / Colaborador</p>
              <p className="font-medium">Ricardo Gomez</p>
              <p className="text-sm opacity-80">Bibliotecario / Colaborador</p>
            </div>
            <div>
              <h3 className="font-bold uppercase tracking-wider text-xs mb-2 opacity-60">Colaboracion Especial</h3>
              <p className="font-medium">Giunta Juan Pablo</p>
              <p className="text-sm opacity-80">Sin quien este trabajo no hubiera visto la luz, con el aporte de las 80 horas de su tiempo personal para hacer realidad este proyecto.</p>
            </div>

            <div>
              <h3 className="font-bold uppercase tracking-wider text-xs mb-2 opacity-60">Tecnologías Principales</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {['Next.js', 'C# .NET', 'PostgreSQL', 'Tailwind CSS'].map(tech => (
                  <span key={tech} className={`px-3 py-1 rounded-full text-xs font-bold border ${config?.temaId === 'obsidian' ? 'bg-slate-700 border-slate-600' : 'bg-gray-100 border-gray-200'}`}>
                    {tech}
                  </span>
                ))}
              </div>

              <div>
              <h3 className="font-bold uppercase tracking-wider text-xs mb-2 mt-1 opacity-60">Esta app es gratuita para quien quiera utilizarla, pero no se conciente la modificacion de la misma al ser de mi propiedad</h3>
            
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200/20 text-center">
            <Link href="/admin" className="text-[var(--acento)] hover:underline font-bold text-sm">
              &larr; Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}