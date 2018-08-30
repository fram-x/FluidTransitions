import { Platform } from 'react-native';
import { RouteDirection, TransitionSpecification } from '../Types';

export const getScaleTransition = (transitionInfo: TransitionSpecification) => {
  // When scaling we need to handle Android's scaling issues and not use zero values
  let startPosition = transitionInfo.direction === RouteDirection.from ? 1 : 0.005;
  let endPosition = transitionInfo.direction === RouteDirection.from ? 0.005 : 1;

  if (Platform.OS === 'ios') {
    startPosition = transitionInfo.direction === RouteDirection.from ? 1 : 0;
    endPosition = transitionInfo.direction === RouteDirection.from ? 0 : 1;
  }

  const { progress, start, end } = transitionInfo;
  const scaleInterpolation = progress.interpolate({
    inputRange: [0, start, end, 1],
    outputRange: [startPosition, startPosition, endPosition, endPosition],
  });

  return { transform: [{ scale: scaleInterpolation }] };
};
