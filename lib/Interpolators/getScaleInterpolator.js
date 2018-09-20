import { StyleSheet } from 'react-native';
import { InterpolatorSpecification } from '../Types/InterpolatorSpecification';

export const getScaleInterpolator = (spec: InterpolatorSpecification): StyleSheet.Styles => {
  if (spec.equalAspectRatio) {
    const interpolator = spec.getInterpolation(true);

    const scaleX = interpolator.interpolate({
      inputRange: [0, 1],
      outputRange: [1, spec.scaleX],
    });

    const scaleY = interpolator.interpolate({
      inputRange: [0, 1],
      outputRange: [1, spec.scaleY],
    });

    return { nativeAnimationStyles: { transform: [{ scaleX }, { scaleY }] } };
  }
  const interpolator = spec.getInterpolation(false);
  const width = interpolator.interpolate({
    inputRange: [0, 1],
    outputRange: [spec.from.metrics.width, spec.to.metrics.width],
  });
  const height = interpolator.interpolate({
    inputRange: [0, 1],
    outputRange: [spec.from.metrics.height, spec.to.metrics.height],
  });
  return { animationStyles: { width, height } };
};
