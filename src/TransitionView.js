import React from 'react';
import PropTypes from 'prop-types';
import { View, Animated, StyleSheet, Platform, StyleSheetValidation, findNodeHandle } from 'react-native';

import TransitionItem from './TransitionItem';
import { TransitionContext } from './Types';

const uniqueBaseId: string = `transitionCompId-${Date.now()}`;
let uuidCount: number = 0;

const styles = StyleSheet.create({
  transition: {
    backgroundColor: '#0000FF',    
  }
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
    getVisibilityProgress: PropTypes.func
  }

  constructor(props: TransitionProps, context: TransitionContext) {
    super(props, context);
    this._name = `${uniqueBaseId}-${uuidCount++}`;
    this._animatedComponent = null;
    this._initialOpacity = props.appear ? 0 : 1;
  }

  _name: string
  _route: string
  _isMounted: boolean;
  _viewRef: any;
  _animatedComponent: any;
  _initialOpacity: number;

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
    if(!element)
      return null;

    // Functional components should be wrapped in a view to be usable with
    // Animated.createAnimatedComponent
    const isFunctionalComponent = !element.type.displayName;
    if(isFunctionalComponent || element.type.displayName == 'Button') {
      // Wrap in sourrounding view
      element = React.createElement(element.type, element.props);
      if(!this._animatedComponent) {
        const wrapper = (<View/>);
        this._animatedComponent = Animated.createAnimatedComponent(wrapper.type);
      }
      elementProps = {};
      child = element;
    }
    else if(!this._animatedComponent)
      this._animatedComponent = Animated.createAnimatedComponent(element.type);

    // Visibility
    let visibilityStyle = this.getVisibilityStyle();
    // if(this._initialOpacity === 0){
    //   visibilityStyle = {opacity: 0};
    //   this._initialOpacity = 1;
    // }

    // Build styles
    const style = [elementProps.style, visibilityStyle, {backgroundColor: '#00FF00'}];
    const props = {
      ...elementProps,
      key: this._getName(),
      onLayout: this.onLayout.bind(this),
      collapsable: false,
      style,
      ref: (ref) => { this._viewRef = ref; },
    };

    if(child)
      return React.createElement(this._animatedComponent, props, child);

    return React.createElement(this._animatedComponent, props);
  }

  getVisibilityStyle() {
    const { getVisibilityProgress } = this.context;
    if(!getVisibilityProgress) return {};
    const progress = getVisibilityProgress(this._getName(), this._route);
    return { opacity: progress };
  }
}

export default Transition;
