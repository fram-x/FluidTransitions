import { StyleSheet } from 'react-native';
import { InterpolatorSpecification } from './../Types/InterpolatorSpecification';
import { IntepolatorResult } from './../Types/InterpolatorResult';

export const getScaleInterpolator = (spec: InterpolatorSpecification): StyleSheet.NamedStyles => {
  
  const layout = spec.modifiers.indexOf("layout") > -1;
  const interpolator = spec.getInterpolation(true);

  if(layout) {
    const width = interpolator.interpolate({
      inputRange: [0, 1],
      outputRange: [spec.from.metrics.width, spec.to.metrics.width]
    })

    const height = interpolator.interpolate({
      inputRange: [0, 1],
      outputRange: [spec.from.metrics.height, spec.to.metrics.height]
    })
    return { width, height };
  }

  const scaleX = interpolator.interpolate({
    inputRange: [0, 1],
    outputRange: [1, spec.scaleX],
  });

  const scaleY = interpolator.interpolate({
    inputRange: [0, 1],
    outputRange: [1, spec.scaleY],
  });

  return { nativeAnimationStyles: {transform: [{ scaleX }, { scaleY }]}};  
}