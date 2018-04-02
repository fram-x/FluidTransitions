import { StyleSheet } from 'react-native';
import { InterpolatorSpecification } from './../Types/InterpolatorSpecification';

export const getScaleInterpolator = (spec: InterpolatorSpecification): StyleSheet.NamedStyles => {
  
  const scaleX = spec.nativeInterpolatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, spec.scaleX],
  });

  const scaleY = spec.nativeInterpolatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, spec.scaleY],
  });

  return { transform: [{ scaleX }, { scaleY }]};
}