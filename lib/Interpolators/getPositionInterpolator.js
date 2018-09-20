import { StyleSheet } from 'react-native';
import { InterpolatorSpecification } from '../Types/InterpolatorSpecification';

export const getPositionInterpolator = (spec: InterpolatorSpecification): StyleSheet.Styles => {
  const nativeInterpolator = spec.getInterpolation(true);
  if (spec.equalAspectRatio) {
  // Create Native interpolation
    const translateX = nativeInterpolator.interpolate({
      inputRange: [0, 1],
      outputRange: [0, (spec.to.metrics.x - spec.from.metrics.x)
      + spec.from.metrics.width / 2 * (spec.scaleX - 1)],
    });

    const translateY = nativeInterpolator.interpolate({
      inputRange: [0, 1],
      outputRange: [0, (spec.to.metrics.y - spec.from.metrics.y)
      + spec.from.metrics.height / 2 * (spec.scaleY - 1)],
    });

    return { nativeAnimationStyles: {
      width: spec.from.metrics.width,
      height: spec.from.metrics.height,
      transform: [{ translateX }, { translateY }] },
    };
  }

  const translateX = nativeInterpolator.interpolate({
    inputRange: [0, 1],
    outputRange: [0, (spec.to.metrics.x - spec.from.metrics.x)],
  });

  const translateY = nativeInterpolator.interpolate({
    inputRange: [0, 1],
    outputRange: [0, (spec.to.metrics.y - spec.from.metrics.y)],
  });

  return { nativeAnimationStyles: {
    transform: [{ translateX }, { translateY }] },
  };
};
