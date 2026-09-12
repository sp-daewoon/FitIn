import React, { useState } from 'react';
import { Image, View } from 'react-native';
import { MachineId, machines } from './workout';
const atlases = [
  require('../assets/exercises/atlas-v2-draft.png'),
  require('../assets/exercises/freeweights-atlas-draft.png'),
];
/** Local atlases, clipped by the UI. Existing exercise IDs keep their original image cells. */
export function ExerciseVisual({ machine, size }: { machine: MachineId; size?: number }) {
  const [width, setWidth] = useState(size ?? 320);
  const slot = machines[machine].atlas;
  const index = slot % 9;
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
        source={atlases[Math.floor(slot / 9)]}
        resizeMode="stretch"
        style={{
          position: 'absolute',
          width: width * 3,
          height: width * 3,
          left: -(index % 3) * width,
          top: -Math.floor(index / 3) * width,
        }}
      />
    </View>
  );
}
