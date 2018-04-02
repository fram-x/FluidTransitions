import { StyleSheet } from 'react-native';
import { InterpolatorSpecification } from './../Types/InterpolatorSpecification';

export const getBorderRadiusInterpolator = (spec: InterpolatorSpecification): StyleSheet.NamedStyles => {
  
  const fromStyle = spec.from.style;
  const toStyle = spec.to.style;

  if((!fromStyle || !fromStyle.borderRadius ) && 
    (!toStyle || !toStyle.borderRadius )) return null;

  const fromBorderRadius = fromStyle.borderRadius ? fromStyle.borderRadius : 0;
  const toBorderRadius = toStyle.borderRadius ? toStyle.borderRadius : 0;

  const borderRadius = spec.interpolatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [fromBorderRadius, toBorderRadius],
  });

  return { borderRadius };
}