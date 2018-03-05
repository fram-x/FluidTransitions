import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, Animated } from 'react-native';

import BaseTransition from './BaseTransition';

class SharedTransition extends BaseTransition {
  getTransitionStyle(transitionConfiguration) {
    if(transitionConfiguration){
      let style = {};
      if(this.props.appear) {
        const props = {
          ...this.props,
          shared: null,
        }
        const transitionHelper = this.getTransitionHelper(this.props.appear);
        style = transitionHelper.getTransitionStyle(transitionConfiguration);
      }

      return {
        ...style,
        opacity: this.context.sharedProgress.interpolate({
          inputRange: [0, 0.5, 0.5, 1],
          outputRange: [1, 1, 0, 0],
        })
      };
    }
    else{
      return { opacity: 1 };
    }
  }
}

export default SharedTransition;