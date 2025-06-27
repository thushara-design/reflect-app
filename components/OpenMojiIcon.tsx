import React from 'react';
import { Platform, Image, View, StyleSheet } from 'react-native';
import SvgUri from 'react-native-svg-uri-reborn';

interface OpenMojiIconProps {
  uri: string;
  width: number;
  height: number;
  style?: any;
}

export default function OpenMojiIcon({ uri, width, height, style }: OpenMojiIconProps) {
  // On web, use Image component with PNG fallback
  if (Platform.OS === 'web') {
    // Convert SVG URL to PNG URL for web compatibility
    const pngUri = uri.replace('/data/black/svg/', '/data/color/618x618/').replace('.svg', '.png');
    
    return (
      <Image
        source={{ uri: pngUri }}
        style={[
          {
            width,
            height,
            resizeMode: 'contain',
          },
          style,
        ]}
        onError={() => {
          // Fallback to original SVG if PNG fails
          console.warn('Failed to load OpenMoji PNG, trying SVG fallback');
        }}
      />
    );
  }

  // On native platforms, use SvgUri
  return (
    <View style={style}>
      <SvgUri 
        width={width} 
        height={height} 
        source={{ uri }} 
      />
    </View>
  );
}