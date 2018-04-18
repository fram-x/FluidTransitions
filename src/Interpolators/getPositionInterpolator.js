import { StyleSheet } from 'react-native';
import { InterpolatorSpecification } from './../Types/InterpolatorSpecification';
import { IntepolatorResult } from './../Types/InterpolatorResult';

export const getPositionInterpolator = (spec: InterpolatorSpecification): StyleSheet.NamedStyles => {  
  const nativeInterpolator = spec.getInterpolation(true);  
  // Create Native interpolation  
  const translateX = nativeInterpolator.interpolate({
    inputRange: [0, 1],
    outputRange: [0, (spec.to.metrics.x - spec.from.metrics.x) +
      spec.from.metrics.width / 2 * (spec.scaleX - 1)],
  });

  const translateY = nativeInterpolator.interpolate({
    inputRange: [0, 1],
    outputRange: [0, (spec.to.metrics.y - spec.from.metrics.y) +
      spec.from.metrics.height / 2 * (spec.scaleY - 1)],
  });

  return { nativeAnimationStyles: { 
    width: spec.from.metrics.width, 
    height: spec.from.metrics.height, 
    transform: [{ translateX }, { translateY }]} 
  };
}