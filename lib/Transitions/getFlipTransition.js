import { RouteDirection, TransitionSpecification } from '../Types';

export const getFlipTransition = (transitionInfo: TransitionSpecification) => {
  const { progress, start, end, direction } = transitionInfo;
  const flipTo = '90deg';
  const flipToSwap = `-${flipTo}`;
  const flipStart = '0deg';

  const flipInterpolation = progress.interpolate({
    inputRange: [0, start, end, 1],
    outputRange: direction === RouteDirection.from
      ? [flipStart, flipStart, flipTo, flipTo]
      : [flipToSwap, flipToSwap, flipStart, flipStart],
  });

  return {
    transform: [{ rotateX: flipInterpolation }],
  };
};
