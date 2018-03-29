import { TransitionSpecification } from './../Types/TransitionSpecification';

export const getLeftTransition = (transitionSpecification: TransitionSpecification) => {
  if (!transitionSpecification || transitionSpecification.metrics === undefined)
    return {};

  const { start, end, metrics, dimensions } = transitionSpecification;
  const { x, width } = metrics;
  const distanceValue = -(width + x + 25);
  const progress = transitionSpecification.progress.interpolate({
    inputRange: [0, start, end, 1],
    outputRange: [distanceValue, distanceValue, 0, 0],
  });

  return {
    transform: [{ translateX: progress }]
  };
}