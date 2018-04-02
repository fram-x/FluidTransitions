import { StyleSheet } from 'react-native';
import { InterpolatorSpecification } from './../Types/InterpolatorSpecification';

export const getBackgroundInterpolator = (spec: InterpolatorSpecification): StyleSheet.NamedStyles => {
  
  const fromStyle = spec.from.style;
  const toStyle = spec.to.style;

  if((!fromStyle || !fromStyle.backgroundColor ) && 
    (!toStyle || !toStyle.backgroundColor )) return null;

  const fromBackground = fromStyle.backgroundColor ? fromStyle.backgroundColor : 'transparent';
  const toBackground = toStyle.backgroundColor ? toStyle.backgroundColor : 'transparent';

  const backgroundColor = spec.interpolatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [fromBackground, toBackground],
  });

  return { backgroundColor };
}