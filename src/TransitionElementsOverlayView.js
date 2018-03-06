import React from 'react';
import { View, StyleSheet, Animated, Platform } from 'react-native';
import PropTypes from 'prop-types';

import TransitionItem from './TransitionItem';
import { TransitionConfiguration, TransitionContext } from './Types';
import {
  ScaleTransition,
  TopTransition,
  BottomTransition,
  LeftTransition,
  RightTransition,
  HorizontalTransition,
  VerticalTransition,
  BaseTransition }
  from './Transitions';

const styles: StyleSheet.NamedStyles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  transitionElement: {
    position: 'absolute',
    // backgroundColor: '#E5D',
    margin: 0,
    left: 0,
    top: 0,
  },
});

const transitionTypes: Array<TransitionEntry> = [];

export function registerTransitionType(
  name: string,
  transitionClass: BaseTransition,
): TransitionEntry {
  transitionTypes.push({ name, transitionClass });
}

registerTransitionType('scale', ScaleTransition);
registerTransitionType('top', TopTransition);
registerTransitionType('bottom', BottomTransition);
registerTransitionType('left', LeftTransition);
registerTransitionType('right', RightTransition);
registerTransitionType('horizontal', HorizontalTransition);
registerTransitionType('vertical', VerticalTransition);

type TransitionElementsOverlayViewProps = {
  fromRoute: string,
  toRoute: string,
  transitionElements: Array<any>
}

class TransitionElementsOverlayView extends React.Component<TransitionElementsOverlayViewProps> {
  context: TransitionContext
  constructor(props: TransitionElementsOverlayViewProps, context: TransitionContext) {
    super(props, context);
    this._isMounted = false;
    this._transitionElements = [];
    this._transitionHelper = null;
    this._startOpacity = props.appear ? 0 : 1;
  }

  _isMounted: boolean;
  _transitionElements: Array<TransitionItem>
  _transitionHelper: any
  _startOpacity: number

  render() {
    if(!this.props.transitionElements || !this.getMetricsReady()) {
      this._transitionElements = [];
      this._transitionHelper = null;
      return <View style={styles.overlay} pointerEvents='none'/>;
    }

    if(this._transitionElements.length === 0) {
      this._transitionElements = this.props.transitionElements.map((item, idx) => {
        // Get correct style
        const transitionStyle = this.getTransitionStyle(item);
        let element = React.Children.only(item.reactElement.props.children);
        return this.getAnimatedComponent(element, idx, transitionStyle);
      });
    }

    return (
      <View style={styles.emptyOverlay} pointerEvents='none'>
        {this._transitionElements}
      </View>
    );
  }

  getTransitionStyle(item: TransitionItem) {
    const { getTransitionProgress, getMetrics, getDirection, getReverse, } = this.context;
    if (!getTransitionProgress || !getMetrics || !getDirection || !getReverse ) return {
      width: item.metrics.width, height: item.metrics.height,
      transform: [{ translateX: item.metrics.x }, { translateY: item.metrics.y }]
    };

    const progress = getTransitionProgress(item.name, item.route);

    if(progress) {
      const hadZeroOpacity = this._startOpacity === 0;
      this._startOpacity = 1;
      const metrics = getMetrics(item.name, item.route);
      const transitionHelper = this.getTransitionHelper(item.appear);
      if (transitionHelper) {
        const transitionConfig = {
          name: item.name,
          route: item.route,
          progress,
          metrics,
          direction: getDirection(item.name, item.route),
          reverse: getReverse(item.name, item.route),
        };

        if(hadZeroOpacity && Platform.OS === 'android'){
          const opacity = progress.interpolate({
            inputRange: [0, 0.1, 1],
            outputRange: [0, 1, 1]
          });
          return {transform: [{ translateX: item.metrics.x }, { translateY: item.metrics.y }],
            ...transitionHelper.getTransitionStyle(transitionConfig), opacity, 
            width: item.metrics.width, height: item.metrics.height};
        }

        return {transform: [{ translateX: item.metrics.x }, { translateY: item.metrics.y }],
          ...transitionHelper.getTransitionStyle(transitionConfig), 
          width: item.metrics.width, height: item.metrics.height};
      }
    }
    return { 
      width: item.metrics.width, height: item.metrics.height, 
      transform: [{ translateX: item.metrics.x }, { translateY: item.metrics.y }]};
  }

  getTransitionHelper(appear) {
    if (this._transitionHelper === null) {
      if (appear) {
        const transitionType = transitionTypes.find(e => e.name === appear);
        if (transitionType) { this._transitionHelper = new transitionType.transitionClass(); }
      }
    }
    return this._transitionHelper;
  }

  getAnimatedComponent(renderElement, idx, transitionStyle) {

    let element = renderElement;
    let animatedComponent = null;
    let elementProps = element.props;
    let child = null;

    // Functional components should be wrapped in a view to be usable with
    // Animated.createAnimatedComponent. We also need to wrap buttons in
    // separate containers. Don't know why!
    const isFunctionalComponent = !element.type.displayName;
    if(isFunctionalComponent || element.type.displayName === 'Button') {
      // Wrap in sourrounding view
      element = React.createElement(element.type, element.props);
      const wrapper = (<View/>);
      animatedComponent = Animated.createAnimatedComponent(wrapper.type);
      elementProps = {};
      child = element;
    }
    else {
      animatedComponent = Animated.createAnimatedComponent(element.type);
    }

    const props = {
      ...element.props,
      style: [element.props.style, styles.transitionElement, transitionStyle],
      key: idx,
    };

    if(child)
      return React.createElement(animatedComponent, props, child);

    return React.createElement(animatedComponent, props);
  }

  getMetricsReady(): boolean {
    if(this.props.transitionElements) {
      let metricsReady = true;
      this.props.transitionElements.forEach(item => {
        if(!item.metrics)
          metricsReady = false;
      });
      return metricsReady;
    }
    return false;
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  static contextTypes = {
    getTransitionProgress: PropTypes.func,
    getDirection: PropTypes.func,
    getReverse: PropTypes.func,
    getMetrics: PropTypes.func
  }
}

export default TransitionElementsOverlayView;
