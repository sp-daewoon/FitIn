/** Run against a web export: npm run test:layout -- http://127.0.0.1:4175 */
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { begin, emptyData, type MachineId } from '../src/workout';

async function main() {
  const url = process.argv[2];
  assert(url, 'Pass the URL of a locally served FitIn web export.');
  assert(['localhost', '127.0.0.1'].includes(new URL(url).hostname), 'Use a local test server.');
  const browser = await chromium.launch();
  try {
    for (const language of ['ko', 'en'] as const) {
      for (const width of [320, 390, 900, 1280]) {
        for (const machine of ['chestPress', 'lateralRaise', 'reverseGrip'] as MachineId[]) {
          const page = await browser.newPage({ viewport: { width, height: 900 } });
          try {
            const errors: string[] = [];
            page.on('pageerror', (error) => errors.push(error.message));
            const now = Date.now();
            const data = structuredClone(emptyData);
            data.preferences.language = language;
            data.sound = false;
            data.session = begin('fullA', [{ machine, sets: 3, work: 60, rest: 90 }], now);
            await page.clock.install({ time: now });
            await page.addInitScript((snapshot) => {
              localStorage.setItem('fitin.v4', JSON.stringify(snapshot));
            }, data);
            await page.goto(url);
            await page.getByTestId('session-controls').waitFor();
            const measure = async () => {
              const controls = page.getByTestId('session-controls');
              return Promise.all([
                page.getByTestId('exercise-image').boundingBox(),
                controls.boundingBox(),
                controls.getByRole('button').first().boundingBox(),
              ]);
            };
            const initial = await measure();
            const checkStable = async () => {
              const current = await measure();
              current.forEach((box, index) => {
                assert(box && initial[index]);
                for (const key of ['x', 'y', 'width', 'height'] as const) {
                  assert(
                    Math.abs(box[key] - initial[index]![key]) < 1,
                    `${language}/${width}/${machine}: region ${index} ${key} moved from ${initial[index]![key]} to ${box[key]}`,
                  );
                }
              });
            };
            // Real session clock: prepare -> first set -> rest -> second set.
            for (const delta of [10_100, 60_000, 90_000]) {
              await page.clock.fastForward(delta);
              await checkStable();
            }
            // Complete set, skip rest, pause and resume without test-driver auto-scrolling.
            for (const buttonIndex of [0, 0, 2, 2]) {
              await page.clock.fastForward(500);
              const button = page
                .getByTestId('session-controls')
                .getByRole('button')
                .nth(buttonIndex);
              const previousLabel = await button.getAttribute('aria-label');
              await button.evaluate((element) => (element as HTMLElement).click());
              await page.clock.fastForward(500);
              assert.notEqual(
                await button.getAttribute('aria-label'),
                previousLabel,
                'The command must actually change phase/pause state before comparing geometry.',
              );
              await checkStable();
            }
            assert.deepEqual(errors, []);
            console.log(`PASS ${language} ${width}px ${machine}`);
          } finally {
            await page.close();
          }
        }
      }
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
