import Link from 'next/link'

const RANGES = [
  { label: 'Hipoglicemia', range: '< 70', color: 'bg-red-100 border-red-400 text-red-800' },
  { label: 'Normal', range: '70 – 140', color: 'bg-green-100 border-green-400 text-green-800' },
  { label: 'Levemente Elevada', range: '141 – 180', color: 'bg-amber-100 border-amber-400 text-amber-800' },
  { label: 'Elevada', range: '> 180', color: 'bg-orange-100 border-orange-400 text-orange-800' },
]

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12 gap-10">

      {/* Hero */}
      <section className="text-center max-w-xl">
        <div className="text-5xl mb-4">🩸</div>
        <h1 className="text-4xl font-bold text-slate-900 mb-3">GlicIA</h1>
        <p className="text-lg text-slate-600">
          Assistente inteligente de monitoramento de glicemia. Registre suas medições, acompanhe tendências e mantenha seu histórico seguro.
        </p>
        <div className="mt-6 flex gap-3 justify-center flex-wrap">
          <Link
            href="/cadastro"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Criar conta grátis
          </Link>
          <Link
            href="/login"
            className="border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Entrar
          </Link>
        </div>
      </section>

      {/* Faixas glicêmicas */}
      <section className="w-full max-w-xl">
        <h2 className="text-center text-sm font-semibold text-slate-500 uppercase tracking-widest mb-4">Faixas de referência</h2>
        <div className="grid grid-cols-2 gap-3">
          {RANGES.map((r) => (
            <div key={r.label} className={`border rounded-xl px-4 py-3 ${r.color}`}>
              <p className="font-semibold text-sm">{r.label}</p>
              <p className="text-xs mt-0.5">{r.range} mg/dL</p>
            </div>
          ))}
        </div>
      </section>

      {/* Aviso médico */}
      <footer className="max-w-xl text-center text-xs text-slate-400 border-t border-slate-200 pt-6">
        <p>
          ⚕️ <strong>Aviso médico:</strong> O GlicIA é uma ferramenta de monitoramento pessoal e não substitui a orientação de um profissional de saúde. Consulte seu médico para diagnóstico e tratamento.
        </p>
      </footer>

    </main>
  )
}
