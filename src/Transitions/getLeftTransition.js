import { TransitionSpecification } from './../Types/TransitionSpecification';

export const getLeftTransition = (transitionConfiguration: TransitionSpecification) => {
  if (!transitionConfiguration || transitionConfiguration.metrics === undefined)
    return {};

  const { x, width } = transitionConfiguration.metrics;
  const distanceValue = -(width + x + 25);
  const progress = transitionConfiguration.progress.interpolate({
    inputRange: [0, 1],
    outputRange: transitionConfiguration.reverse ? [0, distanceValue] : [distanceValue, 0]
  });

  return {
    transform: [{ translateX: progress }]
  };
}