import { StyleSheet } from 'react-native';
import { InterpolatorSpecification } from '../Types/InterpolatorSpecification';

export const getScaleInterpolator = (spec: InterpolatorSpecification): StyleSheet.Styles => {
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
};
