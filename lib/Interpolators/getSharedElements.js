import React from 'react';
import { Dimensions } from 'react-native';

import TransitionItem from '../TransitionItem';
import { createAnimatedWrapper, getResolvedMetrics, mergeStyles } from '../Utils';

import { getInterpolatorTypes } from './InterpolatorTypes';
import { InterpolatorSpecification } from '../Types/InterpolatorSpecification';

const getSharedElements = (sharedElements: Array<any>,
  getInterpolationFunction: Function) => sharedElements.map((pair, idx) => {
  const { fromItem, toItem } = pair;
  const element = React.Children.only(fromItem.reactElement.props.children);

  const equalAspectRatio = getIsEqualAspectRatio(fromItem, toItem);

  const transitionStyles = getTransitionStyle(fromItem, toItem, getInterpolationFunction,
    equalAspectRatio);

  const key = `so-${idx.toString()}`;
  const animationStyle = transitionStyles.styles;
  const nativeAnimationStyle = [transitionStyles.nativeStyles];
  const resolvedMetrics = getResolvedMetrics(fromItem, fromItem.metrics);

  const overrideStyles = {
    position: 'absolute',
    left: resolvedMetrics.x,
    top: resolvedMetrics.y,
    width: resolvedMetrics.width,
    height: resolvedMetrics.height,
  };

  const props = { ...element.props, __index: fromItem.index };
  if (fromItem.animated) {
    props[fromItem.animated] = getInterpolationFunction(false);
  } else if (toItem.animated) {
    props[toItem.animated] = getInterpolationFunction(false);
  }

  const component = React.createElement(element.type, { ...props, key });

  return createAnimatedWrapper({
    component,
    nativeStyles: nativeAnimationStyle,
    styles: animationStyle,
    overrideStyles,
    equalAspectRatio,
    log: true,
    logPrefix: `SE: ${fromItem.name}/${fromItem.route}`,
  });
});

const getIsEqualAspectRatio = (fromItem, toItem) => {
  const fromAspect = Math.round((fromItem.metrics.width / fromItem.metrics.height) * 100) / 100;
  const toAspect = Math.round((toItem.metrics.width / toItem.metrics.height) * 100) / 100;
  return fromAspect === toAspect;
};

const getTransitionStyle = (
  fromItem: TransitionItem, toItem: TransitionItem, getInterpolationFunction: Function,
  equalAspectRatio: boolean,
) => {
  const interpolatorInfo: InterpolatorSpecification = {
    from: {
      metrics: fromItem.metrics,
      boundingbox: fromItem.boundingBoxMetrics,
      style: fromItem.getFlattenedStyle(),
    },
    to: {
      metrics: toItem.metrics,
      style: toItem.getFlattenedStyle(),
      boundingbox: toItem.boundingBoxMetrics,
    },
    scaleX: toItem.scaleRelativeTo(fromItem).x,
    scaleY: toItem.scaleRelativeTo(fromItem).y,
    equalAspectRatio,
    getInterpolation: getInterpolationFunction,
    dimensions: Dimensions.get('window'),
  };

  const nativeStyles = [];
  const styles = [];

  getInterpolatorTypes().forEach(interpolator => {
    const interpolatorResult = interpolator.interpolatorFunction(interpolatorInfo);
    if (interpolatorResult) {
      if (interpolatorResult.nativeAnimationStyles) {
        nativeStyles.push(interpolatorResult.nativeAnimationStyles);
      }
      if (interpolatorResult.animationStyles) {
        styles.push(interpolatorResult.animationStyles);
      }
    }
  });

  return {
    nativeStyles: {
      ...mergeStyles(nativeStyles),
    },
    styles: {
      width: fromItem.metrics.width,
      height: fromItem.metrics.height,
      ...mergeStyles(styles),
    },
  };
};

export { getSharedElements };
