import React from 'react';
import { View, StyleSheet, Easing, UIManager, Animated, findNodeHandle } from 'react-native';
import PropTypes from 'prop-types';

import { Metrics, TransitionConfiguration } from './Types';
import TransitionItem from './TransitionItem';
import TransitionItems from './TransitionItems';
import TransitionOverlayView from './TransitionOverlayView';
import {
  configureTransitionAnimations,
  configureSharedElementAnimation,
  createVisibilityAnimations,
  createOverlayVisibilityAnimation,
} from './TransitionAnimations';

export default class TransitionItemsView extends React.Component {
  constructor(props) {
    super(props);
    this._isMounted = false;
    this._overlayView = null;
    this._viewRef = null;
    this.state = {
      toRoute: null,
      fromRoute: null,
      direction: null,
      sharedElements: null,
      transitionElements: null,
    };
    this._transitionItems = new TransitionItems();
    this._overlayVisibilityProgress = new Animated.Value(0);
    this._onLayoutResolvePromise = new Promise(resolve => this._onLayoutResolve = resolve);
  }

  _overlayView: Object;
  _viewRef: any;
  _transitionItems: TransitionItems;
  _isMounted: boolean;
  _onLayoutResolve: Function;
  _onLayoutResolvePromise: Promise<void>;
  _overlayVisibilityProgress: Animated.Value;

  async onTransitionStart(props: Object, prevProps?: Object, config: Object,
    animations: Array<any>): Promise<void> {

    // Wait for layouts - this is only necessary when running appear animations, but
    // we'll keep the promise around so that we can wait without any further checking
    await this._onLayoutResolvePromise;

    // Get the rest of the data required to run a transition
    const toRoute = props.scene.route.routeName;
    const fromRoute = prevProps ? prevProps.scene.route.routeName : 'UNKNOWN';
    const direction = props.index > (prevProps ? prevProps.index : -999) ? 1 : -1;
    const sharedElements = this._transitionItems.getSharedElements(fromRoute, toRoute);
    const transitionElements = this._transitionItems.getTransitionElements(fromRoute, toRoute);

    // If we're appearing and there are no appear transition, lets just bail out.
    if ((!prevProps && transitionElements.length === 0) ||
      (sharedElements.length === 0 && transitionElements.length === 0)) {
      return;
    }

    // Now we can loop through elements that should transition or be part of
    // a shared element transition and measure them
    await this.measureItems(sharedElements, transitionElements);

    // Configure individual animations for transitions
    this.configureAnimations(sharedElements, transitionElements,
      animations, props.progress, direction, config);

    // Save info about the current transition
    this.setState({
      ...this.state,
      toRoute,
      fromRoute,
      direction,
      sharedElements,
      transitionElements,
    });

    // We should now be ready to swap out visibility for elements in
    // transition
    await this.runTransitionStartAnimations();
  }

  async onTransitionEnd(props: Object, prevProps?: Object, config: Object) {

    if(this.state.transitionElements === null ||
    this.state.sharedElements === null)
      return;

    // Run animation on visibility for transition items
    await this.runTransitionDoneAnimations();

    // Clear item progress
    this.state.transitionElements.forEach(item => item.progress = null);
    this.state.sharedElements.forEach(pair => {
      pair.fromItem.progress = null;
      pair.toItem.progress = null;
    });

    this.setState({
      ...this.state,
      toRoute: null,
      fromRoute: null,
      direction: null,
      sharedElements: null,
      transitionElements: null,
    });
  }

  async runTransitionDoneAnimations() {
    await this.runVisibilityAnimation(1);
    await this.runOverlayVisibilityAnimation(0);
  }

  async runTransitionStartAnimations() {
    await this.runOverlayVisibilityAnimation(1);
    await this.runVisibilityAnimation(0);
  }

  runVisibilityAnimation(toValue: number): Promise<void> {
    const animations = createVisibilityAnimations(
      toValue, this.state.sharedElements, this.state.transitionElements);

    if(animations.length === 0)
      return;

    const promise = new Promise(resolve =>
      Animated.parallel(animations).start(resolve));

    return promise;
  }

  runOverlayVisibilityAnimation(toValue: number): Promise<void> {
    const promise = new Promise(resolve =>
      createOverlayVisibilityAnimation(toValue, this._overlayVisibilityProgress)
      .start(resolve));

    return promise;
  }

