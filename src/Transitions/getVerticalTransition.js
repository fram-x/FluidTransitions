import { TransitionSpecification } from './../Types/TransitionSpecification';

export const getVerticalTransition = (transitionSpecification: TransitionSpecification) => {
  if(!transitionSpecification || transitionSpecification.metrics === undefined)
    return { };
      
    const { metrics, dimensions } = transitionSpecification;
    const { y, height } = metrics;
    
    let start = 0;
    let end = 0;
    if(transitionSpecification.reverse === false && transitionSpecification.direction === 1){
      start = dimensions.height + 25;
      end = 0;
    } else if(transitionSpecification.reverse === true && transitionSpecification.direction === 1){
      start = 0;
      end = -(dimensions.height + 25);
    } else if(transitionSpecification.reverse === false && transitionSpecification.direction === -1){
      start = -(dimensions.height + 25);
      end = 0;
    } else if(transitionSpecification.reverse === true && transitionSpecification.direction === -1){
      start = 0;
      end = dimensions.height - 25;
    }
        
    const transitionProgress = transitionSpecification.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [start, end]
    });

  return { transform: [{ translateY: transitionProgress }] };
}
