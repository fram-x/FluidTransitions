import { TransitionSpecification } from './../Types/TransitionSpecification';

export const getTopTransition = (transitionConfiguration: TransitionSpecification) => {
  if(!transitionConfiguration || transitionConfiguration.metrics === undefined)
    return { };

  const { start, end, reverse, y, height } = transitionConfiguration.metrics;
  const distanceValue = -(height + y + 25);		
  const progress = transitionConfiguration.progress.interpolate({
    inputRange: [0, start, end, 1],
    outputRange: reverse ? [0, 0, distanceValue, distanceValue] : [distanceValue, distanceValue, 0, 0],
  });

  return {			
    transform: [{
      translateY: progress
    }]
  };
}

