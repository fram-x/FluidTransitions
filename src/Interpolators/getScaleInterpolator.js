import { StyleSheet } from 'react-native';
import { InterpolatorSpecification } from './../Types/InterpolatorSpecification';

export const getScaleInterpolator = (spec: InterpolatorSpecification): StyleSheet.NamedStyles => {
  
  const layout = spec.modifiers.indexOf("layout") > -1;
  if(layout) {
    const width = spec.nativeInterpolation.interpolate({
      inputRange: [0, 1],
      outputRange: [spec.from.metrics.width, spec.to.metrics.width]
    })

    const height = spec.nativeInterpolation.interpolate({
      inputRange: [0, 1],
      outputRange: [spec.from.metrics.height, spec.to.metrics.height]
    })
    return { width, height };
  }

  const scaleX = spec.nativeInterpolation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, spec.scaleX],
  });

  const scaleY = spec.nativeInterpolation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, spec.scaleY],
  });

  return { transform: [{ scaleX }, { scaleY }]};  
}