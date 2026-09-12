import React, { useState } from 'react';
import { Image, View } from 'react-native';
import { MachineId, machines } from './workout';
/** One local atlas, clipped by the UI. No remote assets and no image manipulation pipeline. */
export function ExerciseVisual({ machine, size }: { machine: MachineId; size?: number }) {
  const [width, setWidth] = useState(size ?? 320);
  const index = machines[machine].atlas;
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
        source={require('../assets/exercises/atlas-v2-draft.png')}
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
