import React from 'react';
import { Platform } from 'react-native';
import { TransitionSpecification } from './../Types/TransitionSpecification';

export const getScaleTransition = (transitionSpecification: TransitionSpecification) => {
  if (!transitionSpecification) {
    return { opacity: 0 };
  }
  // When scaling we need to handle Android's scaling issues
  let startPosition = transitionSpecification.reverse ? 1 : 0.005;
  let endPosition = transitionSpecification.reverse ? 0.005 : 1;

  if(Platform.OS === 'ios'){
    startPosition = transitionSpecification.reverse ? 1 : 0;
    endPosition = transitionSpecification.reverse ? 0 : 1;
  }
  const { progress, start, end } = transitionSpecification;
  const scaleInterpolation = progress.interpolate({
    inputRange: [0, start, end, 1],
    outputRange: [startPosition, startPosition, endPosition, endPosition],
  });

  return { transform: [
    { scale: scaleInterpolation },
  ]};
}