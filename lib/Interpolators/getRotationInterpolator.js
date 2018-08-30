import { StyleSheet } from 'react-native';
import { InterpolatorSpecification } from '../Types/InterpolatorSpecification';
import { getRotationFromStyle } from '../Utils';

export const getRotationInterpolator = (spec: InterpolatorSpecification): StyleSheet.Styles => {
  const fromStyle = spec.from.style;
  const toStyle = spec.to.style;

  if ((!fromStyle || !fromStyle.transform)
    && (!toStyle || !toStyle.transform)) return {};

  const rotateFrom = getRotationFromStyle(fromStyle);
  const rotateTo = getRotationFromStyle(toStyle);

  if (rotateFrom === {} && rotateTo === {}) return {};

  const retVal = [];
  const interpolator = spec.getInterpolation(true);

  if (rotateFrom.rotate || rotateTo.rotate) {
    retVal.push({ rotate: interpolator.interpolate({
      inputRange: [0, 1],
      outputRange: [
        (rotateFrom.rotate ? rotateFrom.rotate.rotate : '0deg'),
        (rotateTo.rotate ? rotateTo.rotate.rotate : '0deg')],
    }) });
  }

  if (rotateFrom.rotateX || rotateTo.rotateX) {
    retVal.push({ rotateX: interpolator.interpolate({
      inputRange: [0, 1],
      outputRange: [rotateFrom.rotateX ? rotateFrom.rotateX.rotateX : '0deg',
        rotateTo.rotateX ? rotateTo.rotateX.rotateX : '0deg'],
    }) });
  }

  if (rotateFrom.rotateY || rotateTo.rotateY) {
    retVal.push({ rotateY: interpolator.interpolate({
      inputRange: [0, 1],
      outputRange: [rotateFrom.rotateY ? rotateFrom.rotateY.rotateY : '0deg',
        rotateTo.rotateY ? rotateTo.rotateY.rotateY : '0deg'],
    }) });
  }

  if (retVal.length === 0) return {};
  const transform = [];
  retVal.forEach(r => transform.push(r));
  return { nativeAnimationStyles: { transform } };
};
