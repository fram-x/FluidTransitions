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

  const offsetx = (am.x - tm.x) * scale.x;
  const offsety = (am.y - tm.y) * scale.y;

  const targetx = fm.x + offsetx;
  const targety = fm.y + offsety;

  const movex = targetx - am.x;
  const movey = targety - am.y;

  const scaledmx = movex;
  const scaledmy = movey;

  console.log("am", am);
  console.log("fm", fm);
  console.log("tm", tm);
  console.log("offsetx", offsetx);
  console.log("offsety", offsety);
  console.log("targetx", targetx);
  console.log("targety", targety);
  console.log("movex", movex);
  console.log("movey", movey);
  console.log("scale moved x", scaledmx);
  console.log("scale moved y", scaledmy);
  console.log("scalex", scale.x);
  console.log("scaley", scale.y);

  const translateX = interpolator.interpolate({
    inputRange: [0, 1],
    outputRange: [scaledmx, 0],
  });

  const translateY = interpolator.interpolate({
    inputRange: [0, 1],
    outputRange: [scaledmy, 0],
  });

  const transformStyle =  { transform:
    [{translateX}, {translateY}, {scaleX}, {scaleY}]
  };

  const fadeStyle = { opacity: interpolator.interpolate({
    inputRange: [0, 0.15, 1],
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
