import { StyleSheet } from 'react-native';
import { InterpolatorSpecification } from './../Types/InterpolatorSpecification';

export const getBorderInterpolator = (spec: InterpolatorSpecification): StyleSheet.NamedStyles => {
  
  const fromStyle = spec.from.style;
  const toStyle = spec.to.style;

  if((!fromStyle || !fromStyle.borderRadius ) && 
    (!toStyle || !toStyle.borderRadius )) return null;

  const fromBorderRadius = fromStyle.borderRadius ? fromStyle.borderRadius : 0;
  const toBorderRadius = toStyle.borderRadius ? toStyle.borderRadius : 0;
  const fromBorderWidth = fromStyle.borderWidth ? fromStyle.borderWidth : 0;
  const toBorderWidth = toStyle.borderWidth ? toStyle.borderWidth : 0;

  const borderRadius = spec.interpolatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [fromBorderRadius, toBorderRadius],
  });

  const borderWidth = spec.interpolatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [fromBorderWidth, toBorderWidth],
  });

  return { borderRadius, borderWidth };
}