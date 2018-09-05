import { RouteDirection, TransitionSpecification } from '../Types';

export const getTopTransition = (transitionSpecification: TransitionSpecification) => {
  if (!transitionSpecification || transitionSpecification.metrics === undefined) { return { }; }

  const { start, end, boundingbox } = transitionSpecification;
  const { y, height } = boundingbox;

  const distanceValue = -(height + y + 25);
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
      translateY: progress,
    }],
  };
};
