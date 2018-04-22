import React from 'react';
import { Dimensions, StyleSheet } from 'react-native';

import TransitionItem from './../TransitionItem';
import { createAnimatedWrapper, createAnimated, mergeStyles } from './../Utils';
import {
  TransitionContext,
  NavigationDirection,
  InterpolatorSpecification,
  InterpolatorResult,
} from './../Types';

import { getInterpolatorTypes } from './InterpolatorTypes';

const getAnchoredElements = (sharedElements: Array<any>, getInterpolationFunction: Function) => {
  const retVal = [];
  sharedElements.forEach(p => {
    if(p.toItem.anchors && p.toItem.anchors.length > 0) {
      p.toItem.anchors.forEach(a => {        
        retVal.push(createAnchoredView(a, p.toItem, p.fromItem,
          getInterpolationFunction));
      });
    }
  });
  return retVal;
}

const createAnchoredView = (anchor: TransitionItem, to: TransitionItem,
  from: TransitionItem, getInterpolationFunction: Function) => {
    const interpolator = getInterpolationFunction(true);
    const scale = from.scaleRelativeTo(to);
    const scaleX = interpolator.interpolate({
      inputRange: [0, 1],
      outputRange: [scale.x, 1],
    });

  const scaleY = interpolator.interpolate({
    inputRange: [0, 1],
    outputRange: [scale.y, 1],
  });

  const diffaiX = (anchor.metrics.x - to.metrics.x);
  const diffaiY = (anchor.metrics.y - to.metrics.y); 
  const diffItemsX = (from.metrics.x - to.metrics.x);
  const diffItemsY = (from.metrics.y - to.metrics.y);
  const anchorStartX = diffItemsX - diffaiX - ((anchor.metrics.width) * scale.x) + (anchor.metrics.x * scale.x);
  const anchorStartY = diffItemsY - diffaiY - ((anchor.metrics.height) * scale.y) + (anchor.metrics.y * scale.y);
  
  const translateX = interpolator.interpolate({
    inputRange: [0, 1],
    outputRange: [anchorStartX, 0],
  });

  const translateY = interpolator.interpolate({
    inputRange: [0, 1],
    outputRange: [anchorStartY, 0],
  });

  const transformStyle =  { transform: 
    [{ translateX }, { translateY }, { scaleX }, { scaleY }]
    //[{ translateX }, { translateY }]
  };  

  const fadeStyle = { opacity: interpolator.interpolate({
    inputRange: [0, 0.22, 1],
    outputRange: [0, 1, 1],
  }) };  

  const positionStyle = {
    position: 'absolute',
    left: anchor.metrics.x,
    top: anchor.metrics.y,
    width: anchor.metrics.width,
    height: anchor.metrics.height,
  };

  const nativeStyles = [transformStyle, positionStyle, fadeStyle];

  const element = React.Children.only(anchor.reactElement.props.children);
  const key = "an-" + anchor.name + anchor.route;
  const props = { ...element.props, __index: to.index };
  const component = React.createElement(element.type, { ...props, key });
  const retVal = createAnimatedWrapper({component, nativeStyles});
  return retVal;
}

const styles = StyleSheet.create({
  anchorElement: {
    // borderColor: '#00F',
    // borderWidth: 1,
    position: 'absolute',
    margin: 0,
    marginVertical: 0,
    marginHorizontal: 0,
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0,
    marginStart: 0,
    marginEnd: 0,
  },
});

export { getAnchoredElements };
