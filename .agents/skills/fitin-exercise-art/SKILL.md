---
name: fitin-exercise-art
description: Add or regenerate FitIn exercise illustrations without breaking existing records or shipping cut-off figures. Use when adding exercises to the catalog, generating a new atlas, or replacing an existing one; not for unrelated image work.
---

# FitIn exercise art

Repository root is three directories above this file's folder. Read [AGENTS.md](../../../AGENTS.md) and the catalog rules in the [product contract](../../../docs/PRODUCT.md) first.

## The rule that matters most

**Do not assume the generated image obeys the prompt.** The existing prompts already demand equal cells with at least 12% margins and nothing crossing the midlines. The generator did not comply: figures came out different sizes and drifted across the grid lines, so clipping at exact thirds cut heads off and showed a neighbour's shoe as a speck in the corner. That shipped and was only found by a user.

The app therefore never clips on a grid. Each figure is positioned from a rectangle measured from the image itself. Your job when adding art is to produce that measurement and let the gate confirm it.

## Adding or replacing an atlas

1. **Write the prompt as a file first**, next to where the image will live, following [the freeweight prompt](../../../assets/exercises/freeweights-prompt.md) and [the PPL prompt](../../../assets/exercises/ppl-prompt.md). Name every cell in reading order with the exact movement, camera angle, joint positions and which muscles are coral. Keep the margin and one-figure-per-cell wording even though the generator may ignore it: it still improves the odds and it records the intent.
2. **Generate a square atlas** in the same illustration style: gray anatomical figure, black shorts, coral primary muscles, dark gray equipment, pure white background, no text, no labels, no watermark.
3. **Save the prompt beside the image** and reference the image from it. A generated asset without its prompt cannot be reproduced or corrected.
4. **Register the cells** in [the asset manifest](../../../assets/exercises/manifest.json): the `cells` array is in reading order and its length must equal `columns` squared. Add the matching entries to the catalog in `src/workout.ts` with the next free `atlas` slot.
5. **Measure**: `node scripts/measure-atlas.mjs`. This writes `imageSize` and a `frames` rectangle per exercise into the manifest.
6. **Verify**: `npm run check`. It runs `measure-atlas --check`, which fails when a rectangle is missing, when a figure could not be found, when two figures overlap, or when a stored rectangle no longer matches the image.
7. **Look at the result.** The gate proves the geometry, not that the drawing is any good or that the pose is correct.

## Invariants

- **Exercise IDs and atlas slots never change.** Local workout records reference them. Add new slots at the end; never renumber.
- **Two figures may not overlap.** If they do, the image cannot be used as is, because no rectangle can separate them. Regenerate rather than accepting a crop that clips someone.
- **A figure is fitted whole, never cropped.** Wide equipment and tall figures both keep their full extent, with white space filling the rest of the square.
- **Generation is not anatomical validation.** New assets stay `draft` in the manifest with a `reviewRequired` note naming what a qualified reviewer must check. Do not flip an asset to `verified`, do not remove that note, and do not treat a successful build as content approval.
- **Do not change default routines just because the catalog grew.** Adding art adds choices, not prescriptions.

## When something looks wrong in the app

A figure with a cut edge or a speck in the corner means the stored rectangle no longer matches the image. Re-run the measurement and inspect the diff rather than nudging numbers by hand. If the measurement cannot find a figure, the background is not clean white or two figures have merged, and the image needs regenerating.
