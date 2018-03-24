import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import PropTypes from 'prop-types';

import TransitionItem from './TransitionItem';
import { TransitionConfiguration, NavigationDirection, TransitionContext } from './Types';
import SharedElementsOverlayView from './SharedElementsOverlayView';
import TransitionElementsOverlayView from './TransitionElementsOverlayView';
import * as Constants from './TransitionConstants';

const styles: StyleSheet.NamedStyles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    backgroundColor: '#ECFF0022',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  }
});

type TransitionOverlayViewProps = {
  fromRoute: string,
  toRoute: string,
  visibility: Animated.Value,
  direction: number,
  index: number,
  sharedElements: Array<any>,
  transitionElements: Array<TransitionItem>
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
        <TransitionElementsOverlayView
          transitionElements={this.props.transitionElements}
          direction={this.props.direction}
          fromRoute={this.props.fromRoute}
          toRoute={this.props.toRoute}
        />
         <SharedElementsOverlayView
          sharedElements={this.props.sharedElements}
          direction={this.props.direction}
          fromRoute={this.props.fromRoute}
          toRoute={this.props.toRoute}
        />
      </Animated.View>
    );
  }

  getVisibilityStyle(){
    const { getTransitionProgress } = this.context;
    const { index, direction } = this.props;

    if(!getTransitionProgress) return  {};
    const progress = getTransitionProgress();
    if(!progress || index === undefined) return { opacity: 0 };
        
    const visibility = progress.interpolate({
      inputRange: direction === NavigationDirection.forward ? [index -1, index] : [index, index+1],
      outputRange: direction === NavigationDirection.forward ? [0, 1] : [1, 0],
    });
    
    return { 
      opacity: visibility.interpolate({
          inputRange: Constants.OVERLAY_VIEWS_VISIBILITY_INPUT_RANGE,
          outputRange: Constants.OVERLAY_VIEWS_VISIBILITY_OUTPUT_RANGE
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
