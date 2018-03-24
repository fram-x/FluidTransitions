import React from 'react';
import PropTypes from 'prop-types';
import { View, Animated, UIManager, StyleSheet, Platform, StyleSheetValidation, findNodeHandle } from 'react-native';

import TransitionItem from './TransitionItem';
import { RouteDirection, TransitionContext, NavigationDirection } from './Types';
import * as Constants from './TransitionConstants';

const uniqueBaseId: string = `transitionCompId-${Date.now()}`;
let uuidCount: number = 0;

const styles = StyleSheet.create({
  transition: {
    // backgroundColor: '#0000EF22',
  },
});

type TransitionProps = {
  appear?: boolean,
  shared?: string,
  delay?: boolean,
  children: Array<any>
}

class Transition extends React.PureComponent<TransitionProps> {
  context: TransitionContext
  static contextTypes = {
    register: PropTypes.func,
    unregister: PropTypes.func,
    route: PropTypes.string,
    getTransitionProgress: PropTypes.func,
    getDirectionForRoute: PropTypes.func,
    getDirection: PropTypes.func,
    getIndex: PropTypes.func,
    getIsPartOfSharedTransition: PropTypes.func
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

    const visibilityStyle = this.getVisibilityStyle();
    const style = [elementProps.style, visibilityStyle, styles.transition];

    const props = {
      ...elementProps,
      key: this._getName(),
      collapsable: false,
      style,      
      ref: (ref) => { this._viewRef = ref; },
    };

    return React.createElement(this._animatedComponent, props, child ? child : props.children);
  }

  getVisibilityStyle() {
    const { getTransitionProgress, getDirectionForRoute, 
      getIndex, getDirection, getIsPartOfSharedTransition } = this.context;
    
    if (!getTransitionProgress || !getDirectionForRoute ||
      !getIndex || !getDirection || !getIsPartOfSharedTransition) return {};

    const progress = getTransitionProgress();
    const index = getIndex();
    const direction = getDirection();
    if(!progress || index === undefined) return { opacity: 0};

    const routeDirection = getDirectionForRoute(this._getName(), this._route);
    if(routeDirection === RouteDirection.unknown) return { opacity: 0 };

    const inputRange = direction === NavigationDirection.forward ? [index-1, index] : [index, index + 1];
    const outputRange = routeDirection === RouteDirection.to ? [0, 1] : [1, 0];
    
    const visibilityProgress = progress.interpolate({ inputRange, outputRange });

    if(this.props.shared && this.props.appear === undefined) {
      if(getIsPartOfSharedTransition(this._getName(), this._route)) {
        return { opacity: visibilityProgress.interpolate({
          inputRange: Constants.ORIGINAL_VIEWS_VISIBILITY_INPUT_RANGE_ANIM_OUT,
          outputRange: Constants.ORIGINAL_VIEWS_VISIBILITY_OUTPUT_RANGE_ANIM_OUT
          })
        };
      }
      return {};
    }
    
    return { opacity: visibilityProgress.interpolate({
      inputRange: Constants.ORIGINAL_VIEWS_VISIBILITY_INPUT_RANGE_ANIM_OUT,
      outputRange: Constants.ORIGINAL_VIEWS_VISIBILITY_OUTPUT_RANGE_ANIM_OUT
      })
    };
  }  
}

export default Transition;
