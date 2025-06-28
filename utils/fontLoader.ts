import * as Font from 'expo-font';

// Only load the fonts that are actually used in the app
// This reduces the APK size by not including unused font variants
export const loadFonts = async () => {
  try {
    await Font.loadAsync({
      'Nunito-Regular': require('../assets/fonts/Nunito-Regular.ttf'),
      'Nunito-Bold': require('../assets/fonts/Nunito-Bold.ttf'),
      // Only load these if they're actually used in your app
      // 'Nunito-SemiBold': require('../assets/fonts/Nunito-SemiBold.ttf'),
      // 'Nunito-Italic': require('../assets/fonts/Nunito-Italic.ttf'),
    });
  } catch (error) {
    console.warn('Font loading failed:', error);
  }
};

// Font family constants for consistent usage
export const FONT_FAMILIES = {
  regular: 'Nunito-Regular',
  bold: 'Nunito-Bold',
  // semiBold: 'Nunito-SemiBold',
  // italic: 'Nunito-Italic',
} as const; 