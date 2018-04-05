import React from 'react';
import { View, Dimensions, AnimatedInterpolation, StyleSheet, Animated } from 'react-native';
import PropTypes from 'prop-types';

import TransitionItem from './TransitionItem';
import { createAnimatedWrapper, createAnimated, mergeStyles } from './Utils';
import { TransitionContext, NavigationDirection, InterpolatorSpecification } from './Types';
import {
  getScaleInterpolator,
  getRotationInterpolator,
  getPositionInterpolator,
  getBackgroundInterpolator,
  getBorderInterpolator,
} from './Interpolators';

type InterpolatorEntry = {
  name: string,
  interpolatorFunction: Function
}

const interpolators: Array<InterpolatorEntry> = [];

// This function can be called to register other transition functions
export function registerInterpolator(name: string, interpolatorFunction: Function): InterpolatorEntry {
  interpolators.push({ name, interpolatorFunction });
}

registerInterpolator('background', getBackgroundInterpolator);
registerInterpolator('borderRadius', getBorderInterpolator);
registerInterpolator('position', getPositionInterpolator);
registerInterpolator('scale', getScaleInterpolator);
registerInterpolator('rotation', getRotationInterpolator);


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
  }

  _isMounted: boolean;
  _nativeInterpolation: AnimatedInterpolation;
  _interpolation: AnimatedInterpolation;

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
      // console.log("RENDER SE empty");
      return <View key="overlay" style={styles.overlay} pointerEvents="none" />;
    }

    // console.log("RENDER SE " + this.props.sharedElements.length);

    this.setupInterpolations();

    const self = this;
    const sharedElements = this.props.sharedElements.map((pair, idx) => {
      const { fromItem, toItem } = pair;
      const transitionStyles = self.getTransitionStyle(fromItem, toItem);
      const element = React.Children.only(fromItem.reactElement.props.children);
      const key = "SharedOverlay-"  + idx.toString();
      const style = [element.props.style, transitionStyles, styles.sharedElement];
      return createAnimatedWrapper(element, key, style);
    });

    return (
      <View key="overlay" style={styles.overlay} pointerEvents="none">
        {sharedElements}
      </View>
    );
  }

  setupInterpolations() {
    const { getTransitionProgress, getIndex, getDirection } = this.context;
    if(!getTransitionProgress || !getIndex || !getDirection ) return null;

    const index = getIndex();
    const direction = getDirection();    
    const inputRange = direction === NavigationDirection.forward ? 
      [index - 1, index] : [index, index + 1];

    // TODO: Seems like it is illegal to combine both native and non-native for
    // same element
    this._interpolation = getTransitionProgress(false).interpolate({
      inputRange, outputRange: [0, 1],
    });
    
    this._nativeInterpolation = getTransitionProgress(false).interpolate({
      inputRange, outputRange: [0, 1],
    });
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
  
  getTransitionStyle(fromItem: TransitionItem, toItem: TransitionItem) {
    
    const interpolatorInfo: InterpolatorSpecification = {
      from: {
        metrics: fromItem.metrics,
        style: fromItem.getFlattenedStyle(),
        rotation: fromItem.rotation,
      },
      to: {
        metrics: toItem.metrics,
        style: toItem.getFlattenedStyle(),
        rotation: toItem.rotation,
      },
      scaleX: toItem.scaleRelativeTo(fromItem).x,
      scaleY: toItem.scaleRelativeTo(fromItem).y,     
      interpolation: this._interpolation,
      nativeInterpolation: this._nativeInterpolation,
      dimensions: Dimensions.get('window'),
      modifiers: fromItem.modifiers ? fromItem.modifiers : ""
    };

    const styles = [];
    
    interpolators.forEach(interpolator => {
      const style = interpolator.interpolatorFunction(interpolatorInfo);
      if(style)
        styles.push(style);
    });

    return {
      width: fromItem.metrics.width,
      height: fromItem.metrics.height,
      ...mergeStyles(styles)
    };
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
  sharedElement: {
    position: 'absolute',
    // backgroundColor: '#00FF0022',
    // borderColor: '#00FF00',
    // borderWidth: 1,
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    padding: 0,
    margin: 0,
  },
});


export default SharedElementsOverlayView;
