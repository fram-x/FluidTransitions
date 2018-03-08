import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import PropTypes from 'prop-types';

import TransitionItem from './TransitionItem';
import { TransitionConfiguration, TransitionContext } from './Types';
import SharedElementsOverlayView from './SharedElementsOverlayView';
import TransitionElementsOverlayView from './TransitionElementsOverlayView';

const styles: StyleSheet.NamedStyles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  }
});

type TransitionOverlayViewProps = {
  fromRoute: string,
  toRoute: string,
  transitionElements: Array<TransitionItem>,
  sharedElements: Array<any>,
  visibility: Animated.Value,
  direction: number
}

class TransitionOverlayView extends React.Component<TransitionOverlayViewProps> {
  context: TransitionContext
  constructor(props: TransitionOverlayViewProps, context: TransitionContext) {
    super(props, context);
    this._isMounted = false;
  }

  _isMounted: boolean;

  render() {
    return (
      <Animated.View style={[styles.overlay, this.getVisibilityStyle()]} pointerEvents='none'>
        <SharedElementsOverlayView
          sharedElements={this.props.sharedElements}
          direction={this.props.direction}
        />
        <TransitionElementsOverlayView
          transitionElements={this.props.transitionElements}
          direction={this.props.direction}
        />
      </Animated.View>
    );
  }

  getVisibilityStyle(){
    const { getTransitionProgress } = this.context;
    if(!getTransitionProgress) return  {};
    const visibilityProgress = getTransitionProgress();
    return {
      opacity: visibilityProgress.interpolate({
        inputRange:[0, 0.0001, 0.9999, 1],
          outputRange: [0, 1, 1, 0]
      })
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

export default TransitionOverlayView;
