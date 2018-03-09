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
    backgroundColor: '#00FF0022',
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
      this._transitionElements = this.props.transitionElements.map((item, idx) => {
        let element = React.Children.only(item.reactElement.props.children);
        return this.getAnimatedComponent(element, idx, this.getStyle(item));
      });
    }

    return (
      <View style={styles.overlay} pointerEvents='none'>
        {this._transitionElements}
      </View>
    );
  }

  getStyle(item: TransitionItem) {
    return {
      left: item.metrics.x, 
      top: item.metrics.y,
      width: item.metrics.width, 
      height: item.metrics.height,
      ...this.getTransitionStyle(item)
    };
  }

  getTransitionStyle(item: TransitionItem) {
    const { getTransitionProgress, getMetrics, getDirection, getReverse, } = this.context;
    if (!getTransitionProgress || !getMetrics || !getDirection || !getReverse )
      return {};

    const progress = getTransitionProgress(item.name, item.route);
    if(progress) {      
      const transitionFunction = this.getTransitionFunction(item.appear);
      if (transitionFunction) {
        const transitionSpecification: TransitionSpecification = {
          progress,
          name: item.name,
          route: item.route,          
          metrics: item.metrics,
          direction: getDirection(item.name, item.route),
          reverse: getReverse(item.name, item.route),
          dimensions: Dimensions.get('window'),
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
    // Animated.createAnimatedComponent. We also need to wrap buttons in
    // separate containers. Don't know why!
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
      style: [element.props.style, styles.transitionElement, style],
      key: idx,
    };

    if(child)
      return React.createElement(animatedComponent, props, child);

    return React.createElement(animatedComponent, props);
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
