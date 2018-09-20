import { StyleSheet } from 'react-native';
import { InterpolatorSpecification } from '../Types/InterpolatorSpecification';
import { getStyleInterpolator } from './getStyleInterpolator';

export const getTextInterpolator = (spec: InterpolatorSpecification): StyleSheet.Styles => {
  const fontSize = getStyleInterpolator('fontSize', null, false, spec);
  // const fontWeight = getStyleInterpolator('fontWeight', null, false, spec, false);
  // const fontFamily = getStyleInterpolator('fontFamily', null, false, spec);
  const color = getStyleInterpolator('color', null, false, spec);
  return { animationStyles: { fontSize, /* fontWeight, fontFamily, */ color } };
};
