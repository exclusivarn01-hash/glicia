import { test, expect, type Page } from '@playwright/test'

async function loginAsTestUser(page: Page): Promise<void> {
  await page.goto('/login')
  await page.getByLabel('E-mail').fill(process.env.E2E_TEST_USER_EMAIL!)
  await page.getByLabel('Senha').fill(process.env.E2E_TEST_USER_PASSWORD!)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await page.waitForURL('/dashboard')
}

async function navigateToNewReading(page: Page): Promise<void> {
  await page.getByRole('link', { name: 'Nova Medição' }).click()
  await page.waitForURL('/readings/new')
}

test.describe('Registro de Glicemia — Fluxos Críticos', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page)
  })

  test('registro completo de glicemia em menos de 30 segundos', async ({ page }) => {
    const startTime = Date.now()
    await navigateToNewReading(page)
    await page.getByLabel('Glicemia (mg/dL)').fill('95')
    await page.getByRole('radio', { name: 'Jejum' }).check()
    await page.getByRole('radio', { name: 'Não uso insulina' }).check()
    await page.getByRole('button', { name: 'Salvar Medição' }).click()
    await page.waitForURL(/\/readings\/[a-z0-9-]+/)
    await expect(page.getByText('Medição salva com sucesso')).toBeVisible()
    expect(Date.now() - startTime).toBeLessThan(30_000)
  })

  test('hipoglicemia exibe orientação correta sem mencionar insulina', async ({ page }) => {
    await navigateToNewReading(page)
    await page.getByLabel('Glicemia (mg/dL)').fill('55')
    await page.getByRole('radio', { name: 'Jejum' }).check()
    await page.getByRole('radio', { name: 'Uso insulina' }).check()
    await page.getByRole('button', { name: 'Salvar Medição' }).click()
    await page.waitForURL(/\/readings\/[a-z0-9-]+/)

    await expect(page.getByTestId('classification-result')).toBeVisible()
    await expect(page.getByTestId('glucose-guidance')).toBeVisible()

    const pageText = await page.textContent('body')
    const forbiddenWords = ['dose', 'unidade de insulina', 'aplicar insulina', 'injetar', 'UI de']
    for (const word of forbiddenWords) {
      expect(pageText?.toLowerCase(), `Palavra proibida encontrada: "${word}"`).not.toContain(word.toLowerCase())
    }

    await expect(page.getByTestId('medical-warning')).toBeVisible()
  })

  test('segunda hipoglicemia no dia dispara alerta crítico', async ({ page }) => {
    await page.request.post('/api/trpc/glucose.createReading', {
      data: { json: { value: 58, mealContext: 'fasting', insulinStatus: 'on_insulin', recordedAt: new Date().toISOString() } },
      headers: { 'Content-Type': 'application/json' },
    })

    await navigateToNewReading(page)
    await page.getByLabel('Glicemia (mg/dL)').fill('63')
    await page.getByRole('radio', { name: 'Pré-refeição' }).check()
    await page.getByRole('radio', { name: 'Uso insulina' }).check()
    await page.getByRole('button', { name: 'Salvar Medição' }).click()
    await page.waitForURL(/\/readings\/[a-z0-9-]+/)

    const criticalAlert = page.getByTestId('critical-hypoglycemia-alert')
    await expect(criticalAlert).toBeVisible()
    await expect(criticalAlert).toHaveAttribute('data-severity', 'critical')
  })

  test('valor fora do range (< 20 mg/dL) é rejeitado pelo formulário', async ({ page }) => {
    await navigateToNewReading(page)
    await page.getByLabel('Glicemia (mg/dL)').fill('15')
    await page.getByRole('radio', { name: 'Jejum' }).check()
    await page.getByRole('button', { name: 'Salvar Medição' }).click()
    await expect(page.getByRole('alert').filter({ hasText: /valor inválido|fora do intervalo|mínimo.*20/i })).toBeVisible()
    expect(page.url()).toContain('/readings/new')
  })

  test('valor fora do range (> 600 mg/dL) é rejeitado pelo formulário', async ({ page }) => {
    await navigateToNewReading(page)
    await page.getByLabel('Glicemia (mg/dL)').fill('650')
    await page.getByRole('radio', { name: 'Jejum' }).check()
    await page.getByRole('button', { name: 'Salvar Medição' }).click()
    await expect(page.getByRole('alert').filter({ hasText: /valor inválido|fora do intervalo|máximo.*600/i })).toBeVisible()
    expect(page.url()).toContain('/readings/new')
  })

  test('aviso médico aparece em toda tela de resultado', async ({ page }) => {
    const valuesToTest = [55, 100, 160, 220]
    for (const value of valuesToTest) {
      await navigateToNewReading(page)
      await page.getByLabel('Glicemia (mg/dL)').fill(String(value))
      await page.getByRole('radio', { name: 'Jejum' }).check()
      await page.getByRole('radio', { name: 'Não uso insulina' }).check()
      await page.getByRole('button', { name: 'Salvar Medição' }).click()
      await page.waitForURL(/\/readings\/[a-z0-9-]+/)
      const warning = page.getByTestId('medical-warning')
      await expect(warning, `Aviso médico ausente para glicemia ${value}`).toBeVisible()
      await expect(warning).toContainText(/médic|profissional de saúde/i)
      await page.goBack()
    }
  })
})
