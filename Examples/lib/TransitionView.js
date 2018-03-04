import React from 'react';
import { Animated, StyleSheet, findNodeHandle } from 'react-native';
import PropTypes from 'prop-types';

import TransitionItem from './TransitionItem';

import {
  ScaleTransition,
  TopTransition,
  BottomTransition,
  LeftTransition,
  RightTransition,
  HorizontalTransition,
  VerticalTransition,
  BaseTransition }
  from './Transitions';

const uniqueBaseId: string = `transitionCompId-${Date.now()}`;
let uuidCount: number = 0;

type TransitionEntry = {
  name: string,
  TransitionClass: Function
}

const transitionTypes: Array<TransitionEntry> = [];

export function registerTransitionType(name: string, TransitionClass: Function): TransitionEntry {
  transitionTypes.push({ name, TransitionClass });
}

const styles = StyleSheet.create({
  transitionElement: {
    // borderColor: '#FF0000',
    // borderWidth: 1,
  },
});

registerTransitionType('scale', ScaleTransition);
registerTransitionType('top', TopTransition);
registerTransitionType('bottom', BottomTransition);
registerTransitionType('left', LeftTransition);
registerTransitionType('right', RightTransition);
registerTransitionType('horizontal', HorizontalTransition);
registerTransitionType('vertical', VerticalTransition);

type TransitionProps = {
  appear: any,
  shared: string,
  delay: any,
  children: Array<any>
}

class Transition extends React.Component<any> {
  static contextTypes = {
    register: PropTypes.func,
    unregister: PropTypes.func,
    route: PropTypes.string,
    sharedProgress: PropTypes.object,
    hiddenProgress: PropTypes.object,
    getTransitionProgress: PropTypes.func,
    getIsSharedElement: PropTypes.func,
    getIsTransitionElement: PropTypes.func,
    getDirection: PropTypes.func,
    getReverse: PropTypes.func,
    layoutReady: PropTypes.func,
    getMetrics: PropTypes.func,
  }

  constructor(props: TransitionProps, context: any) {
    super(props, context);
    this._name = `${uniqueBaseId}-${uuidCount++}`;
    this._transitionHelper = null;
    this._isInTransition = false;
    this._forceUpdate = false;
    this._startOpacity = this.props.appear ? 0 : 1;
  }

  _name: string
  _route: string
  _isMounted: boolean
  _transitionHelper: BaseTransition
  _viewRef: Object

  _startOpacity: number
  _forceUpdate: boolean
  _isInTransition: boolean

  componentWillMount() {
    const { register } = this.context;
    if (register) {
      this._route = this.context.route;
      register(new TransitionItem(
        this._getName(), this.context.route,
        this, this.props.shared !== undefined, this.props.appear !== undefined,
        this.props.delay !== undefined,
      ));
    }
  }

  componentDidMount() {
    this._isMounted = true;
  }

  shouldComponentUpdate() {
    const retVal = this._forceUpdate;
    this._forceUpdate = false;
    return retVal;
  }

  componentWillUnmount() {
    this._isMounted = false;
    const { unregister } = this.context;
    if (unregister) {
      unregister(this._getName(), this._route);
    }
  }

  getNodeHandle() {
    return findNodeHandle(this._viewRef);
  }

  getTransitionHelper(appear) {
    if (this._transitionHelper === null) {
      if (appear) {
        const transitionType = transitionTypes.find(e => e.name === appear);
        if (transitionType) { this._transitionHelper = new transitionType.TransitionClass(); }
      }
    }
    return this._transitionHelper;
  }

  getTransitionStyle() {
    const {
      getIsSharedElement,
      getMetrics,
      getDirection,
      getReverse,
      getTransitionProgress,
    } = this.context;

    if (!getIsSharedElement || !getMetrics || !getDirection ||
      !getReverse || !getTransitionProgress) { return {}; }

    if (this._isInTransition) {
      const direction = getDirection(this._getName(), this._route);
      const progress = getTransitionProgress(this._getName(), this._route);
      if (progress) {
        this._startOpacity = 1;
        const metrics = getMetrics(this._getName(), this._route);
        const transitionHelper = this.getTransitionHelper(this.props.appear);
        if (transitionHelper) {
          const transitionConfig = {
            progress,
            direction,
            metrics,
            start: direction === 1 ? 0 : 1,
            end: direction === 1 ? 1 : 0,
            reverse: getReverse(this._route),
          };
          return transitionHelper.getTransitionStyle(transitionConfig);
        }
      }
    }
    return { opacity: this._startOpacity };
  }

  getAppearStyle() {
    const { getIsSharedElement, hiddenProgress } = this.context;
    if (!getIsSharedElement || !hiddenProgress) return {};

    if (getIsSharedElement(this._getName(), this._route)) {
      const interpolator = hiddenProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
      });
      return { opacity: interpolator };
    }

    return {};
  }

  async onLayout() {
    const { layoutReady } = this.context;
    if (!layoutReady) return;
    layoutReady(this._getName(), this._route);
  }

  beginTransition() {
    this._isInTransition = true;
    this._forceUpdate = true;
    if (this._isMounted) { this.forceUpdate(); }
  }

  endTransition() {
    this._isInTransition = false;
    this._forceUpdate = true;
    if (this._isMounted) { this.forceUpdate(); }
  }


  _getName() {
    if (this.props.shared) { return this.props.shared; }
    return this._name;
  }

  render() {
    // Get child
    const element = React.Children.only(this.props.children);
    const elementProps = element.props;
    let animatedComp;
    const child = null;

    // Wrap buttons to be able to animate them
    if (element.type.name === 'Button') {
      throw new Error('Buttons need to be wrapped in a View.');
      // element = React.createElement(element.type, {...element.props, collapsable: false});
      // const wrapper = (<View>{element}</View>);
      // elementProps = {};
      // animatedComp = Animated.createAnimatedComponent(wrapper.type);
      // child = element;
    } else {
      // Convert to animated component
      animatedComp = Animated.createAnimatedComponent(element.type);
    }

    // Build styles
    const style = [elementProps.style];
    const appearStyle = this.getAppearStyle();
    const transitionStyle = this.getTransitionStyle();

    const props = {
      ...elementProps,
      onLayout: this.onLayout.bind(this),
      collapsable: false,
      style: [style, transitionStyle, appearStyle, styles.transitionElement],
      ref: (ref) => { this._viewRef = ref; },
    };

    if (child) { return React.createElement(animatedComp, props, child); }

    return React.createElement(animatedComp, props);
  }
}

export default Transition;
