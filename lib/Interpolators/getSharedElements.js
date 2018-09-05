import React from 'react';
import { Dimensions } from 'react-native';

import TransitionItem from '../TransitionItem';
import { createAnimatedWrapper, mergeStyles } from '../Utils';

import { getInterpolatorTypes } from './InterpolatorTypes';
import { InterpolatorSpecification } from '../Types/InterpolatorSpecification';

const getSharedElements = (sharedElements: Array<any>,
  getInterpolationFunction: Function) => sharedElements.map((pair, idx) => {
  const { fromItem, toItem } = pair;
  const element = React.Children.only(fromItem.reactElement.props.children);
  const transitionStyles = getTransitionStyle(fromItem, toItem, getInterpolationFunction);

  const key = `so-${idx.toString()}`;
  const animationStyle = transitionStyles.styles;
  const nativeAnimationStyle = [transitionStyles.nativeStyles];
  const overrideStyles = {
    position: 'absolute',
    // borderColor: '#0000FF',
    // borderWidth: 1,
    left: fromItem.metrics.x,
    top: fromItem.metrics.y,
    width: fromItem.metrics.width,
    height: fromItem.metrics.height,
  };

  const props = { ...element.props, __index: fromItem.index };
  if (fromItem.animated) {
    props[fromItem.animated] = getInterpolationFunction(false);
  }

  const component = React.createElement(element.type, { ...props, key });

  return createAnimatedWrapper({
    component,
    nativeStyles: nativeAnimationStyle,
    styles: animationStyle,
    overrideStyles,
    log: true,
    logPrefix: `SE: ${fromItem.name}/${fromItem.route}`,
  });
});

const getTransitionStyle = (
  fromItem: TransitionItem, toItem: TransitionItem, getInterpolationFunction: Function,
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
