# Checklist QA GlicIA — Pré-Soft-Launch
## Versão: 1.0 | Data: ___/___/_____ | Responsável QA: _______________

### BLOCO 1 — CLASSIFICAÇÃO GLICÊMICA (itens 1–6)

- [ ] **1.** Testar manualmente: valor 69 → exibe "Hipoglicemia" (não "Normal")
- [ ] **2.** Testar manualmente: valor 70 → exibe "Normal" (não "Hipoglicemia")
- [ ] **3.** Testar manualmente: valor 140 → exibe "Normal" (não "Levemente Alta")
- [ ] **4.** Testar manualmente: valor 141 → exibe "Levemente Alta" (não "Normal")
- [ ] **5.** Testar manualmente: valor 180 → exibe "Levemente Alta" (não "Alta")
- [ ] **6.** Testar manualmente: valor 181 → exibe "Alta" (não "Levemente Alta")

### BLOCO 2 — SEGURANÇA ANTI-INSULINA (itens 7–10)

- [ ] **7.** Em hipoglicemia: verificar que nenhum texto da UI menciona "dose", "UI", "unidade de insulina"
- [ ] **8.** Em hiperglicemia (>180): verificar que nenhum texto sugere correção com insulina
- [ ] **9.** Usuário declarado como "uso insulina" + glicemia alta: confirmar ausência de sugestão de dose
- [ ] **10.** Verificar que o aviso médico ("consulte seu médico") está visível em TODA tela de resultado

### BLOCO 3 — ALERTA DE HIPOGLICEMIA CRÍTICA (itens 11–14)

- [ ] **11.** Registrar 1ª hipoglicemia no dia → confirmar ausência de alerta crítico
- [ ] **12.** Registrar 2ª hipoglicemia no mesmo dia → confirmar aparição do alerta crítico em destaque
- [ ] **13.** Verificar que o alerta crítico persiste ao navegar para outras telas e voltar
- [ ] **14.** Hipoglicemia dia 1 + hipoglicemia dia 2 → dia 2 não exibe alerta crítico

### BLOCO 4 — VALIDAÇÃO DE FORMULÁRIO (itens 15–17)

- [ ] **15.** Valor 19 → rejeitado com mensagem de erro clara
- [ ] **16.** Valor 601 → rejeitado com mensagem de erro clara
- [ ] **17.** Campos obrigatórios sem preenchimento → impede submissão

### BLOCO 5 — ISOLAMENTO DE DADOS / SEGURANÇA (itens 18–21)

- [ ] **18.** Logar como Usuário A → acessar URL de leitura do Usuário B → redireciona ou mostra 404/403
- [ ] **19.** Token expirado → todas as rotas protegidas retornam 401
- [ ] **20.** Logout → tentar acessar dashboard → redireciona para login
- [ ] **21.** 11 tentativas de login seguidas → resposta 429 na 11ª tentativa

### BLOCO 6 — RELATÓRIO PDF (itens 22–24)

- [ ] **22.** Geração de PDF para 7 dias: arquivo baixado, não corrompido, abre no leitor PDF
- [ ] **23.** Todas as páginas do PDF contêm rodapé com aviso médico
- [ ] **24.** Link de compartilhamento: verificar expiração após 24h

### BLOCO 7 — LGPD e PRIVACIDADE (itens 25–27)

- [ ] **25.** Exportar dados: arquivo JSON contém todos os registros do usuário logado
- [ ] **26.** Exportar dados: arquivo JSON NÃO contém registros de outros usuários
- [ ] **27.** Excluir conta: logar novamente → retorna erro de usuário não encontrado

### BLOCO 8 — CROSS-BROWSER E RESPONSIVIDADE (itens 28–30)

- [ ] **28.** Fluxo completo funcional em: Chrome, Firefox e Safari (desktop)
- [ ] **29.** Fluxo completo funcional em: iPhone 14 (Safari mobile) e Pixel 7 (Chrome mobile)
- [ ] **30.** Alerta crítico de hipoglicemia visível e legível em viewport 375×812 (iPhone SE/14 mini)

---
**Resultado:** ( ) APROVADO — Pode avançar para soft launch
         ( ) REPROVADO — Itens com falha: ___________________________
**Assinatura QA:** ___________________ **Data:** ___/___/_____
