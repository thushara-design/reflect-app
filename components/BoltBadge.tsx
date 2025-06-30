import React from 'react';
import { View, Image, TouchableOpacity, Linking, StyleSheet } from 'react-native';

interface BoltBadgeProps {
  size?: number;
  style?: any;
}

export default function BoltBadge({ size = 40, style }: BoltBadgeProps) {
  const handlePress = () => {
    Linking.openURL('https://bolt.new');
  };

  return (
    <TouchableOpacity onPress={handlePress} style={[styles.container, style]}>
      <Image
        source={require('../assets/images/black_circle_360x360.png')}
        style={[styles.badge, { width: size, height: size }]}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    borderRadius: 20,
  },
});