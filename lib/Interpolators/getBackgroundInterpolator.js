import { StyleSheet } from 'react-native';
import { InterpolatorSpecification } from '../Types/InterpolatorSpecification';
import { getStyleInterpolator } from './getStyleInterpolator';

export const getBackgroundInterpolator = (spec: InterpolatorSpecification): StyleSheet.Styles => {
  const backgroundColor = getStyleInterpolator('backgroundColor', 'transparent', false, spec);
  return { animationStyles: { backgroundColor } };
};
