import { StyleSheet } from 'react-native';
import { InterpolatorSpecification } from './../Types/InterpolatorSpecification';
import { getStyleInterpolator } from './getStyleInterpolator';

export const getTextInterpolator = (spec: InterpolatorSpecification): StyleSheet.NamedStyles => {  
  const color = getStyleInterpolator('color', 0, false, spec);
  //const borderColor = getStyleInterpolator("borderColor", 0, false, spec);
  //const borderTopColor = getStyleInterpolator("borderTopColor", 0, false, spec);
  return { animationStyles: { color }};
}