  configureAnimations(sharedElements: Array<any>, transitionElements: Array<TransitionItem>,
    animations: Array, progress: Animated.Value, direction: number, config: any) {

    const transitionAnimations = configureTransitionAnimations(transitionElements, direction, config);
    transitionAnimations.forEach(animation => animations.push(animation));
    animations.push(configureSharedElementAnimation(sharedElements, progress, config));
  }

  render() {
    return (
      <View
        style={styles.container}
        ref={(ref) => this._viewRef = ref}
        onLayout={this.onLayout.bind(this)}>
        {this.props.children}
        <TransitionOverlayView
          ref={(ref) => this._overlayView = ref}
          transitionElements={this.state.transitionElements}
          sharedElements={this.state.sharedElements}
          visibility={this._overlayVisibilityProgress}
          direction={this.state.direction}
        />
      </View>
    );
  }

  onLayout() {
    if(this._onLayoutResolve){
      this._onLayoutResolve();
      this._onLayoutResolve = null;
    }
  }

  layoutReady(name: string, route: string) {
    const item = this._transitionItems.getItemByNameAndRoute(name, route);
    if (!item) {
      // a stray element that will be removed - lets just bail out
      return;
    }
  }

  getVisibilityProgress(name: string, route: string): Animated.Value {
    const item = this._transitionItems.getItemByNameAndRoute(name, route);
    if (!item) return null;
    return item.visibility;
  }

  getTransitionProgress(name: string, route: string): Animated.Value {
    const item = this._transitionItems.getItemByNameAndRoute(name, route);
    if (!item) return null;
    return item.progress;
  }

  getMetrics(name: string, route: string): Metrics {
    const item = this._transitionItems.getItemByNameAndRoute(name, route);
    return item.metrics;
  }

  getDirection(name: string, route: string): number {
    if (!this.state.direction) { return 0; }
    return this.state.direction;
  }

  getReverse(name: string, route: string): boolean {
    return route !== this.state.toRoute;
  }

  async measureItems(
    sharedElements: Map<TransitionItem, TransitionItem>,
    transitionElements: Array<TransitionItem>,
  ) {
    let viewMetrics = {};
    const nodeHandle = findNodeHandle(this._viewRef);

    const promise = new Promise(resolve => {
      UIManager.measureInWindow(nodeHandle, (x, y, width, height) => {
        viewMetrics = { x, y, width, height };
        resolve();
      });
    });

    await promise;

    if (sharedElements) {
      for (let i = 0; i < sharedElements.length; i++) {
        const pair = sharedElements[i];
        await this.measureItem(viewMetrics, pair.fromItem, nodeHandle);
        await this.measureItem(viewMetrics, pair.toItem, nodeHandle);
      }
    }

    if (transitionElements) {
      for (let i = 0; i < transitionElements.length; i++) {
        await this.measureItem(viewMetrics, transitionElements[i], nodeHandle);
      }
    }
  }

  async measureItem(viewMetrics: Metrics, item: TransitionItem, parentNodeHandle: number) {
    if (item.metrics) { return; }

    const self = this;
    const nodeHandle = item.reactElement.getNodeHandle();
    return new Promise((resolve, reject) => {
      UIManager.measureInWindow(nodeHandle, (x, y, width, height) => {
        item.metrics = { x: x - viewMetrics.x, y: y - viewMetrics.y, width, height };
        resolve();
      });
    });
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  static childContextTypes = {
    register: PropTypes.func,
    unregister: PropTypes.func,
    layoutReady: PropTypes.func,
    getVisibilityProgress: PropTypes.func,
    getTransitionProgress: PropTypes.func,
    getDirection: PropTypes.func,
    getReverse: PropTypes.func,
    getMetrics: PropTypes.func
  }

  getChildContext() {
    return {
      register: (item) => this._transitionItems.add(item),
      unregister: (name, route) => this._transitionItems.remove(name, route),
      layoutReady: this.layoutReady.bind(this),
      getVisibilityProgress: this.getVisibilityProgress.bind(this),
      getTransitionProgress: this.getTransitionProgress.bind(this),
      getDirection: this.getDirection.bind(this),
      getReverse: this.getReverse.bind(this),
      getMetrics: this.getMetrics.bind(this)
    };
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
