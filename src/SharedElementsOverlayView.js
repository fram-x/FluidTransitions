import React from 'react';
import { View, Dimensions, StyleSheet, Animated } from 'react-native';
import PropTypes from 'prop-types';

import TransitionItem from './TransitionItem';
import { createAnimatedWrapper } from './createAnimatedWrapper';
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
      // console.log("SE UPDATE elements changed ");
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

    const self = this;
    const sharedElements = this.props.sharedElements.map((pair, idx) => {
      const { fromItem, toItem } = pair;
      const transitionStyles = self.getTransitionStyle(fromItem, toItem);

      const element = React.Children.only(fromItem.reactElement.props.children);
      const key = "SharedOverlay-"  + idx.toString();
      const style = [element.props.style, styles.sharedElement, transitionStyles];
      return createAnimatedWrapper(element, key, style);
    });

    return (
      <View key="overlay" style={styles.overlay} pointerEvents="none">
        {sharedElements}
      </View>
    );
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
    const { getTransitionProgress, getIndex, getDirection } = this.context;
    if (!getTransitionProgress || !getIndex || !getDirection ||
      !fromItem.metrics || !toItem.metrics) {
      return {
        width: fromItem.metrics.width,
        height: fromItem.metrics.height,
        left: fromItem.metrics.x,
        top: fromItem.metrics.y,
      };
    }

    const index = getIndex();
    const direction = getDirection();
    const nativeProgress = getTransitionProgress(true);
    const progress = getTransitionProgress(false);

    const nativeInterpolatedProgress = progress.interpolate({
      inputRange: direction === NavigationDirection.forward ? 
        [index - 1, index] : [index, index + 1],
      outputRange: [0, 1],
    });

    const interpolatedProgress = progress.interpolate({
      inputRange: direction === NavigationDirection.forward ? 
        [index - 1, index] : [index, index + 1],
      outputRange: [0, 1],
    });

    const interpolatorInfo: InterpolatorSpecification = {
      from: {
        metrics: fromItem.metrics,
        style: fromItem.getFlattenedStyle(),
      },
      to: {
        metrics: toItem.metrics,
        style: toItem.getFlattenedStyle(),
      },
      scaleX: toItem.scaleRelativeTo(fromItem).x,
      scaleY: toItem.scaleRelativeTo(fromItem).y,
      nativeInterpolatedProgress,
      interpolatedProgress,
      dimensions: Dimensions.get('window'),
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
      ...this.mergeStyles(styles)
    };
  }

  mergeStyles(styles: Array<any>): StyleSheet.NamedStyles {
    const retVal = { transform: [] };
    styles.forEach(s => {      
      Object.keys(s).forEach(key => {
        if(s[key] && s[key] instanceof Array){
          const a = s[key];
          if(!retVal[key]) retVal[key] = [];
          a.forEach(i => retVal[key].push(i));
        } else {
          retVal[key] = s[key];
        }
      })
    })

    return retVal;
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
    // backgroundColor: '#FF000022',
    padding: 0,
    margin: 0,
  },
});


export default SharedElementsOverlayView;
