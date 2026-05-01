'use client'

import { useState } from 'react'

type Range = 'hypoglycemia' | 'normal' | 'slightly_high' | 'high'

interface Reading {
  id: number
  value: number
  range: Range
  context: string
  time: string
}

const RANGE_CONFIG: Record<Range, { label: string; color: string; bg: string; border: string }> = {
  hypoglycemia:  { label: 'Hipoglicemia',      color: 'text-red-700',    bg: 'bg-red-50',    border: 'border-red-300' },
  normal:        { label: 'Normal',             color: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-300' },
  slightly_high: { label: 'Levemente Elevada',  color: 'text-amber-700',  bg: 'bg-amber-50',  border: 'border-amber-300' },
  high:          { label: 'Elevada',            color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-300' },
}

const MEDICAL_WARNING = 'Este resultado é apenas informativo. Consulte seu médico para orientação personalizada.'

function classify(value: number): Range {
  if (value <= 69) return 'hypoglycemia'
  if (value <= 140) return 'normal'
  if (value <= 180) return 'slightly_high'
  return 'high'
}

function getGuidance(range: Range): string {
  const map: Record<Range, string> = {
    hypoglycemia:  'Sua glicemia está abaixo do recomendado. Descanse, monitore os sintomas e busque atendimento médico se necessário.',
    normal:        'Sua glicemia está dentro da faixa recomendada. Continue mantendo sua rotina saudável.',
    slightly_high: 'Sua glicemia está ligeiramente acima do recomendado. Hidrate-se bem e monitore a próxima medição.',
    high:          'Sua glicemia está acima do nível recomendado. Mantenha-se hidratado e registre este episódio para seu médico.',
  }
  return map[range]
}

const MOCK_HISTORY: Reading[] = [
  { id: 1, value: 95,  range: 'normal',        context: 'Jejum',          time: '07:30' },
  { id: 2, value: 158, range: 'slightly_high',  context: 'Pós-refeição',   time: '12:45' },
  { id: 3, value: 112, range: 'normal',         context: 'Pré-refeição',   time: '18:00' },
  { id: 4, value: 64,  range: 'hypoglycemia',   context: 'Jejum',          time: '07:15' },
  { id: 5, value: 203, range: 'high',           context: 'Pós-refeição',   time: '13:30' },
]

export default function DemoPage() {
  const [value, setValue] = useState('')
  const [context, setContext] = useState('fasting')
  const [result, setResult] = useState<{ range: Range; value: number } | null>(null)
  const [history, setHistory] = useState<Reading[]>(MOCK_HISTORY)
  const [showAlert, setShowAlert] = useState(false)

  const todayHypos = history.filter(r => r.range === 'hypoglycemia').length

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const num = Number(value)
    if (!num || num < 20 || num > 600) return

    const range = classify(num)
    const contextLabel = { fasting: 'Jejum', pre_meal: 'Pré-refeição', post_meal: 'Pós-refeição' }[context] ?? 'Jejum'
    const now = new Date()
    const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`

    const newReading: Reading = { id: Date.now(), value: num, range, context: contextLabel, time }
    const updatedHistory = [newReading, ...history]
    setHistory(updatedHistory)
    setResult({ range, value: num })

    const hyposToday = updatedHistory.filter(r => r.range === 'hypoglycemia').length
    if (range === 'hypoglycemia' && hyposToday >= 2) setShowAlert(true)
    else setShowAlert(false)

    setValue('')
  }

  const avg = Math.round(history.reduce((a, r) => a + r.value, 0) / history.length)
  const tir = Math.round(history.filter(r => r.range === 'normal' || r.range === 'slightly_high').length / history.length * 100)

  return (
    <main className="min-h-screen bg-slate-50 pb-10">

      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🩸</span>
          <span className="font-bold text-slate-900 text-lg">GlicIA</span>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">demo</span>
        </div>
        <span className="text-sm text-slate-500">Olá, João 👋</span>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-6 flex flex-col gap-5">

        {/* Alerta crítico de hipoglicemia */}
        {showAlert && (
          <div data-testid="critical-hypoglycemia-alert" data-severity="critical"
            className="bg-red-600 text-white rounded-2xl p-4 flex gap-3 items-start">
            <span className="text-2xl">🚨</span>
            <div>
              <p className="font-bold text-sm">Segunda hipoglicemia hoje!</p>
              <p className="text-xs mt-1 text-red-100">Você registrou 2 ou mais episódios de hipoglicemia hoje. Procure seu médico ou serviço de saúde.</p>
            </div>
          </div>
        )}

        {/* Cards de resumo */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center">
            <p className="text-2xl font-bold text-slate-900">{avg}</p>
            <p className="text-xs text-slate-500 mt-1">Média mg/dL</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{tir}%</p>
            <p className="text-xs text-slate-500 mt-1">Tempo no alvo</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center">
            <p className="text-2xl font-bold text-slate-900">{history.length}</p>
            <p className="text-xs text-slate-500 mt-1">Medições</p>
          </div>
        </div>

        {/* Formulário de nova medição */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Nova Medição</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Glicemia (mg/dL)</label>
              <input
                type="number"
                min={20}
                max={600}
                value={value}
                onChange={e => setValue(e.target.value)}
                placeholder="Ex: 95"
                required
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {value && (Number(value) < 20 || Number(value) > 600) && (
                <p role="alert" className="text-red-600 text-xs mt-1">Valor inválido — fora do intervalo aceito (mínimo 20, máximo 600)</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Contexto</label>
              <div className="flex gap-2 flex-wrap">
                {[['fasting','Jejum'],['pre_meal','Pré-refeição'],['post_meal','Pós-refeição']].map(([v,l]) => (
                  <button key={v} type="button" onClick={() => setContext(v)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${context === v ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <button type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors mt-1">
              Salvar Medição
            </button>
          </form>
        </div>

        {/* Resultado da última medição */}
        {result && (() => {
          const cfg = RANGE_CONFIG[result.range]
          return (
            <div data-testid="classification-result" className={`rounded-2xl border p-5 ${cfg.bg} ${cfg.border}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`font-bold text-lg ${cfg.color}`}>{result.value} mg/dL</span>
                <span className={`text-sm font-semibold px-3 py-1 rounded-full bg-white/60 ${cfg.color}`}>{cfg.label}</span>
              </div>
              <p data-testid="glucose-guidance" className={`text-sm ${cfg.color} mb-3`}>{getGuidance(result.range)}</p>
              <div data-testid="medical-warning" className="bg-white/70 rounded-xl p-3 text-xs text-slate-600">
                ⚕️ {MEDICAL_WARNING}
              </div>
            </div>
          )
        })()}

        {/* Histórico */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Histórico Recente</h2>
          <div className="flex flex-col gap-2">
            {history.slice(0, 8).map(r => {
              const cfg = RANGE_CONFIG[r.range]
              return (
                <div key={r.id} data-testid="reading-item"
                  className={`flex items-center justify-between rounded-xl px-4 py-3 border ${cfg.bg} ${cfg.border}`}>
                  <div>
                    <span className={`font-bold ${cfg.color}`}>{r.value} mg/dL</span>
                    <span className="text-xs text-slate-500 ml-2">{r.context}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                    <p className="text-xs text-slate-400">{r.time}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Aviso médico footer */}
        <p className="text-center text-xs text-slate-400 px-4">
          ⚕️ O GlicIA é uma ferramenta de monitoramento pessoal e não substitui a orientação de um profissional de saúde.
        </p>

      </div>
    </main>
  )
}
