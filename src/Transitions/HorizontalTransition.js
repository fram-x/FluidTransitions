import React from 'react';
import { Dimensions, Animated } from 'react-native';

import BaseTransition from './BaseTransition';

class HorizontalTransition extends BaseTransition {
  getTransitionStyle(transitionSpecification) {
    if (!transitionSpecification || transitionSpecification.metrics === undefined)
      return {};

    const { x, width } = transitionSpecification.metrics;
    let start = 0;
    let end = 0;
    if(transitionSpecification.reverse === false && transitionSpecification.direction === 1){
      start = Dimensions.get('window').width - (x - 25);
      end = 0;
    } else if(transitionSpecification.reverse === true && transitionSpecification.direction === 1){
      start = 0;
      end = -(width + x + 25);
    } else if(transitionSpecification.reverse === false && transitionSpecification.direction === -1){
      start = -(width + x + 25);
      end = 0;
    } else if(transitionSpecification.reverse === true && transitionSpecification.direction === -1){
      start = 0;
      end = Dimensions.get('window').width - (x - 25);
    }

    const progress = transitionSpecification.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [start, end]
    });

    return {
      transform: [{
        translateX: progress
      }]
    };
  }
}

export default HorizontalTransition;