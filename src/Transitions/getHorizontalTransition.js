import { RouteDirection, TransitionSpecification } from './../Types';

export const getHorizontalTransition = (transitionInfo: TransitionSpecification) => {
  if (!transitionInfo || transitionInfo.metrics === undefined)
    return {};

  const { start, end, metrics, dimensions } = transitionInfo;
  const { x, width } = metrics;
  
  let startPosition = 0;
  let endPosition = 0;
  
  if(transitionInfo.direction === RouteDirection.from){
    startPosition = -(dimensions.width + 25);
    endPosition = 0;
  }
  else if(transitionInfo.direction === RouteDirection.to){
    startPosition = dimensions.width + 25;
    endPosition = 0;  
  }

  if(transitionInfo.reverse){
    const tmp = startPosition;
    startPosition = endPosition;
    endPosition = tmp;
  }
      
  const transitionProgress = transitionInfo.progress.interpolate({
    inputRange: [0, start, end, 1],
    outputRange: [startPosition, startPosition, endPosition, endPosition]
  });

  return { transform: [{ translateX: transitionProgress }] };
}

