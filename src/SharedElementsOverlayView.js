import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import PropTypes from 'prop-types';

import TransitionItem from './TransitionItem';
import { TransitionConfiguration, TransitionContext } from './Types';

const styles: StyleSheet.NamedStyles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    },
  emptyOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    },
  sharedElement: {
    position: 'absolute',
    // borderColor: '#34CE34',
    // borderWidth: 1,
    margin: 0,
    left: 0,
    top: 0,
  },
});

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
    this._sharedElements = null;
  }

  _isMounted: boolean;
  _sharedElements: Array<any>;

  render() {
    if(!this.props.sharedElements || !this.getMetricsReady()) {
      this._sharedElements = null;
      return <View style={styles.emptyOverlay} pointerEvents='none'/>;
    }

    if(!this._sharedElements) {
      const self = this;
      this._sharedElements = this.props.sharedElements.map((pair, idx) => {
        const { fromItem, toItem } = pair;
        const transitionStyle = self.getTransitionStyle(fromItem, toItem);
        
        let element = React.Children.only(self.props.direction === -1 ?
          fromItem.reactElement.props.children :
          toItem.reactElement.props.children);

        const AnimatedComp = Animated.createAnimatedComponent(element.type);
        const props = {
          ...element.props,
          style: [element.props.style, styles.sharedElement, transitionStyle],
          key: idx,
        };
        
        return React.createElement(AnimatedComp, props, element.props.children);
      });
    };

    return (
      <View style={styles.emptyOverlay} pointerEvents='none'>
        {this._sharedElements}
      </View>
    );
  }

  getMetricsReady(): boolean {
    if(this.props.sharedElements) {
      const metricsReady = true;
      this.props.sharedElements.forEach(pair => {
        if(!pair.toItem.metrics || !pair.fromItem.metrics)
          metricsReady = false;
      });
      return metricsReady;
    }
    return false;
  }

  getTransitionStyle(fromItem: TransitionItem, toItem: TransitionItem) {    
    const { getTransitionProgress } = this.context;
    if (!getTransitionProgress || !fromItem.metrics || !toItem.metrics) return {};

    const progress = getTransitionProgress(fromItem.name, fromItem.route);
    
    const toVsFromScaleX = toItem.scaleRelativeTo(fromItem).x;
    const toVsFromScaleY = toItem.scaleRelativeTo(fromItem).y;
    
    // let rotateFrom = this.getRotation(fromItem);
    // let rotateTo = this.getRotation(toItem);
    // let rotate = null;
    // if (rotateFrom || rotateTo) {
    //   if (!rotateFrom) rotateFrom = '0deg';
    //   if (!rotateTo) rotateTo = '0deg';
    //   rotate = progress.interpolate({
    //     inputRange: [0, 1],
    //     outputRange: [rotateFrom, rotateTo],
    //   });
    // }

    const scaleX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [1, toVsFromScaleX],
    });

    const scaleY = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [1, toVsFromScaleY],
    });

    const translateX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [fromItem.metrics.x, toItem.metrics.x +
        fromItem.metrics.width / 2 * (toVsFromScaleX - 1)],
    });

    const translateY = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [fromItem.metrics.y, toItem.metrics.y +
        fromItem.metrics.height / 2 * (toVsFromScaleY - 1)],
    });

    // const transform = [{ translateX }, { translateY }, { scaleX }, { scaleY }];
    // if (rotate) { transform.push({ rotate }); }

    return {
      width: fromItem.metrics.width,
      height: fromItem.metrics.height,
      transform: [{ translateX }, { translateY }, { scaleX }, { scaleY }]
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
  }
}

export default SharedElementsOverlayView;
