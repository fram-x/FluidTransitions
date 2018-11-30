import React from 'react';
import { View, Animated, StyleSheet } from 'react-native';

import { getRotationFromStyle } from './getRotationFromStyle';
import { mergeStyles } from './mergeStyles';
/*
  This HOC wrapper creates animatable wrappers around the provided component
  to make it animatable - independent of wether it is a stateless or class
  component.

  In addition it wraps the element in two outer animatable components - one
  for transform animations that can be used with the native driver, and one
  for other properties that can be animated using a non-native animation driver.

  Example component:

  <View style={{ backgroundColor: #F00, transform: [{ rotate: '90deg' }] }}>
    <Text>Hello World</Text>
  </View>

  Results in the following component hierarchy where
  the outer views are animatable views:

  <View style={{ transform: [{ rotate: '90deg' }] }}>  <-- Native Animated Component
    <View style={{ backgroundColor: #F00, flex: 1 }} > <-- Animated Component
      <View style={flex: 1}>                           <-- Org. component
        <Text>Hello World</Text>
      </View>
    </View>
  </View>

  Parameters:
  component:      The component to create wrapper for. Can be a regular class based or
                  stateless component.
  nativeStyles:   Styles for the native part of the wrapper. Put any native animations
                  (transforms & opacity) here. (optional)
  overrideStyles: Last styles to put on the outer wrapper
  styles:         Styles for the non-native animations (optional)
  nativeCached:   Provide a cached AnimatedComponent wrapper for the native part (optional)
  cached:         Provide a cached AnimatedComponent wrapper for the non-native part (optional)
  log:            Writes to debug output if true.
  logPrefix:      Prefix for the log output
*/
type Parameters = {
  component: any,
  nativeStyles: ?StyleSheet.NamedStyles,
  styles: ?StyleSheet.NamedStyles,
  overrideStyles: ?StyleSheet.NamedStyles,
  nativeCached: ?any,
  cached: ?any,
  equalAspectRatio: ?boolean,
  innerRef: ?any,
  log: ?Boolean,
  logPrefix: ?string
}
const createAnimatedWrapper = (params: Parameters) => {
  const equalAspectRatio = params.equalAspectRatio === undefined ? true : params.equalAspectRatio;

  // Create wrapped views
  const nativeAnimatedComponent = params.nativeCached || createAnimated();
  const animatedComponent = params.cached || createAnimated();

  // Flatten style
  const flattenedStyle = StyleSheet.flatten(params.component.props.style);

  // Get styles
  const nativeAnimatedStyles = getNativeAnimatableStyles(flattenedStyle);
  const animatedStyles = getAnimatableStyles(flattenedStyle);
  const componentStyles = getResolvedAspectRatio(equalAspectRatio, true,
    getComponentStyles(flattenedStyle));

  // create inner element
  const innerElement = React.createElement(params.component.type, {
    ...params.component.props,
    ref: params.innerRef,
    style: [componentStyles, getDebugBorder('#F00')],
  });

  // Check if we have an absolute positioned element
  const additionalAnimatedStyles = { overflow: 'hidden' };

  // For absolute positioned elements we need to set the flex property
  // to enable full fill of the inner element.
  if (nativeAnimatedStyles
    && nativeAnimatedStyles.position === 'absolute') {
    additionalAnimatedStyles.flex = 1;
  }

  // Create Animated element
  const finalAnimatedStyles = [
    animatedStyles,
    params.styles,
    additionalAnimatedStyles,
    getDebugBorder('#0F0'),
  ];

  const animatedElement = React.createElement(
    animatedComponent, { style: finalAnimatedStyles },
    innerElement,
  );

  // Setup props for the outer wrapper (and native animated component)
  const finalNativeAnimatedStyles = getResolvedRotation(
    [...getStylesWithMergedTransforms([
      ...(params.nativeStyles ? params.nativeStyles : []),
      nativeAnimatedStyles,
    ]),
    getDebugBorder('#00F'),
    params.overrideStyles,
    ],
  );

  let props = {
    collapsable: false, // Used to fix measure on Android
    style: getResolvedAspectRatio(equalAspectRatio, false, finalNativeAnimatedStyles),
  };

  // Copy some key properties
  if (params.component.props.__index) {
    props = { ...props, index: parseInt(params.component.props.__index, 10) };
  }
  if (params.component.key) { props = { ...props, key: params.component.key }; }
  if (params.component.ref) { props = { ...props, ref: params.component.ref }; }
  if (params.component.onLayout) { props = { ...props, onLayout: params.component.onLayout }; }

  // Create native animated component
  const nativeAnimatedElement = React.createElement(
    nativeAnimatedComponent,
    props,
    animatedElement,
  );

  // if (__DEV__) {
  //   if(params.log) {
  //     const log = (params.logPrefix ? params.logPrefix + "\n" : "") +
  //       "  innerElement:          " + JSON.stringify(StyleSheet.flatten(innerElement.props.style)) + "\n" +
  //       "  animatedElement:       " + JSON.stringify(StyleSheet.flatten(animatedElement.props.style)) + "\n" +
  //       "  nativeAnimatedElement: " + JSON.stringify(StyleSheet.flatten(nativeAnimatedElement.props.style));
  //     if(lastLog !== log){
  //       lastLog = log;
  //       console.log("\n" + log + "\n");
  //     }
  //   }
  // }

  return nativeAnimatedElement;
};
// const lastLog = '';

