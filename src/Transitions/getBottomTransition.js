import { TransitionSpecification } from './../Types/TransitionSpecification';

export const getBottomTransition = (transitionSpecification: TransitionSpecification) => {
  if (!transitionSpecification || transitionSpecification.metrics === undefined) {
    return {};
  }
  const { start, end, metrics, reverse, dimensions } = transitionSpecification;
  const { y, height } = metrics;
  const distanceValue = dimensions.height - (y + 25);
  const progress = transitionSpecification.progress.interpolate({
    inputRange: [0, start, end, 1],
    outputRange: reverse ? [0, 0, distanceValue, distanceValue] : [distanceValue, distanceValue, 0, 0],
  });

  return { transform: [{ translateY: progress }] };
}
