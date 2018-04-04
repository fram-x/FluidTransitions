import { StyleSheet } from 'react-native';
import { InterpolatorSpecification } from './../Types/InterpolatorSpecification';

export const getPositionInterpolator = (spec: InterpolatorSpecification): StyleSheet.NamedStyles => {
  
  const layout = spec.modifiers.indexOf("layout") > -1;
  if(layout) {
    const translateX = spec.nativeInterpolation.interpolate({
      inputRange: [0, 1],
      outputRange: [spec.from.metrics.x, spec.to.metrics.x],
    });
  
    const translateY = spec.nativeInterpolation.interpolate({
      inputRange: [0, 1],
      outputRange: [spec.from.metrics.y, spec.to.metrics.y],
    });

    const width = spec.interpolation.interpolate({
      inputRange: [0, 1],
      outputRange: [spec.from.metrics.width, spec.to.metrics.width]
    });

    const height = spec.interpolation.interpolate({
      inputRange: [0, 1],
      outputRange: [spec.from.metrics.height, spec.to.metrics.height]
    });
  
    return { width, height, transform: [{ translateX }, { translateY }]};
  }
  const translateX = spec.nativeInterpolation.interpolate({
    inputRange: [0, 1],
    outputRange: [spec.from.metrics.x, spec.to.metrics.x +
      spec.from.metrics.width / 2 * (spec.scaleX - 1)],
  });

  const translateY = spec.nativeInterpolation.interpolate({
    inputRange: [0, 1],
    outputRange: [spec.from.metrics.y, spec.to.metrics.y +
      spec.from.metrics.height / 2 * (spec.scaleY - 1)],
  });

  return { transform: [{ translateX }, { translateY }]};
}