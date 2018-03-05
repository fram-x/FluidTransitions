import React from 'react';
import { Dimensions, Animated } from 'react-native';

import BaseTransition from './BaseTransition';
import { TransitionSpecification } from './../Types';

class BottomTransition extends BaseTransition {
  getTransitionStyle(transitionSpecification: TransitionSpecification) {
    if (!transitionSpecification || transitionSpecification.metrics === undefined) {
      return {};
    }

    const { y, height } = transitionSpecification.metrics;
    const distanceValue = Dimensions.get('window').height - (y + 25);
    const progress = transitionSpecification.progress.interpolate({
      inputRange: [0, 1],
      outputRange: transitionSpecification.reverse ? [0, distanceValue] : [distanceValue, 0],
    });

    return { transform: [{ translateY: progress }] };
  }
}

export default BottomTransition;
