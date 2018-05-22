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

  const fromValue = fromStyle && fromStyle[key] ? fromStyle[key] : defaultValue;
  let toValue = toStyle && toStyle[key] ? toStyle[key] : defaultValue;
  // Handle scaling of numeric values
  var parsed = parseInt(toValue);
  if (!isNaN(parsed)) { 
    toValue = parsed / spec.scaleX;
  }
  
  const interpolator = (spec.getInterpolation(useNative))
    .interpolate({
      inputRange: [0, 1],
      outputRange: [fromValue, toValue],
    });
  
  return interpolator;
}