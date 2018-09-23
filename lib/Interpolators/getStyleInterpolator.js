import { StyleSheet } from 'react-native';
import { InterpolatorSpecification } from '../Types/InterpolatorSpecification';

export const getStyleInterpolator = (
  key: String,
  defaultValue: any,
  useNative: boolean,
  spec: InterpolatorSpecification,
  scale: boolean = true,
): StyleSheet.Styles => {
  const fromStyle = spec.from.style;
  const toStyle = spec.to.style;

  if ((!fromStyle || !fromStyle[key])
    && (!toStyle || !toStyle[key])) return null;

  const fromValue = fromStyle && fromStyle[key] !== undefined ? fromStyle[key] : defaultValue;
  let toValue = toStyle && toStyle[key] !== undefined ? toStyle[key] : defaultValue;

  if (fromValue === toValue) return null;

  // Handle scaling of numeric values
  const parsed = parseInt(toValue, 10);
  if (scale) {
    if (!Number.isNaN(parsed)) {
      toValue = parsed / spec.scaleX;
    }
  } else {
    toValue = parsed;
  }

  const interpolator = (spec.getInterpolation(useNative))
    .interpolate({
      inputRange: [0, 1],
      outputRange: [fromValue, toValue],
    });

  return interpolator;
};