const createAnimated = () => {
  // Create wrapped view
  const wrapper = (<View />);
  return Animated.createAnimatedComponent(wrapper.type);
};

const getDebugBorder = () => ({}); // (color: string) => ({ borderWidth: 1, borderColor: color });

const getResolvedAspectRatio = (equalAspectRatio: boolean,
  addFlex: boolean, style: StyleSheet.Style | Array<StyleSheet.Style>) => {
  if (!style || equalAspectRatio) return style;
  const retVal = !(style instanceof Array) ? [{ ...style }] : style.map(s => ({ ...s }));
  retVal.forEach(r => {
    // remove height/width and replace with flex: 1
    delete r.width;
    delete r.height;
  });
  if (!addFlex) return retVal;
  return [...retVal, { flex: 1 }];
};

const getResolvedRotation = (styles: Array<StyleSheet.Styles>) => {
  // if(Platform.OS === 'ios') return styles;
  const stylesCopy = styles.filter(i => i).map(s => {
    if (!s) return null;
    if (isNumber(s)) return s;
    const sc = { ...s };
    if (sc.transform) {
      sc.transform = [...s.transform];
      sc.transform = sc.transform.map(t => ({ ...t }));
    }
    return sc;
  });
  const a = new Animated.Value(0);
  stylesCopy.forEach(style => {
    if (style && style.transform) {
      const ri = getRotationFromStyle(style);
      if (ri.rotate) {
        if (ri.rotate.rotate && (typeof ri.rotate.rotate) === 'string') {
          style.transform.find(t => Object.keys(t)[0] === 'rotate').rotate = a.interpolate({ inputRange: [0, 1],
            outputRange: [ri.rotate.rotate, '0deg'] });
        }

        if (ri.rotate.rotateX && (typeof ri.rotate.rotateX) === 'string') {
          style.transform.find(t => Object.keys(t)[0] === 'rotateX').rotateX = a.interpolate({ inputRange: [0, 1],
            outputRange: [ri.rotateX.rotateX, '0deg'] });
        }

        if (ri.rotate.rotateY && (typeof ri.rotate.rotateY) === 'string') {
          style.transform.find(t => Object.keys(t)[0] === 'rotateY').rotateY = a.interpolate({ inputRange: [0, 1],
            outputRange: [ri.rotateY.rotateY, '0deg'] });
        }
      }
    }
  });

  return stylesCopy;
};

const getStylesWithMergedTransforms = (
  styles: Array<StyleSheet.NamedStyles>,
): Array<StyleSheet.NamedStyles> => {
  const retVal = [];
  const transforms = [];
  if (styles) {
    styles.forEach(s => {
      if (s) {
        if (s.transform) {
          const t = s.transform;
          delete s.transform;
          t.forEach(ti => {
            if (!transforms.find(el => Object.keys(el)[0] === Object.keys(ti)[0])) { transforms.push(ti); }
          });
        }
        retVal.push(s);
      }
    });
    retVal.push({ transform: transforms });
    return retVal;
  }

  return styles;
};

