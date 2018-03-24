import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import PropTypes from 'prop-types';

import TransitionItem from './TransitionItem';
import { TransitionConfiguration, TransitionContext, NavigationDirection } from './Types';

const styles: StyleSheet.NamedStyles = StyleSheet.create({
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

  shouldComponentUpdate(nextProps){
    if(!nextProps.fromRoute && !nextProps.toRoute)
      return false;

    // Compare toRoute/fromRoute/direction
    if(this.props.toRoute !== nextProps.toRoute ||
      this.props.fromRoute !== nextProps.fromRoute ||
      this.props.direction !== nextProps.direction)
      return true;

    // Compare shared elements count
    if(!this.compareArrays(this.props.sharedElements, nextProps.sharedElements)) 
      return true;

    return false;
  }

  compareArrays(a, b){
    if(!a && !b) return false;
    if(!a && b || !b && a) return false;
    if(a.length !== b.length) return false;
    for(let i=0; i<a.length; i++){
      if(a[i].fromItem.name !== b[i].fromItem.name ||
        a[i].fromItem.route !== b[i].fromItem.route ||
        a[i].toItem.name !== b[i].toItem.name ||
        a[i].toItem.route !== b[i].toItem.route)
        return false;
    }
    return true;
  }
  
  render() {
    if(!this.props.sharedElements || !this.getMetricsReady()) {    
      return <View style={styles.overlay} pointerEvents='none'/>;
    }
    const self = this;
    const sharedElements = this.props.sharedElements.map((pair, idx) => {
      const { fromItem, toItem } = pair;
      const transitionStyle = self.getTransitionStyle(fromItem, toItem);

      let element = React.Children.only(fromItem.reactElement.props.children);
      let elementProps = element.props;
      let animatedComponent;
      let child;

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
        const wrapper = (<View/>);
        animatedComponent = Animated.createAnimatedComponent(wrapper.type);        
        elementProps = {};
        child = element;
      }

      const props = {
        ...element.props,
        style: [element.props.style, styles.sharedElement, transitionStyle],
        key: idx,
      };

      return React.createElement(animatedComponent, props, child ?
        child : element.props.children);
    });    

    return (
      <View style={styles.overlay} pointerEvents='none'>
        {sharedElements}
      </View>
    );
  }

  getMetricsReady(): boolean {
    if(this.props.sharedElements) {
      let metricsReady = true;
      this.props.sharedElements.forEach(pair => {
        if(!pair.toItem.metrics || !pair.fromItem.metrics)
          metricsReady = false;
      });
      return metricsReady;
    }
    return false;
  }

  getTransitionStyle(fromItem: TransitionItem, toItem: TransitionItem) {    
    const { getTransitionProgress, getIndex, getDirection } = this.context;
    if (!getTransitionProgress || !getIndex || !getDirection || 
      !fromItem.metrics || !toItem.metrics) return {
      width: fromItem.metrics.width,
      height: fromItem.metrics.height,
      left: fromItem.metrics.x,
      top: fromItem.metrics.y,
    };

    const index = getIndex();
    const direction = getDirection();
    const progress = getTransitionProgress(fromItem.name, fromItem.route);
    const interpolatedProgress = progress.interpolate({
      inputRange: direction === NavigationDirection.forward ? [index-1, index] : [index, index + 1],
      outputRange: [0, 1],
    });

    const toVsFromScaleX = toItem.scaleRelativeTo(fromItem).x;
    const toVsFromScaleY = toItem.scaleRelativeTo(fromItem).y;

    const scaleX = interpolatedProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [1, toVsFromScaleX],
    });

    const scaleY = interpolatedProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [1, toVsFromScaleY],
    });

    const translateX = interpolatedProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [fromItem.metrics.x, toItem.metrics.x +
        fromItem.metrics.width / 2 * (toVsFromScaleX - 1)],
    });

    const translateY = interpolatedProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [fromItem.metrics.y, toItem.metrics.y +
        fromItem.metrics.height / 2 * (toVsFromScaleY - 1)],
    });

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
    getDirection: PropTypes.func,
    getIndex: PropTypes.func,
  }
}

export default SharedElementsOverlayView;
