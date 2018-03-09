import { TransitionSpecification } from './../Types/TransitionSpecification';

export const getTopTransition = (transitionConfiguration: TransitionSpecification) => {
  if(!transitionConfiguration || transitionConfiguration.metrics === undefined)
    return { };

  const { y, height } = transitionConfiguration.metrics;
  const distanceValue = -(height + y + 25);		
  const progress = transitionConfiguration.progress.interpolate({
    inputRange: [0, 1],
    outputRange: transitionConfiguration.reverse ? [0, distanceValue] : [distanceValue, 0]
  });

  return {			
    transform: [{
      translateY: progress
    }]
  };
}

