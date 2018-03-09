import { TransitionSpecification } from './../Types/TransitionSpecification';

export const getRightTransition = (transitionConfiguration: TransitionSpecification) => {
  if(!transitionConfiguration || transitionConfiguration.metrics === undefined)
    return { };

  const { metrics, dimensions } = transitionSpecification;
  const { x, width } = metrics;
  const distanceValue = dimensions.width-(x - 25);
  const progress = transitionConfiguration.progress.interpolate({
    inputRange: [0, 1],
    outputRange: transitionConfiguration.reverse ? [0, distanceValue] : [distanceValue, 0]
  });

  return {			
    transform: [{
      translateX: progress
    }]
  };
}

