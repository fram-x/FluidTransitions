import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import PropTypes from 'prop-types';

import TransitionItem from './TransitionItem';

export type TransitionConfiguration = {
  fromRoute: string,
  toRoute: string,
  sharedElements: Map<TransitionItem, TransitionItem>,
  transitionElements: Array<TransitionItem>,
  direction: number,
  config: Object,
  progress: Animated.Value
}

class TransitionOverlayView extends React.Component {
  constructor(props, context) {
    super(props, context);
    this._transitionConfig = {};
    this._forceUpdate = false;
    this._isMounted = false;
  }

  _transitionConfig: TransitionConfiguration
  _forceUpdate: boolean
  _isMounted: boolean

  setTransitionConfig(transitionConfig: TransitionConfiguration) {
    this._transitionConfig = transitionConfig;
    this._forceUpdate = true;
    if (this._isMounted)
      this.forceUpdate();
  }

  render() {
    if (!this._transitionConfig.sharedElements) {
      return null;
    }

    const self = this;
    const sharedElements = this._transitionConfig.sharedElements.map((pair, idx) => {

      const { fromItem, toItem } = pair;
      const transitionStyle = self.getTransitionStyle(fromItem, toItem);

      // Buttons needs to be wrapped in a view to work properly.
      let element = React.Children.only(self._transitionConfig.direction === -1 ?
        fromItem.reactElement.props.children :
        toItem.reactElement.props.children);

      if (element.type.name === 'Button')
        element = (<View>{element}</View>);

      const AnimatedComp = Animated.createAnimatedComponent(element.type);
      const props = {
        ...element.props,
        style: [element.props.style, transitionStyle],
        key: idx,
      };

      return React.createElement(AnimatedComp, props, element.props.children);
    });

    return (
      <Animated.View
        style={[styles.overlay, this.getAppearStyle()]}
        onLayout={this.props.onLayout}
        pointerEvents={'none'}
      >
        {sharedElements}
      </Animated.View>
    );
  }

  getAppearStyle() {
    const interpolator = this.context.sharedProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });
    return { opacity: interpolator };
  }

  getTransitionStyle(fromItem: TransitionItem, toItem: TransitionItem) {
    const { progress } = this._transitionConfig;
    if (!progress) return {};

    const toVsFromScaleX = toItem.scaleRelativeTo(fromItem).x;
    const toVsFromScaleY = toItem.scaleRelativeTo(fromItem).y;

    let rotateFrom = this.getRotation(fromItem);
    let rotateTo = this.getRotation(toItem);
    let rotate = null;
    if (rotateFrom || rotateTo) {
      if (!rotateFrom) rotateFrom = '0deg';
      if (!rotateTo) rotateTo = '0deg';
      rotate = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [rotateFrom, rotateTo]
      });
    }

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

    const transform = [{ translateX  }, { translateY  }, { scaleX }, { scaleY }];
    if (rotate)
      transform.push({ rotate });

    return [styles.sharedElement, {
      width: fromItem.metrics.width,
      height: fromItem.metrics.height,
      transform
    }];
  }

  getRotation(item: TransitionItem): string  {
    const element = React.Children.only(item.reactElement.props.children);
    const styles = element.props.style;
    if (!styles) return null;
    const s = StyleSheet.flatten(styles);
    if (s.transform) {
      const rotation = s.transform.find(e => e.rotate);
      if (rotation) {
        return rotation.rotate;
      }
    }
    return null;
  }

  shouldComponentUpdate(nextProps?: Object, nextState?: Object) {
    const retVal = this._forceUpdate;
    this._forceUpdate = false;
    return retVal;
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  static contextTypes = {
    sharedProgress: PropTypes.object
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
  }
});

export default TransitionOverlayView;