import { test, expect } from '@playwright/test';
import resources from '../../src/data/fermentation-resources.json' with { type: 'json' };

// The Resources page reads no Firestore data (Requirement #20 bundles the list at
// build time), so these specs need no emulator seeding. The AI search (Requirement
// #21) has no emulator either: its requests go to Firebase AI Logic's real endpoint,
// so each test that uses it intercepts that request in the browser and answers it.
const AI_ENDPOINT = '**/firebasevertexai.googleapis.com/**';

const indexOf = (name) => resources.findIndex((r) => r.name === name);

function aiReply(route, ids) {
  return route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify({
      candidates: [{ content: { role: 'model', parts: [{ text: JSON.stringify({ ids }) }] }, finishReason: 'STOP' }],
    }),
  });
}

const cards = (page) => page.locator('.resource-card:visible');

test.describe('Resources page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/resources/');
  });

  test('lists every resource and is linked from the nav', async ({ page }) => {
    await expect(cards(page)).toHaveCount(resources.length);
    await expect(page.locator('#results-summary')).toHaveText(`Showing all ${resources.length} resources`);
    await expect(page.locator('.site-nav').getByRole('link', { name: 'Resources' })).toHaveAttribute(
      'href',
      '/resources/',
    );
  });

  test('each card links out in a new tab and shows its tags', async ({ page }) => {
    const first = resources[0];
    const card = cards(page).first();
    const link = card.getByRole('link', { name: first.name });
    await expect(link).toHaveAttribute('href', first.website);
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', /noopener/);
    await expect(card.locator('.tag')).toHaveCount(first.area.length + first.resourceType.length + first.mediaType.length);
  });

  test('keyword search filters as you type, on name and description', async ({ page }) => {
    await page.fill('#keyword-input', 'sourdough');
    const expected = resources.filter((r) => `${r.name} ${r.description}`.toLowerCase().includes('sourdough'));
    await expect(cards(page)).toHaveCount(expected.length);
    await expect(page.locator('#results-summary')).toHaveText(
      `Showing ${expected.length} of ${resources.length} resources`,
    );
  });

  test('Media filter narrows to podcasts', async ({ page }) => {
    await page.locator('.pill', { hasText: 'Podcast' }).click();
    await expect(cards(page)).toHaveCount(1);
    await expect(cards(page).first()).toContainText('Master Brewers');
  });

  test('Type pills OR together within the facet', async ({ page }) => {
    await page.locator('.pill', { hasText: 'Organizations & Communities' }).click();
    const orgs = resources.filter((r) => r.resourceType.includes('Organizations & Communities')).length;
    await expect(cards(page)).toHaveCount(orgs);

    await page.locator('.pill', { hasText: 'Safety & Troubleshooting' }).click();
    const either = resources.filter((r) =>
      r.resourceType.some((t) => t === 'Organizations & Communities' || t === 'Safety & Troubleshooting'),
    ).length;
    await expect(cards(page)).toHaveCount(either);
  });

  test('Area panels start closed and open independently', async ({ page }) => {
    const beverages = page.getByRole('button', { name: 'Beverages' });
    const produce = page.getByRole('button', { name: 'Produce' });
    await expect(page.getByLabel('Kombucha')).toBeHidden();

    await beverages.click();
    await produce.click();
    await expect(beverages).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByLabel('Kombucha')).toBeVisible();
    await expect(page.getByLabel('Kimchi')).toBeVisible();
  });

  test('Region lists regions by name and filters by origin tags', async ({ page }) => {
    await page.getByRole('button', { name: 'Region' }).click();
    await page.locator('input[name="area"][value="European"]').check();
    const european = resources.filter((r) => r.area.includes('European'));
    await expect(cards(page)).toHaveCount(european.length);

    // Labels drop "Fermented Foods"; the data keeps it.
    const asian = page.locator('input[name="area"][value="Asian Fermented Foods"]').locator('..');
    await expect(asian).toContainText('Asian');
    await expect(asian).not.toContainText('Fermented Foods');
    await expect(page.locator('.tag-area', { hasText: 'Fermented Foods' })).toHaveCount(0);
  });

  test("a panel's Select all selects its whole group, and shows a partial selection", async ({ page }) => {
    await page.getByRole('button', { name: 'Beverages' }).click();
    const groupCheck = page.getByLabel('Select all Beverages');
    await groupCheck.check();

    const beverageAreas = [
      'Beer', 'Wild & Sour Beer', 'Wine', 'Mead', 'Cider', 'Kombucha', 'Vinegar',
      'Sake', 'Shochu', 'Pulque', 'Chicha', 'Cocoa', 'Coffee',
    ];
    const matching = resources.filter((r) => r.area.some((a) => beverageAreas.includes(a))).length;
    await expect(cards(page)).toHaveCount(matching);

    await page.locator('input[name="area"][value="Wine"]').uncheck();
    await expect(groupCheck).not.toBeChecked();
    expect(await groupCheck.evaluate((el) => el.indeterminate)).toBe(true);
  });

  test('panel headings are labels, not filters', async ({ page }) => {
    await expect(page.locator('.area-group-toggle input')).toHaveCount(0);
    await expect(page.getByLabel('Select all Beverages')).toBeHidden();
  });

  test('the × clears the keyword box and only shows while it has text', async ({ page }) => {
    const clear = page.getByRole('button', { name: 'Clear search', exact: true });
    await expect(clear).toBeHidden();
    await page.fill('#keyword-input', 'kimchi');
    await expect(cards(page)).not.toHaveCount(resources.length);

    await clear.click();
    await expect(page.locator('#keyword-input')).toHaveValue('');
    await expect(page.locator('#keyword-input')).toBeFocused();
    await expect(cards(page)).toHaveCount(resources.length);
    await expect(clear).toBeHidden();
  });

  test('the × clears the question box', async ({ page }) => {
    const clear = page.getByRole('button', { name: 'Clear question' });
    await expect(clear).toBeHidden();
    await page.fill('#ask-input', 'cabbage');
    await clear.click();
    await expect(page.locator('#ask-input')).toHaveValue('');
    await expect(clear).toBeHidden();
  });

  test('filters combine with AND, and the empty state clears everything', async ({ page }) => {
    await page.locator('.pill', { hasText: 'Podcast' }).click();
    await page.fill('#keyword-input', 'kimchi');
    await expect(cards(page)).toHaveCount(0);
    await expect(page.locator('#empty-state')).toBeVisible();

    await page.locator('#empty-clear').click();
    await expect(cards(page)).toHaveCount(resources.length);
    await expect(page.locator('#keyword-input')).toHaveValue('');
    await expect(page.locator('.pill input:checked')).toHaveCount(0);
  });

  test('Ask shows the AI matches in rank order, and Show all returns to the list', async ({ page }) => {
    const ranked = [indexOf('ChainBaker'), indexOf('The Sourdough Journey'), 0];
    let requestBody;
    await page.route(AI_ENDPOINT, (route) => {
      requestBody = route.request().postData();
      return aiReply(route, ranked);
    });

    await page.fill('#ask-input', 'How do I keep a sourdough starter alive?');
    await page.click('#ask-button');

    await expect(page.locator('#ai-banner')).toBeVisible();
    await expect(page.locator('#ai-question')).toHaveText('How do I keep a sourdough starter alive?');
    await expect(cards(page)).toHaveCount(3);
    await expect(cards(page).locator('h2')).toHaveText(ranked.map((i) => resources[i].name));
    await expect(page.locator('#results-summary')).toHaveText('Showing all 3 matches');

    // The question and the whole list go to the model; the URLs never do.
    expect(requestBody).toContain('How do I keep a sourdough starter alive?');
    expect(requestBody).toContain(resources.at(-1).name);
    expect(requestBody).not.toContain(resources[0].website);

    await page.locator('#ai-clear').click();
    await expect(page.locator('#ai-banner')).toBeHidden();
    await expect(cards(page)).toHaveCount(resources.length);
    await expect(cards(page).first().locator('h2')).toHaveText(resources[0].name);
  });

  test('the rail filters still apply to AI matches', async ({ page }) => {
    await page.route(AI_ENDPOINT, (route) => aiReply(route, [indexOf('ChainBaker'), indexOf('Master Brewers Association Video Resources')]));
    await page.fill('#ask-input', 'brewing and baking videos');
    await page.click('#ask-button');
    await expect(cards(page)).toHaveCount(2);

    await page.locator('.pill', { hasText: 'Podcast' }).click();
    await expect(cards(page)).toHaveCount(1);
    await expect(page.locator('#results-summary')).toHaveText('Showing 1 of 2 matches');
  });

  test('uses the chosen Gemini model', async ({ page }) => {
    let url;
    await page.route(AI_ENDPOINT, (route) => {
      url = route.request().url();
      return aiReply(route, [0]);
    });
    await page.fill('#ask-input', 'anything');
    await page.click('#ask-button');
    await expect(page.locator('#ai-banner')).toBeVisible();
    expect(url).toContain('gemini-3.5-flash-lite');
  });

  test('drops AI matches that are not real resources', async ({ page }) => {
    await page.route(AI_ENDPOINT, (route) => aiReply(route, [9999, 1, -3]));
    await page.fill('#ask-input', 'cheese');
    await page.click('#ask-button');
    await expect(cards(page)).toHaveCount(1);
    await expect(cards(page).first().locator('h2')).toHaveText(resources[1].name);
  });

  test('an AI reply with no matches says so and keeps the full list', async ({ page }) => {
    await page.route(AI_ENDPOINT, (route) => aiReply(route, []));
    await page.fill('#ask-input', 'how do I fix my car');
    await page.click('#ask-button');
    await expect(page.locator('#ask-status')).toContainText(/nothing on the list matched/i);
    await expect(page.locator('#ai-banner')).toBeHidden();
    await expect(cards(page)).toHaveCount(resources.length);
  });

  test('a failed AI call shows a friendly message, never a raw error', async ({ page }) => {
    await page.route(AI_ENDPOINT, (route) =>
      route.fulfill({ status: 500, contentType: 'application/json', body: '{"error":{"code":500,"message":"boom"}}' }),
    );
    await page.fill('#ask-input', 'kombucha');
    await page.click('#ask-button');
    await expect(page.locator('#ask-status')).toHaveText(/isn't working right now/);
    await expect(page.locator('#ask-status')).not.toContainText('boom');
    await expect(page.locator('#ask-button')).toBeEnabled();
    await expect(cards(page)).toHaveCount(resources.length);
  });

  test('a reply in the wrong shape is treated as a failure', async ({ page }) => {
    await page.route(AI_ENDPOINT, (route) =>
      route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ candidates: [{ content: { role: 'model', parts: [{ text: 'Try kombucha!' }] }, finishReason: 'STOP' }] }),
      }),
    );
    await page.fill('#ask-input', 'kombucha');
    await page.click('#ask-button');
    await expect(page.locator('#ask-status')).toHaveText(/isn't working right now/);
  });
});

test.describe('Resources page on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('the filter rail collapses behind a toggle', async ({ page }) => {
    await page.goto('/resources/');
    const toggle = page.locator('#filters-toggle');
    await expect(toggle).toBeVisible();
    await expect(page.locator('#keyword-input')).toBeHidden();

    await toggle.click();
    await expect(page.locator('#keyword-input')).toBeVisible();

    await page.locator('.pill', { hasText: 'Podcast' }).click();
    await expect(page.locator('#filters-active-count')).toHaveText('(1)');
  });

  test('has no horizontal scroll', async ({ page }) => {
    await page.goto('/resources/');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
