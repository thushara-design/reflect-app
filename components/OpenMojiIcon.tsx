import React, { useState } from 'react';
import { Platform, Image, View, Text } from 'react-native';
import SvgUri from 'react-native-svg-uri-reborn';

interface OpenMojiIconProps {
  uri: string;
  width: number;
  height: number;
  style?: any;
}

export default function OpenMojiIcon({ uri, width, height, style }: OpenMojiIconProps) {
  const [imageError, setImageError] = useState(false);

  // On web, we need to use a different approach since SVG loading can be problematic
  if (Platform.OS === 'web') {
    // Extract the emoji code from the URI (e.g., "1F642" from "1F642.svg")
    const emojiCode = uri.split('/').pop()?.replace('.svg', '') || '';
    
    // Try multiple fallback strategies for web
    if (!imageError) {
      // First try: Use the color PNG version from OpenMoji
      const colorPngUri = `https://openmoji.org/data/color/svg/${emojiCode}.svg`;
      
      return (
        <Image
          source={{ uri: colorPngUri }}
          style={[
            {
              width,
              height,
              resizeMode: 'contain',
            },
            style,
          ]}
          onError={() => {
            console.warn('OpenMoji color SVG failed, trying fallback');
            setImageError(true);
          }}
        />
      );
    }

    // Fallback: Use Unicode emoji if available
    const getUnicodeEmoji = (code: string) => {
      try {
        // Convert hex code to Unicode character
        const codePoint = parseInt(code, 16);
        return String.fromCodePoint(codePoint);
      } catch {
        return '😊'; // Default fallback emoji
      }
    };

    const unicodeEmoji = getUnicodeEmoji(emojiCode);

    return (
      <View style={[
        {
          width,
          height,
          justifyContent: 'center',
          alignItems: 'center',
        },
        style,
      ]}>
        <Text style={{ fontSize: Math.min(width, height) * 0.8 }}>
          {unicodeEmoji}
        </Text>
      </View>
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