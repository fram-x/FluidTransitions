import BaseTransition from './BaseTransition';
import { Easing, Animated } from 'react-native';

class ScaleTransition extends BaseTransition {
  getTransitionStyle(transitionSpecification) {
    if (!transitionSpecification) {
      return { opacity: 0 };
    }
    const start = transitionSpecification.reverse ? 1 : 0;
    const end = transitionSpecification.reverse ? 0 : 1;

    const scaleInterpolation = transitionSpecification.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [start, end],
    });
    return {
      transform: [{ scaleX: scaleInterpolation }, { scaleY: scaleInterpolation }],
    };
  }

  getTransitionConfig(config){
    return {
      ...config,
      mass: 0.1,
    }
  }
}

export default ScaleTransition;
