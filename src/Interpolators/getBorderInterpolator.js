import { StyleSheet } from 'react-native';
import { InterpolatorSpecification } from './../Types/InterpolatorSpecification';
import { getStyleInterpolator } from './getStyleInterpolator';

export const getBorderInterpolator = (spec: InterpolatorSpecification): StyleSheet.NamedStyles => {
  
  const borderRadius = getStyleInterpolator('borderRadius', 0, false, spec);
  const borderWidth = getStyleInterpolator('borderWidth', 0, false, spec);
  
  return { borderRadius, borderWidth };
}