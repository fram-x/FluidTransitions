import { TransitionSpecification } from './../Types/TransitionSpecification';

export const getLeftTransition = (transitionConfiguration: TransitionSpecification) => {
  if (!transitionConfiguration || transitionConfiguration.metrics === undefined)
    return {};

  const { start, reverse, end, x, width } = transitionConfiguration.metrics;
  const distanceValue = -(width + x + 25);
  const progress = transitionConfiguration.progress.interpolate({
    inputRange: [0, start, end, 1],
    outputRange: reverse ? [0, 0, distanceValue, distanceValue] : [distanceValue, distanceValue, 0, 0],
  });

  return {
    transform: [{ translateX: progress }]
  };
}