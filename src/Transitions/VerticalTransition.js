import React from 'react';
import { Dimensions, Animated } from 'react-native';

import BaseTransition from './BaseTransition';

class VerticalTransition extends BaseTransition {
  getTransitionStyle(transitionSpecification) {
    if(!transitionSpecification || transitionSpecification.metrics === undefined)
      return { };
        
    const { y, height } = transitionSpecification.metrics;
    let start = 0;
    let end = 0;
    if(transitionSpecification.reverse === false && transitionSpecification.direction === 1){
      start = -(height + y + 25);
      end = 0;
    } else if(transitionSpecification.reverse === true && transitionSpecification.direction === 1){
      start = 0;
      end = Dimensions.get('window').height - (y - 25);
    } else if(transitionSpecification.reverse === false && transitionSpecification.direction === -1){
      start = Dimensions.get('window').height - (y - 25);      
      end = 0;
    } else if(transitionSpecification.reverse === true && transitionSpecification.direction === -1){
      start = 0;      
      end = -(height + y + 25);
    }

    const progress = transitionSpecification.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [start, end]
    });

    return {			
      transform: [{
        translateY: progress
      }]
    };
  }
}

export default VerticalTransition;