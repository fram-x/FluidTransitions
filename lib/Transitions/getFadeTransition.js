import { RouteDirection, TransitionSpecification } from '../Types';

export const getFadeTransition = (transitionSpecification: TransitionSpecification) => {
  if (!transitionSpecification || transitionSpecification.metrics === undefined) {
    return {};
  }
  const { start, end } = transitionSpecification;
  let startValue = 1;
  let endValue = 0;
  let startIp = start;
  let endIp = 0.05;

  if (transitionSpecification.direction === RouteDirection.to) {
    startValue = 0;
    endValue = 1;
    endIp = end;
    startIp = 0.95;
  }

  const progress = transitionSpecification.progress.interpolate({
    inputRange: [0, startIp, endIp, 1],
    outputRange: [startValue, startValue, endValue, endValue],
  });

  return { opacity: progress };
};
