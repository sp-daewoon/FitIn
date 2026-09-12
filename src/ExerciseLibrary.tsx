import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ExerciseVisual } from './ExerciseVisual';
import { MachineId, machines } from './workout';

export function ExerciseLibrary({ onSelect }: { onSelect: (id: MachineId) => void }) {
  const [equipment, setEquipment] = useState('전체');
  const [query, setQuery] = useState('');
  const ids = (Object.keys(machines) as MachineId[]).filter((id) => {
    const exercise = machines[id];
    return (
      (equipment === '전체' || exercise.equipment === equipment) &&
      `${exercise.name} ${exercise.area} ${exercise.secondary}`.includes(query.trim())
    );
  });
  return (
    <View style={styles.container}>
      <Text style={styles.overline}>FIND YOUR NEXT MOVE</Text>
      <Text style={styles.title}>운동을 알고, 내 루틴으로.</Text>
      <Text style={styles.description}>
        머신부터 바벨 5종과 덤벨까지. 동작과 자극 부위를 확인하고 선택하세요.
      </Text>
      <Text style={styles.description}>
        루틴에 넣으려면 오늘의 운동에서 운동 교체, 또는 나의 방식에서 시작 운동을 선택하세요.
        이미지는 자세 검수 전인 개발용 일러스트입니다.
      </Text>
      <TextInput
        accessibilityLabel="운동명 또는 자극 부위 검색"
        placeholder="운동명이나 부위로 검색 · 스쿼트, 가슴, 이두"
        placeholderTextColor="#84918F"
        value={query}
        onChangeText={setQuery}
        style={styles.search}
      />
      <View style={styles.filters}>
        {['전체', '머신', '바벨', '덤벨'].map((type) => (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: equipment === type }}
            key={type}
            onPress={() => setEquipment(type)}
            style={[styles.filter, equipment === type && styles.selected]}
          >
            <Text style={styles.filterLabel}>{type}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.description}>{ids.length}개 운동 · 눌러서 자세와 설정 보기</Text>
      <View style={styles.cards}>
        {ids.map((id) => (
          <Pressable
            key={id}
            accessibilityRole="button"
            accessibilityLabel={`${machines[id].name} 자세 보기`}
            onPress={() => onSelect(id)}
            style={styles.card}
          >
            <ExerciseVisual machine={id} size={96} />
            <View style={styles.detail}>
              <Text style={styles.category}>
                {machines[id].equipment} · {machines[id].region}
              </Text>
              <Text style={styles.name}>{machines[id].name}</Text>
              <Text style={styles.muscles}>{machines[id].area}</Text>
              <Text style={styles.secondary}>보조 · {machines[id].secondary}</Text>
            </View>
            <Text style={styles.arrow}>↗</Text>
          </Pressable>
        ))}
      </View>
      {!ids.length && <Text style={styles.description}>다른 운동명이나 부위로 찾아보세요.</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 28, gap: 14 },
  overline: { fontSize: 10, letterSpacing: 1.8, color: '#7F9292' },
  title: { fontSize: 28, lineHeight: 39, fontWeight: '800', color: '#17343A' },
  description: { fontSize: 12, lineHeight: 21, color: '#74868A' },
  search: {
    minHeight: 48,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#DEE6E3',
    borderRadius: 12,
    paddingHorizontal: 14,
    color: '#244348',
    fontSize: 13,
  },
  filters: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  filter: {
    minHeight: 44,
    padding: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#E8EEEA',
  },
  selected: { backgroundColor: '#CFE2D8' },
  filterLabel: { color: '#244348', fontSize: 13 },
  cards: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    borderRadius: 18,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E3EAE6',
    flexGrow: 1,
    flexBasis: 340,
  },
  detail: { flex: 1, gap: 5 },
  category: { fontSize: 10, color: '#8A9995' },
  name: { fontSize: 14, lineHeight: 21, fontWeight: '700', color: '#244348' },
  muscles: { fontSize: 12, color: '#C46F5B' },
  secondary: { fontSize: 10, lineHeight: 16, color: '#84928F' },
  arrow: { color: '#74868A' },
});
