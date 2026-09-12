import React, { useState } from 'react';
import { Image, View } from 'react-native';
import { MachineId, machines } from './workout';
const atlases = [
  require('../assets/exercises/atlas-v2-draft.png'),
  require('../assets/exercises/freeweights-atlas-draft.png'),
  require('../assets/exercises/ppl-atlas-draft.png'),
];
/** Local atlases, clipped by the UI. Existing exercise IDs keep their original image cells. */
export function ExerciseVisual({ machine, size }: { machine: MachineId; size?: number }) {
  const [width, setWidth] = useState(size ?? 320);
  const slot = machines[machine].atlas;
  const columns = slot >= 18 ? 2 : 3;
  const index = slot >= 18 ? slot - 18 : slot % 9;
  return (
    <View
      accessible
      accessibilityLabel={`${machines[machine].name}, ${machines[machine].area} 자극 부위가 강조된 개발용 그림`}
      onLayout={(e) => {
        if (!size) setWidth(e.nativeEvent.layout.width);
      }}
      style={{
        width: size ?? '100%',
        height: size ?? width,
        overflow: 'hidden',
        backgroundColor: '#fff',
        borderRadius: 20,
      }}
    >
      <Image
        source={atlases[slot >= 18 ? 2 : Math.floor(slot / 9)]}
        resizeMode="stretch"
        style={{
          position: 'absolute',
          width: width * columns,
          height: width * columns,
          left: -(index % columns) * width,
          top: -Math.floor(index / columns) * width,
        }}
      />
    </View>
  );
}
