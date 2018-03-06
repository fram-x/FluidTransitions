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
  transitionElement: {
    position: 'absolute',
    backgroundColor: '#E5D',
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
        // Get correct style
        const transitionStyle = this.getTransitionStyle(item);
        let element = React.Children.only(item.reactElement.props.children);
        return this.getAnimatedComponent(element, idx, transitionStyle);
      });
    }

    return (
      <View style={styles.emptyOverlay} pointerEvents='none'>
        {this._transitionElements}
      </View>
    );
  }

  getTransitionStyle(item: TransitionItem) {
    const { getTransitionProgress } = this.context;
    if (!getTransitionProgress) return {};

    const progress = getTransitionProgress(item.name, item.route);

    return {
      width: item.metrics.width,
      height: item.metrics.height,
      transform: [{ translateX: item.metrics.x }, { translateY: item.metrics.y }]
    }
  }

  getAnimatedComponent(renderElement, idx, transitionStyle) {

    let element = renderElement;
    let animatedComponent = null;
    let elementProps = element.props;
    let child = null;

    // Functional components should be wrapped in a view to be usable with
    // Animated.createAnimatedComponent
    const isFunctionalComponent = !element.type.displayName;
    if(isFunctionalComponent) {
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
      style: [element.props.style, styles.transitionElement, transitionStyle],
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
  }
}

export default TransitionElementsOverlayView;
