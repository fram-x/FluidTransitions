import { StyleSheet } from 'react-native';
import { InterpolatorSpecification } from './../Types/InterpolatorSpecification';
import { IntepolatorResult } from './../Types/InterpolatorResult';

export const getPositionInterpolator = (spec: InterpolatorSpecification): StyleSheet.NamedStyles => {  
  const layout = spec.modifiers.indexOf("layout") > -1;  
  if(layout) {    
    const interpolator = spec.getInterpolation(false);
    const translateX = interpolator.interpolate({
      inputRange: [0, 1],
      outputRange: [spec.from.metrics.x, spec.to.metrics.x],
    });
  
    const translateY = interpolator.interpolate({
      inputRange: [0, 1],
      outputRange: [spec.from.metrics.y, spec.to.metrics.y],
    });

    const width = interpolator.interpolate({
      inputRange: [0, 1],
      outputRange: [spec.from.metrics.width, spec.to.metrics.width]
    });

    const height = interpolator.interpolate({
      inputRange: [0, 1],
      outputRange: [spec.from.metrics.height, spec.to.metrics.height]
    });
  
    return { animationStyles: { 
      width, 
      height, 
      transform: [{ translateX }, { translateY }]} 
    };
  }

  const interpolator = spec.getInterpolation(true);
  const translateX = interpolator.interpolate({
    inputRange: [0, 1],
    outputRange: [spec.from.metrics.x, spec.to.metrics.x +
      spec.from.metrics.width / 2 * (spec.scaleX - 1)],
  });

  const translateY = interpolator.interpolate({
    inputRange: [0, 1],
    outputRange: [spec.from.metrics.y, spec.to.metrics.y +
      spec.from.metrics.height / 2 * (spec.scaleY - 1)],
  });

  return { nativeAnimationStyles: { 
    width: spec.from.metrics.width, 
    height: spec.from.metrics.height, 
    transform: [{ translateX }, { translateY }]} 
  };
}