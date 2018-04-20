import React from 'react';
import { Dimensions } from 'react-native';

import TransitionItem from './../TransitionItem';
import { createAnimatedWrapper, createAnimated, mergeStyles } from './../Utils';
import {
  TransitionContext,
  NavigationDirection,
  InterpolatorSpecification,
  InterpolatorResult,
} from './../Types';

import { getInterpolatorTypes } from './InterpolatorTypes';

const getSharedElements = (sharedElements: Array<any>, getInterpolationFunction: Function) => {
  
  return sharedElements.map((pair, idx) => {
    const { fromItem, toItem } = pair;
    const element = React.Children.only(fromItem.reactElement.props.children);
    const transitionStyles = getTransitionStyle(fromItem, toItem, getInterpolationFunction);

    const key = `so-${idx.toString()}`;
    const animationStyle = transitionStyles.styles;
    const nativeAnimationStyle = [transitionStyles.nativeStyles];
    const overrideStyles = {
      position: 'absolute',
      left: fromItem.metrics.x,
      top: fromItem.metrics.y,
      width: fromItem.metrics.width,
      height: fromItem.metrics.height,
    };

    const props = { ...element.props, __index: fromItem.index };
    const component = React.createElement(element.type, { ...props, key });
    return createAnimatedWrapper({
      component,
      nativeStyles: nativeAnimationStyle,
      styles: animationStyle,
      overrideStyles,
      log: true,
      logPrefix: 'SE: ' + fromItem.name + '/' + fromItem.route,
    });
  });
}

const getTransitionStyle = (
  fromItem: TransitionItem, toItem: TransitionItem, getInterpolationFunction: Function) => {
  const interpolatorInfo: InterpolatorSpecification = {
    from: {
      metrics: fromItem.metrics,
      boundingbox: fromItem.boundingBoxMetrics,
      style: fromItem.getFlattenedStyle(),
      rotation: fromItem.rotation,
    },
    to: {
      metrics: toItem.metrics,
      style: toItem.getFlattenedStyle(),
      boundingbox: toItem.boundingBoxMetrics,
      rotation: toItem.rotation,
    },
    scaleX: toItem.scaleRelativeTo(fromItem).x,
    scaleY: toItem.scaleRelativeTo(fromItem).y,
    getInterpolation: getInterpolationFunction,
    dimensions: Dimensions.get('window'),
  };

  const nativeStyles = [];
  const styles = [];

  const self = this;
  getInterpolatorTypes().forEach(interpolator => {
    const interpolatorResult = interpolator.interpolatorFunction(interpolatorInfo);
    if (interpolatorResult) {
      if (interpolatorResult.nativeAnimationStyles)
        {nativeStyles.push(interpolatorResult.nativeAnimationStyles);}
      if (interpolatorResult.animationStyles)
        {styles.push(interpolatorResult.animationStyles);}
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
}

export { getSharedElements }