import { TransitionSpecification } from './../Types/TransitionSpecification';

export const getBottomTransition = (transitionSpecification: TransitionSpecification) => {
  if (!transitionSpecification || transitionSpecification.metrics === undefined) {
    return {};
  }
  const { metrics, dimensions } = transitionSpecification;
  const { y, height } = metrics;
  const distanceValue = dimensions.height - (y + 25);
  const progress = transitionSpecification.progress.interpolate({
    inputRange: [0, 1],
    outputRange: transitionSpecification.reverse ? [0, distanceValue] : [distanceValue, 0],
  });

  return { transform: [{ translateY: progress }] };
}
