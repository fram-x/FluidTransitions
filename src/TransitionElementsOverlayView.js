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
  }

  _isMounted: boolean;

  render() {
    if(this.props.transitionElements)
      return <View style={styles.emptyOverlay} pointerEvents='none'/>;

    return <View style={styles.emptyOverlay} pointerEvents='none'/>;
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }
}

export default TransitionElementsOverlayView;
