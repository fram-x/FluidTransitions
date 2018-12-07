import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, findNodeHandle } from 'react-native';

import TransitionItem from './TransitionItem';
import * as Constants from './TransitionConstants';
import { createAnimatedWrapper, createAnimated } from './Utils';
import { getCalculatedTransitionStyle } from './Transitions/getTransitionElements';

const _uniqueBaseId: string = 'tcid';
let _uuidCount: number = 0;
let _zIndex = 1;

type TransitionProps = {
  name: string,
  appear: ?boolean,
  disappear: ?boolean,
  shared: ?string,
  delay: ?boolean,
  animated: ?string,
  anchor: ?string,
  innerRef: ?any,
  children: Array<any>,
  zIndex: Number,
  inline: ?boolean,
}

class Transition extends React.Component<TransitionProps> {
  static contextTypes = {
    register: PropTypes.func,
    unregister: PropTypes.func,
    route: PropTypes.string,
    getTransitionProgress: PropTypes.func,
    getDirectionForRoute: PropTypes.func,
    getDirection: PropTypes.func,
    getIndex: PropTypes.func,
    getIsPartOfSharedTransition: PropTypes.func,
    getIsPartOfTransition: PropTypes.func,
    getIsAnchored: PropTypes.func,
    getItemByNameAndRoute: PropTypes.func,
    getRoutes: PropTypes.func,
    getItemDelayInfo: PropTypes.func,
  }

  constructor(props: TransitionProps, context: any) {
    super(props, context);
    this._name = `${_uniqueBaseId}-${_uuidCount++}`;
    this._animatedComponent = null;
  }

  _name: string

  _route: string

  _isMounted: boolean;

  _viewRef: any;

  _animatedComponent: any;

  _outerAnimatedComponent: any;

  shouldComponentUpdate(nextProps) {
    return (this.props !== nextProps);
  }

  componentWillMount() {
    const { route, register } = this.context;
    const { shared, appear, disappear, delay, zIndex, anchor,
      animated, inline = false } = this.props;
    if (register) {
      this._route = route;
      register(new TransitionItem(
        this._getName(),
        route,
        this,
        shared !== undefined,
        appear,
        disappear,
        delay !== undefined,
        zIndex || _zIndex++,
        anchor,
        animated,
        inline,
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

  getViewRef(): any {
    return this._viewRef;
  }

  _getName(): string {
    const { shared, name } = this.props;
    if (shared) { return shared; }
    if (name) { return name; }
    return this._name;
  }

  render() {
    const { children, innerRef } = this.props;

    let element = React.Children.only(children);
    if (!element) { return null; }

    if (!this._animatedComponent) { this._animatedComponent = createAnimated(); }
    if (!this._outerAnimatedComponent) { this._outerAnimatedComponent = createAnimated(); }

    const visibilityStyle = this.getVisibilityStyle();
    const transitionStyle = this.getTransitionStyle();
    const key = `${this._getName()}-${this._route}`;

    element = React.createElement(element.type, {
      ...element.props,
      key,
      ref: this.setViewRef,
    });

    return createAnimatedWrapper({
      component: element,
      nativeStyles: [visibilityStyle, transitionStyle, styles.transition],
      nativeCached: this._outerAnimatedComponent,
      cached: this._animatedComponent,
      innerRef,
      log: true,
      logPrefix: `TV ${this._getName()}/${this._route}`,
    });
  }

  setViewRef = (ref: any) => {
    this._viewRef = ref;
  }

  getTransitionStyle() {
    const { inline = false } = this.props;
    if (!inline) return {};

    const { getTransitionProgress, getIndex, getIsAnchored,
      getIsPartOfSharedTransition, getIsPartOfTransition, getRoutes,
      getItemByNameAndRoute, getDirectionForRoute, getItemDelayInfo } = this.context;
    if (!getTransitionProgress
      || !getIndex
      || !getIsAnchored
      || !getIsPartOfSharedTransition
      || !getIsPartOfTransition
      || !getItemByNameAndRoute
      || !getDirectionForRoute
      || !getItemDelayInfo
      || !getRoutes) return {};

    const progress = getTransitionProgress();
    const index = getIndex();
    if (!progress || index === undefined) return { };

    const isPartOfTransition = getIsPartOfTransition(this._getName(), this._route);
    if (isPartOfTransition) {
      const item = getItemByNameAndRoute(this._getName(), this._route);
      const routeDirection = getDirectionForRoute(this._getName(), this._route);
      const delayInfo = getItemDelayInfo(item.name, item.route);
      const transitionStyle = getCalculatedTransitionStyle(
        item,
        delayInfo.delayCount,
        delayInfo.delayIndex,
        index,
        routeDirection,
        progress,
        getRoutes().length === 1,
      );
      return transitionStyle;
    }
    return {};
  }

  getVisibilityStyle() {
    const { inline = false } = this.props;
    const { getTransitionProgress, getIndex, getIsAnchored,
      getIsPartOfSharedTransition, getIsPartOfTransition,
      getItemByNameAndRoute, getDirectionForRoute } = this.context;
    if (!getTransitionProgress || !getIndex || !getIsAnchored
      || !getIsPartOfSharedTransition || !getIsPartOfTransition
      || !getItemByNameAndRoute || !getDirectionForRoute) return {};

    const progress = getTransitionProgress();
    const index = getIndex();
    if (!progress || index === undefined) return { };

    const inputRange = [index - 1, (index - 1) + Constants.OP, index - Constants.OP, index];
    const outputRange = [1, 0, 0, 1];

    const isPartOfSharedTransition = getIsPartOfSharedTransition(this._getName(), this._route);
    const isPartOfTransition = getIsPartOfTransition(this._getName(), this._route);
    const isAnchored = getIsAnchored(this._getName(), this._route);
    const visibilityProgress = progress.interpolate({ inputRange, outputRange });

    if (isPartOfSharedTransition
      || (isPartOfTransition && !inline)
      || isAnchored) {
      return { opacity: visibilityProgress };
    }
    return {};
  }
}

const styles = StyleSheet.create({
  transition: {
    // backgroundColor: '#0000EF22',
    // borderColor: '#FF0000',
    // borderWidth: 1,
  },
});

export default Transition;
