import { RouteDirection, TransitionSpecification } from '../Types';

export const getBottomTransition = (transitionSpecification: TransitionSpecification) => {
  if (!transitionSpecification || transitionSpecification.metrics === undefined) {
    return {};
  }
  const { start, end, boundingbox, dimensions } = transitionSpecification;
  const { y } = boundingbox;

  const distanceValue = dimensions.height - y;
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

  return { transform: [{ translateY: progress }] };
};
