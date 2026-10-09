import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const routes = ['/', '/work/', '/writing/', '/about/', '/contact/'];
for (const route of routes) {
  test(`${route} is accessible, responsive, and has SEO metadata`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('nav a[aria-current="page"]')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://sudoceo.com${route}`);
    await expect(page.locator('meta[name="description"]')).not.toHaveAttribute('content', '');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(results.violations).toEqual([]);
  });
}
test('theme survives reload and navigation, with accessible state', async ({ page }) => {
  await page.goto('/');
  const theme = page.getByRole('button', { name: 'Switch to dark mode' });
  await theme.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.getByRole('button', { name: 'Switch to light mode' })).toHaveAttribute('aria-pressed', 'true');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.locator('nav').getByRole('link', { name: /Work/ }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect((await new AxeBuilder({ page }).withTags(['wcag2aa']).analyze()).violations).toEqual([]);
});
test('keyboard skip navigation reaches main content', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
});
test('drafts are absent and contact is actionable', async ({ page, request }) => {
  await page.goto('/writing/');
  await expect(page.getByText('There are no published articles yet.', { exact: false })).toBeVisible();
  expect((await request.get('/writing/welcome/')).status()).toBe(404);
  const feed = await request.get('/rss.xml');
  expect(feed.status()).toBe(200);
  expect(await feed.text()).not.toContain('<item>');
  expect(await (await request.get('/sitemap-0.xml')).text()).not.toContain('welcome');
  await page.goto('/contact/');
  await expect(page.getByRole('link', { name: /egor.a.markowskij@sudoceo.com/ })).toHaveAttribute('href', 'mailto:egor.a.markowskij@sudoceo.com');
});
test('system dark preference is respected without a saved override', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});
