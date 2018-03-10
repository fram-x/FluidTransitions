import React from 'react';
import { View, StyleSheet, Animated, Dimensions, Platform } from 'react-native';
import PropTypes from 'prop-types';

import TransitionItem from './TransitionItem';
import { TransitionConfiguration, TransitionContext, TransitionSpecification } from './Types';
import {
  getScaleTransition,
  getTopTransition,
  getBottomTransition,
  getLeftTransition,
  getRightTransition,
  getHorizontalTransition,
  getVerticalTransition
}
  from './Transitions';
import * as Constants from './TransitionConstants';

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
    // backgroundColor: '#00FF0022',
    margin: 0,
  },
});

type TransitionEntry = {
  name: string,
  transitionFunction: Function
}

const transitionTypes: Array<TransitionEntry> = [];

// This function can be called to register other transition functions
export function registerTransitionType(name: string, transitionFunction: Function): TransitionEntry {
  transitionTypes.push({ name, transitionFunction });
}

registerTransitionType('scale', getScaleTransition);
registerTransitionType('top', getTopTransition);
registerTransitionType('bottom', getBottomTransition);
registerTransitionType('left', getLeftTransition);
registerTransitionType('right', getRightTransition);
registerTransitionType('horizontal', getHorizontalTransition);
registerTransitionType('vertical', getVerticalTransition);

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
  }

  _isMounted: boolean;
  _transitionElements: Array<TransitionItem>

  render() {
    if(!this.props.transitionElements || !this.getMetricsReady()) {
      this._transitionElements = [];
      return <View style={styles.overlay} pointerEvents='none'/>;
    }

    if(this._transitionElements.length === 0) {
      const { getDirection } = this.context;
      if(!getDirection)
        return [];

      let delayCountFrom = this.props.transitionElements.reduce((prevValue, item) => 
        item.delay && getDirection(item.name, item.route) === 1 ? prevValue + 1: prevValue, 0);

      let delayCountTo = this.props.transitionElements.reduce((prevValue, item) => 
        item.delay && getDirection(item.name, item.route) === -1 ? prevValue + 1: prevValue, 0);

      let delayIndexFrom = 0;
      let delayIndexTo = delayCountTo-1;

      this._transitionElements = this.props.transitionElements.map((item, idx) => {
        let element = React.Children.only(item.reactElement.props.children);
        const direction = getDirection(item.name, item.route);
        const comp = this.getAnimatedComponent(element, idx, 
          this.getStyle(item, direction === 1 ? delayCountFrom : delayCountTo, 
            direction === 1 ? delayIndexFrom : delayIndexTo));

        if(item.delay) {
          direction === 1 ? delayIndexFrom++ : delayIndexTo--;
        }
        return comp;
      });
    }

    return (
      <View style={styles.overlay} pointerEvents='none'>
        {this._transitionElements}
      </View>
    );
  }

  getStyle(item: TransitionItem, delayCount: number, delayIndex: number) {
    return {
      left: item.metrics.x,
      top: item.metrics.y,
      width: item.metrics.width,
      height: item.metrics.height,
      ...this.getTransitionStyle(item, delayCount, delayIndex)
    };
  }

  getTransitionStyle(item: TransitionItem, delayCount: number, delayIndex: number) {
    const { getTransitionProgress, getMetrics, getDirection, getReverse, } = this.context;
    if (!getTransitionProgress || !getMetrics || !getDirection || !getReverse )
      return {};

    const progress = getTransitionProgress(item.name, item.route);
    if(progress) {
      const transitionFunction = this.getTransitionFunction(item.appear);
      if (transitionFunction) {
        // Calculate start/end to handle delayed transitions
        let start = Constants.TRANSITION_PROGRESS_START;
        let end = Constants.TRANSITION_PROGRESS_END;
        const direction = getDirection(item.name, item.route);
        const distance = 1.0 - (Constants.TRANSITION_PROGRESS_START +
          (1.0 - Constants.TRANSITION_PROGRESS_END));

        if(item.delay){
          const delayStep = distance / delayCount;
          start = start + (delayStep * delayIndex);
         // end = start + delayStep;
        }
        else {
          // Start/stop first/last half of transition
          if(direction === 1) {
            end -= distance * 0.5;
          } else {
            start += distance * 0.5;
          }          
        }

        const transitionSpecification: TransitionSpecification = {
          progress,
          name: item.name,
          route: item.route,
          metrics: item.metrics,
          direction: direction,
          reverse: getReverse(item.name, item.route),
          dimensions: Dimensions.get('window'),
          start,
          end
        };
        const transitionStyle = transitionFunction(transitionSpecification);
        return transitionStyle;
      }
    }
    return { };
  }

  getTransitionFunction(appear) {
    if (appear) {
      const transitionType = transitionTypes.find(e => e.name === appear);
      if (transitionType) {
        return transitionType.transitionFunction;
      }
    }
    return null;
  }

  getAnimatedComponent(renderElement, idx, style) {

    let element = renderElement;
    let animatedComponent = null;
    let elementProps = element.props;
    let child = null;

    // Functional components should be wrapped in a view to be usable with
    // Animated.createAnimatedComponent
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
      collapsable: false,
      style: [element.props.style, styles.transitionElement, style],
      key: idx,
    };

    return React.createElement(animatedComponent, props, child ? child : props.children);
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
