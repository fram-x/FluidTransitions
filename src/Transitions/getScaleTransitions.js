import { TransitionSpecification } from './../Types/TransitionSpecification';

export const getScaleTransition = (transitionSpecification: TransitionSpecification) => {
  if (!transitionSpecification) {
    return { opacity: 0 };
  }
  const start = transitionSpecification.reverse ? 1 : 0;
  const end = transitionSpecification.reverse ? 0 : 1;

  const scaleInterpolation = transitionSpecification.progress.interpolate({
    inputRange: [0, 1],
    outputRange: [start, end],
  });
  return {
    transform: [{ scale: scaleInterpolation }],
  };
}