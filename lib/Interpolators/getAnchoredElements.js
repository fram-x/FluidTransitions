import React from 'react';
import { StyleSheet } from 'react-native';

import TransitionItem from '../TransitionItem';
import { createAnimatedWrapper } from '../Utils';

const getAnchoredElements = (sharedElements: Array<any>, getInterpolationFunction: Function) => {
  const retVal = [];
  sharedElements.forEach(p => {
    if (p.toItem.anchors && p.toItem.anchors.length > 0) {
      p.toItem.anchors.forEach(a => {
        const scale = p.fromItem.scaleRelativeTo(p.toItem);
        const scaleOp = p.toItem.scaleRelativeTo(p.fromItem);

        retVal.push(createAnchoredView(a, p.toItem, p.fromItem,
          getInterpolationFunction, scale, scaleOp));
      });
    }
  });
  return retVal;
};

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

  const main0center = { x: from.metrics.x + from.metrics.width / 2,
    y: from.metrics.y + from.metrics.height / 2 };

  const main1center = { x: to.metrics.x + to.metrics.width / 2,
    y: to.metrics.y + to.metrics.height / 2 };

  const element1center = { x: anchor.metrics.x + anchor.metrics.width / 2,
    y: anchor.metrics.y + anchor.metrics.height / 2 };

  const element1offset = { x: element1center.x - main1center.x,
    y: element1center.y - main1center.y };

  const element0offset = { x: element1offset.x * scale.x,
    y: element1offset.y * scale.y };

  const element0center = { x: main0center.x + element0offset.x,
    y: main0center.y + element0offset.y };

  const elementmove = { x: element0center.x - element1center.x,
    y: element0center.y - element1center.y };

  const translateX = interpolator.interpolate({
    inputRange: [0, 1],
    outputRange: [elementmove.x, 0],
  });

  const translateY = interpolator.interpolate({
    inputRange: [0, 1],
    outputRange: [elementmove.y, 0],
  });

  const transformStyle = { transform:
    [{ translateX }, { translateY }, { scaleX }, { scaleY }],
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
  const key = `an-${anchor.name}${anchor.route}`;
  const props = { ...element.props, __index: to.index };
  const component = React.createElement(element.type, { ...props, key });
  const retVal = createAnimatedWrapper({ component, nativeStyles });
  return retVal;
};

const ptToString = (p) => `x: ${p.x} y: ${p.y}`;

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
