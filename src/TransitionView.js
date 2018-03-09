import React from 'react';
import PropTypes from 'prop-types';
import { View, Animated, StyleSheet, Platform, StyleSheetValidation, findNodeHandle } from 'react-native';

import TransitionItem from './TransitionItem';
import { TransitionContext } from './Types';
import * as Constants from './TransitionConstants';

const uniqueBaseId: string = `transitionCompId-${Date.now()}`;
let uuidCount: number = 0;

const styles = StyleSheet.create({
  transition: {    
    // backgroundColor: '#FF000022'
  },
});

type TransitionProps = {
  appear?: boolean,
  shared?: string,
  delay?: boolean,
  children: Array<any>
}

class Transition extends React.Component<TransitionProps> {
  context: TransitionContext
  static contextTypes = {
    register: PropTypes.func,
    unregister: PropTypes.func,
    layoutReady: PropTypes.func,
    route: PropTypes.string,
    getVisibilityProgress: PropTypes.func,
    getDirection: PropTypes.func
  }

  constructor(props: TransitionProps, context: TransitionContext) {
    super(props, context);
    this._name = `${uniqueBaseId}-${uuidCount++}`;
    this._animatedComponent = null;    
  }

  _name: string
  _route: string
  _isMounted: boolean;
  _viewRef: any;
  _animatedComponent: any;
  
  componentWillMount() {
    const { register } = this.context;
    if (register) {
      this._route = this.context.route;
      register(new TransitionItem(
        this._getName(), this.context.route,
        this, this.props.shared !== undefined, this.props.appear,
        this.props.delay !== undefined,
      ));
    }
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
    const { unregister } = this.context;
    if (unregister) {
      unregister(this._getName(), this._route);
    }
  }

  getNodeHandle(): number {
    return findNodeHandle(this._viewRef);
  }

  onLayout() {
    const { layoutReady } = this.context;
    if (!layoutReady) return;
    layoutReady(this._getName(), this._route);
  }

  _getName(): string {
    if (this.props.shared) { return this.props.shared; }
    return this._name;
  }

  render() {
    // Get child
    let element = React.Children.only(this.props.children);
    let elementProps = element.props;
    let child = null;
    if (!element) { return null; }

    // Functional components should be wrapped in a view to be usable with
    // Animated.createAnimatedComponent    
    if (element.type.displayName !== 'View' && element.type.displayName !== 'Image') {
      // Wrap in sourrounding view
      element = React.createElement(element.type, element.props);
      if (!this._animatedComponent) {
        const wrapper = (<View />);
        this._animatedComponent = Animated.createAnimatedComponent(wrapper.type);
      }
      elementProps = {};
      child = element;
    } else if (!this._animatedComponent) {
      this._animatedComponent = Animated.createAnimatedComponent(element.type);
    }

    // Visibility
    const visibilityStyle = this.getVisibilityStyle();

    // Build styles
    const style = [elementProps.style, visibilityStyle, styles.transition];
    const props = {
      ...elementProps,
      key: this._getName(),
      onLayout: this.onLayout.bind(this),
      collapsable: false,
      style,
      ref: (ref) => { this._viewRef = ref; },
    };

    return React.createElement(this._animatedComponent, props, child ? child : props.children);
  }

  getVisibilityStyle() {
    const { getVisibilityProgress, getDirection } = this.context;
    if (!getVisibilityProgress || !getDirection) return {};
    const visibilityProgress = getVisibilityProgress(this._getName(), this._route);
    const myDirection = getDirection(this._getName(), this._route);
    if(myDirection === 1)
      return { opacity: visibilityProgress.interpolate({
          inputRange:[0, 0.0001, 0.009, 1],
          outputRange: [1, 1, 0, 0]
        }) 
      };
    return { opacity: visibilityProgress.interpolate({
        inputRange: Constants.ORIGINAL_VIEWS_VISIBILITY_INPUT_RANGE,
        outputRange: Constants.ORIGINAL_VIEWS_VISIBILITY_OUTPUT_RANGE
      }) 
    };
  }
}

export default Transition;
