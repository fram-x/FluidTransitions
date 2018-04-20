import React from 'react';
import { View, Dimensions, StyleSheet, Animated } from 'react-native';
import PropTypes from 'prop-types';

import TransitionItem from './TransitionItem';
import { createAnimatedWrapper, createAnimated, mergeStyles } from './Utils';
import {
  TransitionContext,
  NavigationDirection,
  InterpolatorSpecification,
  InterpolatorResult,
} from './Types';

import { initInterpolatorTypes, getSharedElements } from './Interpolators';

initInterpolatorTypes();

type SharedElementsOverlayViewProps = {
  fromRoute: string,
  toRoute: string,
  sharedElements: Array<any>,
  direction: number
}

class SharedElementsOverlayView extends React.Component<SharedElementsOverlayViewProps> {
  context: TransitionContext
  constructor(props: SharedElementsOverlayViewProps, context: TransitionContext) {
    super(props, context);
    this._isMounted = false;
    this.getInterpolation = this.getInterpolation.bind(this);
  }

  _isMounted: boolean;
  _nativeInterpolation: any;
  _interpolation: any;

  shouldComponentUpdate(nextProps) {
    if (!nextProps.fromRoute && !nextProps.toRoute) {
      return false;
    }

    // Compare toRoute/fromRoute/direction
    if (this.props.toRoute !== nextProps.toRoute ||
      this.props.fromRoute !== nextProps.fromRoute ||
      this.props.direction !== nextProps.direction) {
      return false;
    }

    // Compare shared elements count
    if (!this.compareArrays(this.props.sharedElements, nextProps.sharedElements)) {
      return true;
    }

    return false;
  }

  compareArrays(a, b) {
    if (!a && !b) return false;
    if (!a && b || !b && a) return false;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i].fromItem.name !== b[i].fromItem.name ||
        a[i].fromItem.route !== b[i].fromItem.route ||
        a[i].toItem.name !== b[i].toItem.name ||
        a[i].toItem.route !== b[i].toItem.route) { return false; }
    }
    return true;
  }

  render() {
    if (!this.props.sharedElements || !this.getMetricsReady()) {
      return <View key="overlay" style={styles.overlay} pointerEvents="none" />;
    }

    this._interpolation = null;
    this._nativeInterpolation = null;

    const self = this;
    const sharedElements = getSharedElements(this.props.sharedElements, this.getInterpolation);

    return (
      <View key="overlay" style={styles.overlay} pointerEvents="none">
        {sharedElements}
      </View>
    );
  }

  getInterpolation(useNativeDriver: boolean) {
    const { getTransitionProgress, getIndex, getDirection } = this.context;
    if (!getTransitionProgress || !getIndex || !getDirection) return null;

    const index = getIndex();
    const direction = getDirection();
    const inputRange = direction === NavigationDirection.forward ?
      [index - 1, index] : [index, index + 1];

    if (useNativeDriver && !this._nativeInterpolation) {
      this._nativeInterpolation = getTransitionProgress(true).interpolate({
        inputRange, outputRange: [0, 1],
      });
    } else if (!useNativeDriver && !this._interpolation) {
      this._interpolation = getTransitionProgress(false).interpolate({
        inputRange, outputRange: [0, 1],
      });
    }

    if (useNativeDriver) return this._nativeInterpolation;
    return this._interpolation;
  }

  getMetricsReady(): boolean {
    if (this.props.sharedElements) {
      let metricsReady = true;
      this.props.sharedElements.forEach(pair => {
        if (!pair.toItem.metrics || !pair.fromItem.metrics) { metricsReady = false; }
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
    getIndex: PropTypes.func,
  }
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});


export default SharedElementsOverlayView;
