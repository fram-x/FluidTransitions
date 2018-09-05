import { RouteDirection, TransitionSpecification } from '../Types';

export const getRightTransition = (transitionSpecification: TransitionSpecification) => {
  if (!transitionSpecification || transitionSpecification.metrics === undefined) { return { }; }

  const { start, end, boundingbox, dimensions } = transitionSpecification;
  const { x } = boundingbox;

  const distanceValue = dimensions.width - (x - 25);
  let startValue = 0;
  let endValue = distanceValue;

  if (transitionSpecification.direction === RouteDirection.to) {
    startValue = distanceValue;
    endValue = 0;
  }

  const progress = transitionSpecification.progress.interpolate({
    inputRange: [0, start, end, 1],
    outputRange: [startValue, startValue, endValue, endValue],
  });

  return {
    transform: [{
      translateX: progress,
    }],
  };
};
