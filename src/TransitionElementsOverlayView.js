import React from 'react';
import { View, StyleSheet, Animated, Dimensions, Platform } from 'react-native';
import PropTypes from 'prop-types';

import TransitionItem from './TransitionItem';
import { TransitionContext, RouteDirection, NavigationDirection, TransitionSpecification } from './Types';
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
  }

  _isMounted: boolean;
  _transitionElements: Array<TransitionItem>

  render() {
    if(!this.props.transitionElements || !this.getMetricsReady()) {
      return <View style={styles.overlay} pointerEvents='none'/>;
    }

    const { getDirectionForRoute, getDirection } = this.context;
    if(!getDirectionForRoute || !getDirection)
      return [];

    let delayCountFrom = this.props.transitionElements.reduce((prevValue, item) =>
      item.delay && getDirectionForRoute(item.name, item.route) === RouteDirection.from ? 
        prevValue + 1: prevValue, 0);

    let delayCountTo = this.props.transitionElements.reduce((prevValue, item) =>
      item.delay && getDirectionForRoute(item.name, item.route) === RouteDirection.to ? 
        prevValue + 1: prevValue, 0);

    const navDirection = getDirection();
    let delayIndexFrom = 0;
    let delayIndexTo = Math.max(0, delayCountTo-1);
    let delayFromFactor = 1;
    let delayToFactor = -1;

    const transitionElements = this.props.transitionElements.map((item, idx) => {
      let element = React.Children.only(item.reactElement.props.children);
      const routeDirection = getDirectionForRoute(item.name, item.route);
      const comp = this.getAnimatedComponent(element, idx,
        this.getStyle(item, routeDirection === RouteDirection.from ? 
          delayCountFrom : delayCountTo,
          routeDirection === RouteDirection.from ? 
          delayIndexFrom : delayIndexTo));

      if(item.delay) {
        routeDirection === RouteDirection.from ? 
          delayIndexFrom += delayFromFactor : 
          delayIndexTo += delayToFactor;
      }
      return comp;
    });

    return (
      <View style={styles.overlay} pointerEvents='none'>
        {transitionElements}
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
    const { getTransitionProgress, getDirectionForRoute, } = this.context;
    if (!getTransitionProgress || !getDirectionForRoute)
      return {};

    const progress = getTransitionProgress(item.name, item.route);
    if(progress) {
      const transitionFunction = this.getTransitionFunction(item.appear);
      if (transitionFunction) {
        // Calculate start/end to handle delayed transitions
        let start = Constants.TRANSITION_PROGRESS_START;
        let end = Constants.TRANSITION_PROGRESS_END;

        const routeDirection = getDirectionForRoute(item.name, item.route);
        const distance = (1.0 - (Constants.TRANSITION_PROGRESS_START +
          (1.0 - Constants.TRANSITION_PROGRESS_END))) * 0.5;

        if(item.delay){
          // Start/stop in delay window
          const delayStep = distance / delayCount;
          if(routeDirection === RouteDirection.from) {
            start = start + (delayStep * delayIndex);
          } else {
            end = end - (delayStep * delayIndex);
          }
        }
        else {
          // Start/stop first/last half of transition
          if(routeDirection === RouteDirection.from) {
            end -= distance;
          } else {
            start += distance;
          }
        }

        const transitionSpecification: TransitionSpecification = {
          progress,
          name: item.name,
          route: item.route,
          metrics: item.metrics,
          direction: routeDirection,          
          dimensions: Dimensions.get('window'),
          start,
          end
        }

        return transitionFunction(transitionSpecification);
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

  _animatedComponent;
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
      if(!this._animatedComponent){
        const wrapper = (<View/>);
        this._animatedComponent = Animated.createAnimatedComponent(wrapper.type);
      }
      elementProps = {};
      child = element;
    }
    else if(!this._animatedComponent) {
      this._animatedComponent = Animated.createAnimatedComponent(element.type);
    }

    const props = {
      ...element.props,
      collapsable: false,
      style: [element.props.style, styles.transitionElement, style],
      key: idx,
    };

    return React.createElement(this._animatedComponent, props, child ? child : props.children);
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
    getDirectionForRoute: PropTypes.func,    
    getDirection: PropTypes.func
  }
}

export default TransitionElementsOverlayView;
