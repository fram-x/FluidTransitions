import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, findNodeHandle } from 'react-native';

import TransitionItem from './TransitionItem';
import * as Constants from './TransitionConstants';
import { createAnimatedWrapper, createAnimated } from './Utils';

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
  flat: ?boolean,
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
    isOverlayChild: PropTypes.bool,
    getParentTransition: PropTypes.func,
  }

  static childContextTypes = {
    getParentTransition: PropTypes.func,
  }

  getChildContext() {
    return {
      getParentTransition: () => this,
    };
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

  _index: number;

  _isPartOfSharedTransition: boolean;

  _isPartOfTransition: boolean;

  _isAnchored: boolean;

  shouldComponentUpdate(nextProps) {
    const { name, appear, disappear, shared, delay, animated, anchor,
      zIndex, flat, parent } = this.props;

    if (name !== nextProps.name
      || appear !== nextProps.appear
      || disappear !== nextProps.disappear
      || shared !== nextProps.shared
      || delay !== nextProps.delay
      || animated !== nextProps.animated
      || anchor !== nextProps.anchor
      || zIndex !== nextProps.zIndex
      || flat !== nextProps.flat
      || parent !== nextProps.parent) return true;

    const { getIndex, getIsAnchored, getIsPartOfSharedTransition,
      getIsPartOfTransition } = this.context;

    if (!getIndex || !getIsAnchored || !getIsPartOfSharedTransition
      || !getIsPartOfTransition) {
      return true;
    }

    const index = getIndex();
    const isPartOfSharedTransition = getIsPartOfSharedTransition(this._getName(), this._route);
    const isPartOfTransition = getIsPartOfTransition(this._getName(), this._route);
    const isAnchored = getIsAnchored(this._getName(), this._route);

    if (index !== this._index
      || isPartOfSharedTransition !== this._isPartOfSharedTransition
      || isPartOfTransition !== this._isPartOfTransition
      || isAnchored !== this._isAnchored) return true;

    return false;
  }

  componentWillMount() {
    const { route, register, isOverlayChild, getParentTransition } = this.context;
    const { shared, appear, flat, disappear, delay, zIndex, anchor, animated } = this.props;
    if (register) {
      this._route = route;
      if (!isOverlayChild) {
        this._route = route;
        register(new TransitionItem(
          this._getName(), route, this, shared !== undefined, appear,
          disappear, delay !== undefined, zIndex || _zIndex++, anchor, animated,
          flat, (getParentTransition ? getParentTransition() : null),
        ));
      }
    }
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
    const { unregister, isOverlayChild } = this.context;
    if (unregister && !isOverlayChild) {
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
    const key = `${this._getName()}-${this._route}`;

    element = React.createElement(element.type, { ...element.props, key, ref: this.setViewRef });
    return createAnimatedWrapper({
      component: element,
      nativeStyles: [visibilityStyle, styles.transition],
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

  getVisibilityStyle() {
    const { getTransitionProgress, getIndex, getIsAnchored,
      getIsPartOfSharedTransition, getIsPartOfTransition,
      isOverlayChild } = this.context;

    if (!getTransitionProgress || !getIndex || !getIsAnchored
      || !getIsPartOfSharedTransition || !getIsPartOfTransition) return {};

    const progress = getTransitionProgress();
    this._index = getIndex();
    if (!progress || this._index === undefined) return { };

    this._isPartOfSharedTransition = getIsPartOfSharedTransition(this._getName(), this._route);
    this._isPartOfTransition = getIsPartOfTransition(this._getName(), this._route);
    this._isAnchored = getIsAnchored(this._getName(), this._route);
    const shouldHideElement = this._isPartOfSharedTransition
      || this._isPartOfTransition || this._isAnchored;

    const { shared } = this.props;
    if ((isOverlayChild && !shared)
      || (isOverlayChild && shouldHideElement)
      || shouldHideElement) {
      const inputRange = [this._index - 1, (this._index - 1) + Constants.OP,
        this._index - Constants.OP, this._index];
      const outputRange = [1, 0, 0, 1];

      return { opacity: progress.interpolate({ inputRange, outputRange }) };
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
