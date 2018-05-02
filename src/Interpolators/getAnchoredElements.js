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

        const scale = p.fromItem.scaleRelativeTo(p.toItem);
        const scaleOp = p.toItem.scaleRelativeTo(p.fromItem);

        retVal.push(createAnchoredView(a, p.toItem, p.fromItem,
          getInterpolationFunction, scale, scaleOp));
      });
    }
  });
  return retVal;
}

const createAnchoredView = (anchor: TransitionItem, to: TransitionItem,
  from: TransitionItem, getInterpolationFunction: Function, scale: any, scaleOp: any) => {
  const interpolator = getInterpolationFunction(true);
  
  const scaleX = interpolator.interpolate({
    inputRange: [0, 1],
    outputRange: [scale.x, 1],
  });

  const scaleY = interpolator.interpolate({
    inputRange: [0, 1],
    outputRange: [scale.y, 1],
  });  

  const am = anchor.metrics;
  const fm = from.metrics;
  const tm = to.metrics;

  const d = (fm.x - tm.x) * scaleOp.x;
  const a = (fm.y - tm.y) * scaleOp.y;
  const h = (fm.height - tm.height);
  const k = (fm.width - tm.width);
  
  let anchorStart = { x: d, y: a };
    
  const translateX = interpolator.interpolate({
    inputRange: [0, 1],
    outputRange: [(anchorStart.x)* scale.x, 0],
  });

  const translateY = interpolator.interpolate({
    inputRange: [0, 1],
    outputRange: [(anchorStart.y)* scale.y, 0],
  });

  const transformStyle =  { transform: 
    [{ translateX }, { translateY }, { scaleX }, { scaleY }]
    // [ { scaleX }, { scaleY }, { translateX }, { translateY }]
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
