import React from 'react';
import { View, StyleSheet, Easing, UIManager, Animated, findNodeHandle } from 'react-native';
import PropTypes from 'prop-types';

import { Metrics, TransitionConfiguration } from './Types';
import TransitionItem from './TransitionItem';
import TransitionItems from './TransitionItems';
import TransitionOverlayView from './TransitionOverlayView';

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
    this._fadeTransitionTime = 100;
    this._transitionItems = new TransitionItems();
    this._overlayVisibilityProgress = new Animated.Value(0);
    this._onLayoutResolvePromise = new Promise(resolve => this._onLayoutResolve = resolve);
  }

  _overlayView: Object;
  _viewRef: any
  _transitionItems: TransitionItems
  _isMounted: boolean
  _onLayoutResolve: Function
  _onLayoutResolvePromise: Promise<void>
  _overlayVisibilityProgress: Animated.Value
  _fadeTransitionTime: number

  async onTransitionStart(props: Object, prevProps?: Object, config: Object, animations: Array<any>): boolean | Promise<boolean> {
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
      return false;
    }

    // Now we can loop through elements that should transition or be part of
    // a shared element transition and measure them
    await this.measureItems(sharedElements, transitionElements);

    // Configure individual animations for transitions
    const currentAnimations = this.configureAnimations(sharedElements, transitionElements, config);
    currentAnimations.forEach(animation => animations.push(animation));

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
    await this.runOverlayVisibilityAnimation(1);
    await this.runVisibilityAnimation(0);

    return true;
  }

  async onTransitionEnd(props: Object, prevProps?: Object, config: Object) {

    // Run animation on visibility for transition items
    await this.runVisibilityAnimation(1);
    await this.runOverlayVisibilityAnimation(0);

    this.setState({
      ...this.state,
      toRoute: null,
      fromRoute: null,
      direction: null,
      sharedElements: null,
      transitionElements: null,
    });
  }

  runVisibilityAnimation(toValue: number): Promise<void> {
    // Get all elements part of a transition or a shared element transition
    const transitionElements = [];
    if(this.state.sharedElements){
      this.state.sharedElements.forEach(pair => {
        transitionElements.push(pair.fromItem);
        transitionElements.push(pair.toItem);
      });
    }

    if(this.state.transitionElements){
      this.state.transitionElements.forEach(item => transitionElements.push(item));
    }

    if(transitionElements.length === 0)
      return;

    // Hide/show by changing the progress value
    const animations = [];
    transitionElements.forEach(item => {
      animations.push(Animated.timing(item.visibility, {
        toValue,
        duration: this._fadeTransitionTime,
        easing: Easing.linear,
        useNativeDriver: true,
      }));
    });

    const promise = new Promise(resolve =>
      Animated.parallel(animations).start(resolve));

    return promise;
  }

  runOverlayVisibilityAnimation(toValue: number): Promise<void> {
    const promise = new Promise(resolve =>
      Animated.timing(this._overlayVisibilityProgress, {
        toValue,
        duration: this._fadeTransitionTime,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(resolve));

    return promise;
  }

  configureAnimations(sharedElements: Array<any>,
    transitionElements: Array<TransitionItem>,
    config: Object,
  ) {

    // Create animations
    const animations = [];
    let index = 0;
    transitionElements.forEach(item =>
      animations.push(this.configureAnimation(item, null, config))
    );
    sharedElements.forEach(pair => {
      const animationDescriptor = this.configureAnimation(pair.fromItem, null, config);
      animations.push(animationDescriptor);
      animations.push(this.configureAnimation(pair.toItem, animationDescriptor.progress, config));
    });

    return animations;
  }

  configureAnimation(item: TransitionItem, progress: null, config: any) {
    const transitionConfig = { ...config };
    const { timing } = transitionConfig;
    delete transitionConfig.timing;

    item.progress = progress ? progress : new Animated.Value(0);
    const isReverse = this.getReverse(item.name, item.route);
    const delay = isReverse ? 0 : (item.delay ? index++ * this._delayTransitionTime : 0);
    const animation = timing(item.progress, {
      ...transitionConfig,
      toValue: 1.0,
      delay
    });
    return this.createAnimationDescriptor(animation, item.name, item.route, delay, item.progress);
  }

  createAnimationDescriptor(animation: any, name: string, route: string, delay: number){
    return {
      animation, name, route, delay
    }
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
    item.layoutReady = true;
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
    getTransitionProgress: PropTypes.func
  }

  getChildContext() {
    return {
      register: (item) => this._transitionItems.add(item),
      unregister: (name, route) => this._transitionItems.remove(name, route),
      layoutReady: this.layoutReady.bind(this),
      getVisibilityProgress: this.getVisibilityProgress.bind(this),
      getTransitionProgress: this.getTransitionProgress.bind(this)
    };
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
