import { RouteDirection, TransitionSpecification } from '../Types';

export const getVerticalTransition = (transitionInfo: TransitionSpecification) => {
  if (!transitionInfo || transitionInfo.metrics === undefined) { return {}; }

  const { start, end, dimensions } = transitionInfo;

  let startPosition = 0;
  let endPosition = 0;

  if (transitionInfo.direction === RouteDirection.from) {
    startPosition = 0;
    endPosition = -(dimensions.height + 25);
  } else if (transitionInfo.direction === RouteDirection.to) {
    startPosition = dimensions.height + 25;
    endPosition = 0;
  }

  const transitionProgress = transitionInfo.progress.interpolate({
    inputRange: [0, start, end, 1],
    outputRange: [startPosition, startPosition, endPosition, endPosition],
  });

  return { transform: [{ translateY: transitionProgress }] };
};
