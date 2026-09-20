import React from 'react';
import { DimensionValue, Image, View } from 'react-native';
import { MachineId, machines } from './workout';
import manifest from '../assets/exercises/manifest.json';

// Metro needs a literal path per image, so the order here has to match the manifest's asset order.
const atlases = [
  require('../assets/exercises/atlas-v2-draft.png'),
  require('../assets/exercises/freeweights-atlas-draft.png'),
  require('../assets/exercises/ppl-atlas-draft.png'),
];

type Placement = { atlas: number; frame: number[]; size: number };
/**
 * Where each figure actually sits in its atlas, measured from the images by
 * `scripts/measure-atlas.mjs` rather than assumed.
 *
 * The atlases are generated art. The prompt asks for equal cells with wide margins and the
 * generator does not reliably comply: figures differ in size and drift across the notional grid
 * lines. Clipping at exact thirds cut heads off and let a neighbour's edge show as a speck in the
 * corner. Re-running the measurement after any atlas change keeps this honest.
 */
type Asset = { cells: string[]; imageSize?: number; frames?: Record<string, number[]> };
const placements: Partial<Record<MachineId, Placement>> = {};
(manifest.assets as unknown as Asset[]).forEach((asset, atlas) => {
  const { frames = {}, imageSize = 0 } = asset;
  for (const id of asset.cells)
    if (frames[id] && imageSize)
      placements[id as MachineId] = { atlas, frame: frames[id], size: imageSize };
});

const percent = (n: number) => `${n}%` as DimensionValue;
// A little air so a figure never sits flush against the frame edge.
const MARGIN = 1.12;

export function ExerciseVisual({ machine, size }: { machine: MachineId; size?: number }) {
  const place = placements[machine];
  let figure = null;
  if (place) {
    const [x0, y0, x1, y1] = place.frame;
    const width = x1 - x0,
      height = y1 - y0;
    // The square the figure is fitted into, in atlas pixels, with a little air around it.
    const side = Math.max(width, height) * MARGIN;
    figure = (
      // Clipped to the figure's own rectangle, so a neighbouring figure can never show as a speck
      // in the corner. The frame around it stays white.
      <View
        style={{
          position: 'absolute',
          overflow: 'hidden',
          width: percent((width / side) * 100),
          height: percent((height / side) * 100),
          left: percent(50 - (width / side) * 50),
          top: percent(50 - (height / side) * 50),
        }}
      >
        <Image
          source={atlases[place.atlas]}
          resizeMode="stretch"
          style={{
            position: 'absolute',
            width: percent((place.size / width) * 100),
            height: percent((place.size / height) * 100),
            left: percent((-x0 / width) * 100),
            top: percent((-y0 / height) * 100),
          }}
        />
      </View>
    );
  }
  return (
    <View
      accessible
      accessibilityLabel={`${machines[machine].name}, ${machines[machine].area} 자극 부위가 강조된 개발용 그림`}
      style={[
        { overflow: 'hidden', backgroundColor: '#fff', borderRadius: 20 },
        size === undefined ? { width: '100%', aspectRatio: 1 } : { width: size, height: size },
      ]}
    >
      {figure}
    </View>
  );
}
