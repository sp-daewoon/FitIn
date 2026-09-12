import React from 'react';
import { DimensionValue, Image, View } from 'react-native';
import { MachineId, machines } from './workout';
const atlases = [
  require('../assets/exercises/atlas-v2-draft.png'),
  require('../assets/exercises/freeweights-atlas-draft.png'),
  require('../assets/exercises/ppl-atlas-draft.png'),
];
const percent = (n: number) => `${n}%` as DimensionValue;
/**
 * Local atlases, clipped by the UI. Existing exercise IDs keep their original image cells.
 *
 * The frame reserves its space up front: a square aspect ratio when it fills the row, or the exact
 * pixel size the caller asked for. The cell is then positioned in percentages of that frame. An
 * earlier version measured itself with onLayout and re-rendered at the measured width, which made
 * the image and everything under it jump on first paint and on every remount.
 */
export function ExerciseVisual({ machine, size }: { machine: MachineId; size?: number }) {
  const slot = machines[machine].atlas;
  const columns = slot >= 18 ? 2 : 3;
  const index = slot >= 18 ? slot - 18 : slot % 9;
  return (
    <View
      accessible
      accessibilityLabel={`${machines[machine].name}, ${machines[machine].area} 자극 부위가 강조된 개발용 그림`}
      style={[
        { overflow: 'hidden', backgroundColor: '#fff', borderRadius: 20 },
        size === undefined ? { width: '100%', aspectRatio: 1 } : { width: size, height: size },
      ]}
    >
      <Image
        source={atlases[slot >= 18 ? 2 : Math.floor(slot / 9)]}
        resizeMode="stretch"
        style={{
          position: 'absolute',
          width: percent(columns * 100),
          height: percent(columns * 100),
          left: percent(-(index % columns) * 100),
          top: percent(-Math.floor(index / columns) * 100),
        }}
      />
    </View>
  );
}
