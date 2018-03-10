import { TransitionSpecification } from './../Types/TransitionSpecification';

export const getVerticalTransition = (transitionSpecification: TransitionSpecification) => {
  if(!transitionSpecification || transitionSpecification.metrics === undefined)
    return { };
      
    const { start, end, metrics, dimensions } = transitionSpecification;
    const { y, height } = metrics;
    
    let startPosition = 0;
    let endPosition = 0;
    if(transitionSpecification.reverse === false && transitionSpecification.direction === 1){
      startPosition = dimensions.height + 25;
      endPosition = 0;
    } else if(transitionSpecification.reverse === true && transitionSpecification.direction === 1){
      startPosition = 0;
      endPosition = -(dimensions.height + 25);
    } else if(transitionSpecification.reverse === false && transitionSpecification.direction === -1){
      startPosition = -(dimensions.height + 25);
      endPosition = 0;
    } else if(transitionSpecification.reverse === true && transitionSpecification.direction === -1){
      startPosition = 0;
      endPosition = dimensions.height - 25;
    }
        
    const transitionProgress = transitionSpecification.progress.interpolate({
      inputRange: [0, start, end, 1],
      outputRange: [startPosition, startPosition, endPosition, endPosition]
    });

  return { transform: [{ translateY: transitionProgress }] };
}
