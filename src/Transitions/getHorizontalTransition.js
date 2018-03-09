import { TransitionSpecification } from './../Types/TransitionSpecification';

export const getHorizontalTransition = (transitionSpecification: TransitionSpecification) => {
  if (!transitionSpecification || transitionSpecification.metrics === undefined)
    return {};

  const { metrics, dimensions } = transitionSpecification;
  const { x, width } = metrics;
  
  let start = 0;
  let end = 0;
  if(transitionSpecification.reverse === false && transitionSpecification.direction === 1){
    start = dimensions.width + 25;
    end = 0;
  } else if(transitionSpecification.reverse === true && transitionSpecification.direction === 1){
    start = 0;
    end = -(dimensions.width + 25);
  } else if(transitionSpecification.reverse === false && transitionSpecification.direction === -1){
    start = -(dimensions.width + 25);
    end = 0;
  } else if(transitionSpecification.reverse === true && transitionSpecification.direction === -1){
    start = 0;
    end = dimensions.width - 25;
  }
      
  const transitionProgress = transitionSpecification.progress.interpolate({
    inputRange: [0, 1],
    outputRange: [start, end]
  });

  return { transform: [{ translateX: transitionProgress }] };
}

