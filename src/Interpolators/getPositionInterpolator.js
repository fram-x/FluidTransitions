import { StyleSheet } from 'react-native';
import { InterpolatorSpecification } from './../Types/InterpolatorSpecification';

export const getPositionInterpolator = (spec: InterpolatorSpecification): StyleSheet.NamedStyles => {
  
  const translateX = spec.nativeInterpolatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [spec.from.metrics.x, spec.to.metrics.x +
      spec.from.metrics.width / 2 * (spec.scaleX - 1)],
  });

  const translateY = spec.nativeInterpolatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [spec.from.metrics.y, spec.to.metrics.y +
      spec.from.metrics.height / 2 * (spec.scaleY - 1)],
  });

  return { transform: [{ translateX }, { translateY }]};
}