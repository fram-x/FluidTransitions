import React from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import PropTypes from 'prop-types';

import TransitionItem from './TransitionItem';
import { createAnimatedWrapper, createAnimated, mergeStyles, getRotationFromStyle } from './Utils';
import {
  TransitionContext,
  RouteDirection,
  NavigationDirection,
  TransitionSpecification,
} from './Types';

import { initTransitionTypes, getTransitionType, getTransitionElements } from './Transitions';
import * as Constants from './TransitionConstants';

initTransitionTypes();

type TransitionElementsOverlayViewProps = {
  fromRoute: string,
  toRoute: string,
  direction: number,
  transitionElements: Array<any>
}

class TransitionElementsOverlayView extends React.Component<TransitionElementsOverlayViewProps> {  
  constructor(props: TransitionElementsOverlayViewProps, context) {
    super(props, context);
    this._isMounted = false;
  }

  _isMounted: boolean;
  _transitionElements: Array<TransitionItem>

  shouldComponentUpdate(nextProps) {
    if (!nextProps.fromRoute && !nextProps.toRoute) { return false; }

    // Compare toRoute/fromRoute/direction
    if (this.props.toRoute !== nextProps.toRoute ||
      this.props.fromRoute !== nextProps.fromRoute ||
      this.props.direction !== nextProps.direction) { return true; }

    // Compare elements
    if (!this.compareArrays(this.props.transitionElements, nextProps.transitionElements)) { return true; }

    return false;
  }

  compareArrays(a, b) {
    if (!a && !b) return false;
    if (!a && b || !b && a) return false;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i].name !== b[i].name ||
        a[i].route !== b[i].route) { return false; }
    }
    return true;
  }

  getTransitionContext(transitionElements): TransitionContext {
    const { getDirectionForRoute, getIndex, getDirection, 
      getRoutes, getTransitionProgress } = this.context;

    if (!transitionElements || !getDirectionForRoute || !getDirection || 
      !getRoutes || !getIndex || !getTransitionProgress) {
      return null;
    }

    const delayCountFrom = transitionElements
      .filter(item => getDirectionForRoute(item.name, item.route) === RouteDirection.from)
      .reduce((prevValue, item) => (item.delay ? prevValue + 1 : prevValue), 0);

    const delayCountTo = transitionElements
      .filter(item => getDirectionForRoute(item.name, item.route) === RouteDirection.to)
      .reduce((prevValue, item) => (item.delay ? prevValue + 1 : prevValue), 0);

    const navDirection = getDirection();
    let delayIndexFrom = 0;
    let delayIndexTo = Math.max(0, delayCountTo - 1);
    const delayFromFactor = 1;
    const delayToFactor = -1;

    return {
      delayCountFrom, 
      delayCountTo,
      navDirection, 
      delayIndexFrom,
      delayIndexTo,
      delayToFactor,
      delayFromFactor,
      getDirectionForRoute,
      getIndex,
      getTransitionProgress,
      getRoutes,
    }
  }

  render() {
    const transitionElements = this.props.transitionElements ? this.props.transitionElements
      .filter(i => i.route === this.props.fromRoute || i.route === this.props.toRoute) : [];

    const transitionContext = this.getTransitionContext(transitionElements);

    if (!transitionContext || !this.getMetricsReady()) {
      return <View style={styles.overlay} pointerEvents="none" />;
    }
    
    const transitionViews = getTransitionElements(transitionElements, transitionContext);

    return (
      <View style={styles.overlay} pointerEvents="none">
        {transitionViews}
      </View>
    );
  }

  getMetricsReady(): boolean {
    if (this.props.transitionElements) {
      let metricsReady = true;
      this.props.transitionElements.forEach(item => {
        if (!item.metrics) { metricsReady = false; }
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
    getDirectionForRoute: PropTypes.func,
    getDirection: PropTypes.func,
    getIndex: PropTypes.func,
    getRoutes: PropTypes.func,
  }
}

const styles: StyleSheet.NamedStyles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },  
});

export default TransitionElementsOverlayView;
