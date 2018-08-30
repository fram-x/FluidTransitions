import { StyleSheet } from 'react-native';
import { InterpolatorSpecification } from '../Types/InterpolatorSpecification';
import { getStyleInterpolator } from './getStyleInterpolator';

export const getBorderInterpolator = (spec: InterpolatorSpecification): StyleSheet.Styles => {
  const borderWidth = getStyleInterpolator('borderWidth', 0, false, spec);
  const borderColor = getStyleInterpolator('borderColor', 0, false, spec);
  const borderTopColor = getStyleInterpolator('borderTopColor', 0, false, spec);
  const borderRightColor = getStyleInterpolator('borderRightColor', 0, false, spec);
  const borderBottomColor = getStyleInterpolator('borderBottomColor', 0, false, spec);
  const borderLeftColor = getStyleInterpolator('borderLeftColor', 0, false, spec);
  const borderStartColor = getStyleInterpolator('borderStartColor', 0, false, spec);
  const borderEndColor = getStyleInterpolator('borderEndColor', 0, false, spec);
  const borderRadius = getStyleInterpolator('borderRadius', 0, false, spec);
  const borderTopLeftRadius = getStyleInterpolator('borderTopLeftRadius', 0, false, spec);
  const borderTopRightRadius = getStyleInterpolator('borderTopRightRadius', 0, false, spec);
  const borderTopStartRadius = getStyleInterpolator('borderTopStartRadius', 0, false, spec);
  const borderTopEndRadius = getStyleInterpolator('borderTopEndRadius', 0, false, spec);
  const borderBottomLeftRadius = getStyleInterpolator('borderBottomLeftRadius', 0, false, spec);
  const borderBottomRightRadius = getStyleInterpolator('borderBottomRightRadius', 0, false, spec);
  const borderBottomStartRadius = getStyleInterpolator('borderBottomStartRadius', 0, false, spec);
  const borderBottomEndRadius = getStyleInterpolator('borderBottomEndRadius', 0, false, spec);

  return {
    animationStyles: {
      borderWidth,
      borderColor,
      borderTopColor,
      borderRightColor,
      borderBottomColor,
      borderLeftColor,
      borderStartColor,
      borderEndColor,
      borderRadius,
      borderTopLeftRadius,
      borderTopRightRadius,
      borderTopStartRadius,
      borderTopEndRadius,
      borderBottomLeftRadius,
      borderBottomRightRadius,
      borderBottomStartRadius,
      borderBottomEndRadius,
    },
  };
};