const getNativeAnimatableStyles = (
  styles: Array<StyleSheet.NamedStyles>|StyleSheet.NamedStyles,
) => getFilteredStyle(styles, (key) => includePropsForNativeStyles.indexOf(key) > -1);

const getAnimatableStyles = (
  styles: Array<StyleSheet.NamedStyles>|StyleSheet.NamedStyles,
) => getFilteredStyle(styles, (key) => validStyles.indexOf(key) > -1
&& excludePropsForStyles.indexOf(key) === -1);

const getComponentStyles = (
  styles: Array<StyleSheet.NamedStyles>|StyleSheet.NamedStyles,
) => getFilteredStyle(styles, (key) => excludePropsForComponent.indexOf(key) === -1);

const getFilteredStyle = (
  styles: Array<StyleSheet.NamedStyles>|StyleSheet.NamedStyles,
  shouldIncludeKey: (key: String) => void,
) => {
  if (!styles) return styles;
  let flattenedStyle = styles;
  if (!(styles instanceof Object)) {
    flattenedStyle = StyleSheet.flatten(styles);
  }

  if (!flattenedStyle) return styles;
  if (!(flattenedStyle instanceof Array)) {
    flattenedStyle = [flattenedStyle];
  }

  const retVal = {};
  flattenedStyle.forEach(s => {
    if (s) {
      const keys = Object.keys(s);
      keys.forEach(key => {
        if (!isNumber(key) && shouldIncludeKey(key)) {
          retVal[key] = s[key];
        }
      });
    }
  });

  return retVal;
};

function isNumber(n) { return !Number.isNaN(parseFloat(n)) && !Number.isNaN(n - 0); }

const paddingStyles = [
  'padding',
  'paddingVertical',
  'paddingHorizontal',
  'paddingTop',
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
  'paddingStart',
  'paddingEnd',
];

const marginStyles = [
  'margin',
  'marginVertical',
  'marginHorizontal',
  'marginTop',
  'marginBottom',
  'marginLeft',
  'marginRight',
  'marginStart',
  'marginEnd',
];

const borderStyles = [
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
  'borderWidth',
  'borderLeftWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderTopWidth',
];

const positionStyles = [
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
];

const shadowStyles = [
  'shadowColor',
  'shadowOffset',
  'shadowOpacity',
  'shadowRadius',
  'elevation',
];

const excludePropsForComponent = [
  ...paddingStyles,
  ...marginStyles,
  ...borderStyles,
  ...positionStyles,
  ...shadowStyles,
  'display',
  // 'width',
  // 'height',
  'position',
  'flexWrap',
  // 'flex',
  'flexGrow',
  'flexShrink',
  'flexBasis',
  'alignSelf',
  'aspectRatio',
  'zIndex',
  'direction',
  'transform',
  'transformMatrix',
  'decomposedMatrix',
  'scaleX',
  'scaleY',
  'rotation',
  'translateX',
  'translateY',
  'backfaceVisibility',
  'backgroundColor',
];

const includePropsForNativeStyles = [
  ...marginStyles,
  ...positionStyles,
  ...shadowStyles,
  'display',
  'width',
  'height',
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
  'transform',
];

const excludePropsForStyles = [
  ...marginStyles,
  ...positionStyles,
  'display',
  // "width",
  // "height",
  'position',
  'alignSelf',
  'alignContent',
  'overflow',
  'flexGrow',
  'flexShrink',
  'flexBasis',
  'aspectRatio',
  'zIndex',
  'direction',
  'transform',
  'transformMatrix',
  'decomposedMatrix',
  'scaleX',
  'scaleY',
  'rotation',
  'translateX',
  'translateY',
];

const validStyles = [
  'display',
  'width',
  'height',
  ...positionStyles,
  ...marginStyles,
  ...paddingStyles,
  ...borderStyles,
  'position',
  'flexDirection',
  'flexWrap',
  'justifyContent',
  'alignItems',
  'alignSelf',
  'alignContent',
  'overflow',
  'flex',
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
  'transformMatrix',
  'decomposedMatrix',
  'scaleX',
  'scaleY',
  'rotation',
  'translateX',
  'translateY',
  'backfaceVisibility',
  'backgroundColor',
  'opacity',
  'elevation',
];

export { createAnimatedWrapper, createAnimated };
