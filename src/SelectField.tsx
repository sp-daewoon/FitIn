import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { t } from './i18n';

export function SelectField<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${options.find((x) => x.value === value)?.label}`}
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen(true)}
        style={s.field}
      >
        <Text style={s.label}>{label}</Text>
        <Text style={s.value}>{options.find((x) => x.value === value)?.label ?? value} ▾</Text>
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={s.backdrop}>
          <View accessibilityViewIsModal style={s.sheet}>
            <Text style={s.title}>{label}</Text>
            <ScrollView>
              {options.map((option) => (
                <Pressable
                  key={option.value}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: value === option.value }}
                  onPress={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  style={s.option}
                >
                  <Text style={s.value}>{option.label}</Text>
                  <Text>{value === option.value ? '✓' : ''}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Pressable accessibilityRole="button" onPress={() => setOpen(false)} style={s.option}>
              <Text>{t('닫기')}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}
const s = StyleSheet.create({
  field: {
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: '#F0F5F1',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  label: { color: '#61766D', fontSize: 13, flexShrink: 1 },
  value: { color: '#244348', fontSize: 14, fontWeight: '600', flexShrink: 1 },
  backdrop: { flex: 1, backgroundColor: '#0007', justifyContent: 'center', padding: 24 },
  sheet: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '80%',
    alignSelf: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 22,
  },
  title: { fontSize: 20, color: '#244348', fontWeight: '700', marginBottom: 12 },
  option: {
    minHeight: 48,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#EDF0EC',
  },
});
