import React from 'react';
import { Platform } from 'react-native';
import { TransitionSpecification } from './../Types/TransitionSpecification';

export const getScaleTransition = (transitionSpecification: TransitionSpecification) => {
  if (!transitionSpecification) {
    return { opacity: 0 };
  }
  // When scaling we need to handle Android's scaling issues
  let start = transitionSpecification.reverse ? 1 : 0.005;
  let end = transitionSpecification.reverse ? 0.005 : 1;

  if(Platform.OS === 'ios'){
    start = transitionSpecification.reverse ? 1 : 0;
    end = transitionSpecification.reverse ? 0 : 1;
  }

  const scaleInterpolation = transitionSpecification.progress.interpolate({
    inputRange: [0, 1],
    outputRange: [start, end],
  });

  return { transform: [
    { scale: scaleInterpolation },
  ]};
}