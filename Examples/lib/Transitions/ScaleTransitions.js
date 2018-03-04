import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, Animated } from 'react-native';

import BaseTransition from './BaseTransition';

class ScaleTransition extends BaseTransition {
  getTransitionStyle(transitionConfiguration) {
    if(!transitionConfiguration)
      return { opacity: 0 };
      
    const scaleInterpolation = transitionConfiguration.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [transitionConfiguration.start, transitionConfiguration.end],
    });
    return {
            transform: [{ scaleX: scaleInterpolation }, { scaleY: scaleInterpolation }]
    };
  }	
}

export default ScaleTransition;