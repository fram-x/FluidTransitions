import { StyleSheet } from 'react-native';
import { InterpolatorSpecification } from './../Types/InterpolatorSpecification';

export const getStyleInterpolator = (
  key: String,
  defaultValue: any,
  useNative: boolean,
  spec: InterpolatorSpecification): StyleSheet.NamedStyles => {
  
  const fromStyle = spec.from.style;
  const toStyle = spec.to.style;

  if((!fromStyle || !fromStyle[key] ) && 
    (!toStyle || !toStyle[key] )) return null;

  const fromValue = fromStyle[key] ? fromStyle[key] : defaultValue;
  const toValue = toStyle[key] ? toStyle[key] : defaultValue;
  
  const interpolator = (useNative ? spec.nativeInterpolation : spec.interpolation)
    .interpolate({
      inputRange: [0, 1],
      outputRange: [fromValue, toValue],
    });
  
  return interpolator;
}