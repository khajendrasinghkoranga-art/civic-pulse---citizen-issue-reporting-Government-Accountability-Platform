import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface BadgeProps {
  label: string;
  color: string;
  bg: string;
}

export function Badge({ label, color, bg }: BadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
  },
});
