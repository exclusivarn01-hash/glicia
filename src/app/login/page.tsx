export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🩸</div>
          <h1 className="text-2xl font-bold text-slate-900">GlicIA</h1>
          <p className="text-slate-500 text-sm mt-1">Entre na sua conta</p>
        </div>

        <form className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
            <input
              id="email"
              type="email"
              placeholder="seu@email.com"
              className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors mt-2"
          >
            Entrar
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Não tem conta?{' '}
          <a href="/cadastro" className="text-blue-600 font-medium hover:underline">Criar conta grátis</a>
        </p>

        <p className="text-center text-xs text-slate-400 mt-6 leading-relaxed">
          ⚕️ Este aplicativo é uma ferramenta de monitoramento pessoal e não substitui orientação médica.
        </p>
      </div>
    </main>
  )
}
