import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

/**
 * Measures where each exercise figure actually sits inside its atlas.
 *
 * The atlases are generated from a prompt that asks for equal cells with wide margins, and the
 * generator does not reliably obey it: figures differ in size and drift across the notional grid
 * lines. Clipping at exact thirds therefore cut heads off and let a neighbour's edge bleed in.
 * Rather than trust the grid, the app positions each figure from a measured rectangle, and this
 * script produces those rectangles from the images themselves.
 *
 * `--check` verifies the stored rectangles instead of rewriting them, so a regenerated atlas that
 * no longer matches fails the gate rather than shipping a misaligned image.
 */
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST = resolve(root, 'assets/exercises/manifest.json');
const INK = 236; // brighter than this is background
const SCALE = 3; // analyse at a third of full resolution; figures are far larger than this
const GROW = 1; // join a figure to its equipment without joining it to a neighbour
const MIN_BLOB = 60;

function measure(file, columns, names) {
  const png = PNG.sync.read(readFileSync(resolve(root, file)));
  const size = png.width;
  const w = Math.floor(size / SCALE);
  const ink = new Uint8Array(w * w);
  for (let y = 0; y < w; y++)
    for (let x = 0; x < w; x++) {
      let dark = 0;
      for (let dy = 0; dy < SCALE; dy++)
        for (let dx = 0; dx < SCALE; dx++) {
          const i = (size * (y * SCALE + dy) + (x * SCALE + dx)) << 2;
          if ((png.data[i] + png.data[i + 1] + png.data[i + 2]) / 3 < INK) dark++;
        }
      ink[y * w + x] = dark ? 1 : 0;
    }
  const grown = new Uint8Array(w * w);
  for (let y = 0; y < w; y++)
    for (let x = 0; x < w; x++)
      if (ink[y * w + x])
        for (let dy = -GROW; dy <= GROW; dy++)
          for (let dx = -GROW; dx <= GROW; dx++) {
            const ny = y + dy,
              nx = x + dx;
            if (ny >= 0 && ny < w && nx >= 0 && nx < w) grown[ny * w + nx] = 1;
          }
  const seen = new Uint8Array(w * w);
  const blobs = [];
  for (let y = 0; y < w; y++)
    for (let x = 0; x < w; x++) {
      if (!grown[y * w + x] || seen[y * w + x]) continue;
      const stack = [[x, y]];
      seen[y * w + x] = 1;
      let x0 = x,
        x1 = x,
        y0 = y,
        y1 = y,
        n = 0;
      while (stack.length) {
        const [cx, cy] = stack.pop();
        n++;
        if (cx < x0) x0 = cx;
        if (cx > x1) x1 = cx;
        if (cy < y0) y0 = cy;
        if (cy > y1) y1 = cy;
        for (const [dx, dy] of [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ]) {
          const nx = cx + dx,
            ny = cy + dy;
          if (nx >= 0 && nx < w && ny >= 0 && ny < w && grown[ny * w + nx] && !seen[ny * w + nx]) {
            seen[ny * w + nx] = 1;
            stack.push([nx, ny]);
          }
        }
      }
      if (n > MIN_BLOB) blobs.push({ x0, y0, x1, y1, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 });
    }
  // A figure can break into several blobs, so each blob joins the cell whose centre it is nearest.
  const cell = w / columns;
  const frames = names.map(() => null);
  for (const b of blobs) {
    let best = 0,
      nearest = Infinity;
    for (let k = 0; k < names.length; k++) {
      const d =
        (b.cx - ((k % columns) + 0.5) * cell) ** 2 +
        (b.cy - (Math.floor(k / columns) + 0.5) * cell) ** 2;
      if (d < nearest) {
        nearest = d;
        best = k;
      }
    }
    const cur = frames[best];
    frames[best] = cur
      ? {
          x0: Math.min(cur.x0, b.x0),
          y0: Math.min(cur.y0, b.y0),
          x1: Math.max(cur.x1, b.x1),
          y1: Math.max(cur.y1, b.y1),
        }
      : { x0: b.x0, y0: b.y0, x1: b.x1, y1: b.y1 };
  }
  return {
    size,
    frames: frames.map((f) =>
      f ? [f.x0 * SCALE, f.y0 * SCALE, (f.x1 + 1) * SCALE, (f.y1 + 1) * SCALE] : null,
    ),
  };
}

const overlapping = (frames, names) => {
  const bad = [];
  for (let i = 0; i < frames.length; i++)
    for (let j = i + 1; j < frames.length; j++) {
      const a = frames[i],
        b = frames[j];
      if (!a || !b) continue;
      if (a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3])
        bad.push(`${names[i]} ↔ ${names[j]}`);
    }
  return bad;
};

const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'));
const check = process.argv.includes('--check');
const errors = [];
for (const asset of manifest.assets) {
  const columns = asset.columns ?? 3;
  const { size, frames } = measure(asset.file, columns, asset.cells);
  const missing = asset.cells.filter((_, i) => !frames[i]);
  if (missing.length) errors.push(`${asset.file}: no figure found for ${missing.join(', ')}`);
  const bad = overlapping(frames, asset.cells);
  if (bad.length) errors.push(`${asset.file}: figures overlap, cannot be shown separately: ${bad}`);
  if (check) {
    const stored = asset.frames;
    if (!stored) errors.push(`${asset.file}: measured frames are missing from the manifest`);
    else
      asset.cells.forEach((name, i) => {
        const s = stored[name];
        if (!s) return errors.push(`${asset.file}: ${name} has no frame`);
        // Re-measurement is not bit-identical across tooling, so allow a small drift.
        if (s.some((v, k) => Math.abs(v - frames[i][k]) > size * 0.02))
          errors.push(`${asset.file}: ${name} frame no longer matches the image`);
      });
  } else {
    asset.imageSize = size;
    asset.frames = Object.fromEntries(asset.cells.map((name, i) => [name, frames[i]]));
    console.log(`${asset.file}  ${size}px`);
    asset.cells.forEach((name, i) =>
      console.log(`  ${name.padEnd(22)} ${frames[i] ? frames[i].join(', ') : '(not found)'}`),
    );
  }
}
if (!check) {
  writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
  console.log('\nWrote measured frames into the manifest.');
}
if (errors.length) {
  errors.forEach((e) => console.error(e));
  process.exitCode = 1;
} else if (check) console.log('Atlas frames match the images and no two figures overlap.');
