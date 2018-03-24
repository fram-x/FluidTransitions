import { TransitionSpecification } from './../Types/TransitionSpecification';

export const getRightTransition = (transitionConfiguration: TransitionSpecification) => {
  if(!transitionConfiguration || transitionConfiguration.metrics === undefined)
    return { };

  const { start, end, metrics, dimensions } = transitionSpecification;
  const { x, width } = metrics;
  const distanceValue = dimensions.width-(x - 25);
  const progress = transitionConfiguration.progress.interpolate({
    inputRange: [0, start, end, 1],
    outputRange: [distanceValue, distanceValue, 0, 0],
  });

  return {
    transform: [{
      translateX: progress
    }]
  };
}

