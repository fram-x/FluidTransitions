import React from 'react';
import { View, Animated, StyleSheet } from 'react-native';

const createAnimated = () => {
  // Create wrapped view
  const wrapper = (<View />);
  return Animated.createAnimatedComponent(wrapper.type);
};

const createAnimatedWrapper = (element, key, styles, setViewRefCallback, wrapper) => {
  // Create wrapped view
  const animatedComponent = wrapper || createAnimated();

  // Get style for outer view
  const wrapperElementStyle = getWrapperStyle(element.props.style, styles);

  // Get style for inner view
  const elementStyle = getElementStyle(element.props.style);

  // create inner element with element styles
  const child = React.createElement(element.type, { ...element.props,
    style: {
      ...elementStyle,
    } });

  const props = {
    key,
    collapsable: false,
    style: [wrapperElementStyle, ...styles, { overflow: 'hidden' }],
    ref: setViewRefCallback,
  };

  return React.createElement(animatedComponent, props, child);
};

const getWrapperStyle = (style) => {
  const flattenedStyle = getStyle(style);
  if (!flattenedStyle) return style;

  const retVal = {};
  const keys = Object.keys(flattenedStyle);
  keys.forEach(key => {
    if (!isNumber(key) && includePropsForWrapper.indexOf(key) > -1) {
      retVal[key] = flattenedStyle[key];
    }
  });
  return retVal;
};

const getElementStyle = (style) => {
  const flattenedStyle = getStyle(style);
  if (!flattenedStyle) return style;

  const retVal = {};
  const keys = Object.keys(flattenedStyle);
  keys.forEach(key => {
    if (!isNumber(key) && excludePropsForElement.indexOf(key) === -1) {
      retVal[key] = flattenedStyle[key];
    }
  });

  return retVal;
};

const getStyle = (style) => {
  if (!style) return style;
  let flattenedStyle = style;
  if (!(style instanceof Object)) {
    flattenedStyle = StyleSheet.flatten(style);
  }
  return flattenedStyle;
};

function isNumber(n) { return !isNaN(parseFloat(n)) && !isNaN(n - 0); }

const includePropsForWrapper = [
  'display',
  'width',
  'height',
  'start',
  'end',
  'top',
  'left',
  'right',
  'bottom',
  'minWidth',
  'maxWidth',
  'minHeight',
  'maxHeight',
  'margin',
  'marginVertical',
  'marginHorizontal',
  'marginTop',
  'marginBottom',
  'marginLeft',
  'marginRight',
  'marginStart',
  'marginEnd',
  // "padding",
  // "paddingVertical",
  // "paddingHorizontal",
  // "paddingTop",
  // "paddingBottom",
  // "paddingLeft",
  // "paddingRight",
  // "paddingStart",
  // "paddingEnd",
  'position',
  'flexDirection',
  'flexWrap',
  'flex',
  'flexGrow',
  'flexShrink',
  'flexBasis',
  'alignSelf',
  'aspectRatio',
  'zIndex',
  'direction',
  // "transform", // AVOID adding transform - it fails on Android!
  // "transformMatrix",
  // "decomposedMatrix",
  // "scaleX",
  // "scaleY",
  // "rotation",
  // "translateX",
  // "translateY",
  'backfaceVisibility',
  'backgroundColor',
  'borderColor',
  'borderTopColor',
  'borderRightColor',
  'borderBottomColor',
  'borderLeftColor',
  'borderStartColor',
  'borderEndColor',
  'borderRadius',
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'borderTopStartRadius',
  'borderTopEndRadius',
  'borderBottomLeftRadius',
  'borderBottomRightRadius',
  'borderBottomStartRadius',
  'borderBottomEndRadius',
  'borderStyle',
];

const excludePropsForElement = [
  'display',
  // "width",
  // "height",
  'start',
  'end',
  'top',
  'left',
  'right',
  'bottom',
  'minWidth',
  'maxWidth',
  'minHeight',
  'maxHeight',
  'margin',
  'marginVertical',
  'marginHorizontal',
  'marginTop',
  'marginBottom',
  'marginLeft',
  'marginRight',
  'marginStart',
  'marginEnd',
  // "padding",
  // "paddingVertical",
  // "paddingHorizontal",
  // "paddingTop",
  // "paddingBottom",
  // "paddingLeft",
  // "paddingRight",
  // "paddingStart",
  // "paddingEnd",
  // "borderWidth",
  // "borderTopWidth",
  // "borderStartWidth",
  // "borderEndWidth",
  // "borderRightWidth",
  // "borderBottomWidth",
  // "borderLeftWidth",
  'position',
  // "flexDirection",
  // "flexWrap",
  // "justifyContent",
  // "alignItems",
  'alignSelf',
  'alignContent',
  'overflow',
  // "flex",
  'flexGrow',
  'flexShrink',
  'flexBasis',
  'aspectRatio',
  'zIndex',
  'direction',
  'shadowColor',
  'shadowOffset',
  'shadowOpacity',
  'shadowRadius',
  'transform',
  // "transformMatrix",
  // "decomposedMatrix",
  // "scaleX",
  // "scaleY",
  // "rotation",
  // "translateX",
  // "translateY",
  'backfaceVisibility',
  'backgroundColor',
  'borderColor',
  'borderTopColor',
  'borderRightColor',
  'borderBottomColor',
  'borderLeftColor',
  'borderStartColor',
  'borderEndColor',
  'borderRadius',
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'borderTopStartRadius',
  'borderTopEndRadius',
  'borderBottomLeftRadius',
  'borderBottomRightRadius',
  'borderBottomStartRadius',
  'borderBottomEndRadius',
  'borderStyle',
  'opacity',
  'elevation',
];

export { createAnimatedWrapper, createAnimated };
