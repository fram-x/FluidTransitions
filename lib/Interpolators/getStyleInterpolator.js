import { StyleSheet } from 'react-native';
import { InterpolatorSpecification } from '../Types/InterpolatorSpecification';

export const getStyleInterpolator = (
  key: String,
  defaultValue: any,
  useNative: boolean,
  spec: InterpolatorSpecification,
): StyleSheet.Styles => {
  const fromStyle = spec.from.style;
  const toStyle = spec.to.style;

  if ((!fromStyle || !fromStyle[key])
    && (!toStyle || !toStyle[key])) return null;

  const fromValue = fromStyle && fromStyle[key] ? fromStyle[key] : defaultValue;
  let toValue = toStyle && toStyle[key] ? toStyle[key] : defaultValue;

  if (fromValue === toValue) return null;

  // Handle scaling of numeric values
  const parsed = parseInt(toValue, 10);
  if (!Number.isNaN(parsed)) {
    toValue = parsed / spec.scaleX;
  }

  const interpolator = (spec.getInterpolation(useNative))
    .interpolate({
      inputRange: [0, 1],
      outputRange: [fromValue, toValue],
    });

  return interpolator;
};
