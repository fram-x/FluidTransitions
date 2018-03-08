import React from 'react';
import { View, StyleSheet, Easing, UIManager, Platform, Animated, findNodeHandle } from 'react-native';
import PropTypes from 'prop-types';

import { Metrics, TransitionConfiguration } from './Types';
import TransitionItem from './TransitionItem';
import TransitionItems from './TransitionItems';
import TransitionOverlayView from './TransitionOverlayView';

type TransitionItemsViewState = {
  fromRoute: ?string,
  toRoute: ?string,
  direction: ?number,
  sharedElements: ?Array<any>,
  transitionElements: ?Array<TransitionItem>
}

type TransitionItemsViewProps = {
  children: Array<any>,
  progress: number | Animated.Value,
}

export default class TransitionItemsView extends React.Component<
  TransitionItemsViewProps, TransitionItemsViewState>  {
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
    this._onLayoutResolvePromise = new Promise(resolve => this._onLayoutResolve = resolve);

    if (props.progress instanceof Animated.Value)
      this._transitionProgress = props.progress;
  }

  _overlayView: ?TransitionOverlayView;
  _viewRef: ?View;
  _transitionItems: TransitionItems;
  _isMounted: boolean;
  _onLayoutResolve: ?Function;
  _onLayoutResolvePromise: Promise<void>;
  _transitionProgress: Animated.Value;

  componentWillReceiveProps(nextProps) {
    if(this._transitionProgress != nextProps.progress)
      this._transitionProgress.setValue(nextProps.progress * 0.01);
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

  async layoutReady(name: string, route: string) {
    const item = this._transitionItems.getItemByNameAndRoute(name, route);
    if (!item || !item.metrics) {
      // a stray element that will be removed - lets just bail out
      return;
    }
    const viewMetrics = await this.getViewMetrics();
    await this.measureItem(viewMetrics, item)
  }

  getMetrics(name: string, route: string): Metrics {
    const item = this._transitionItems.getItemByNameAndRoute(name, route);
    return item.metrics;
  }

  getDirection(name: string, route: string): number {
    if (!this.state.fromRoute) { return 0; }
    return this.state.fromRoute === route ? 1 : -1;
  }

  getReverse(name: string, route: string): boolean {
    return route !== this.state.toRoute;
  }

  async getViewMetrics(): Promise<void> {    
    let viewMetrics = {};
    const nodeHandle = findNodeHandle(this._viewRef);

    const promise = new Promise(resolve => {
      UIManager.measureInWindow(nodeHandle, (x, y, width, height) => {
        viewMetrics = { x, y, width, height };
        resolve();
      });
    });
    await promise;
    return viewMetrics;
  }

  async measureItems(
    sharedElements: Map<TransitionItem, TransitionItem>,
    transitionElements: Array<TransitionItem>,
  ) {
    const viewMetrics = await this.getViewMetrics();    
    if (sharedElements) {
      for (let i = 0; i < sharedElements.length; i++) {
        const pair = sharedElements[i];
        await this.measureItem(viewMetrics, pair.fromItem);
        await this.measureItem(viewMetrics, pair.toItem);
      }
    }

    if (transitionElements) {
      for (let i = 0; i < transitionElements.length; i++) {
        await this.measureItem(viewMetrics, transitionElements[i]);
      }
    }
  }

  async measureItem(viewMetrics: Metrics, item: TransitionItem) {
    if (item.metrics) { return; }

    const self = this;
    const nodeHandle = item.getNodeHandle();
    return new Promise((resolve, reject) => {
      UIManager.measureInWindow(nodeHandle, (x, y, width, height) => {
        item.metrics = { x: x - viewMetrics.x, y: y - viewMetrics.y, width, height };
        resolve();
      });
    });
  }

  async componentDidMount() {
    this._isMounted = true;

    // Wait for layouts
    await this._onLayoutResolvePromise;

    // Get routes
    const routes = this._transitionItems.getRoutes();
    const sharedElements = this._transitionItems.getSharedElements(routes.fromRoute, routes.toRoute);
    const transitionElements = this._transitionItems.getTransitionElements(routes.fromRoute, routes.toRoute);

    if(sharedElements.length === 0 && transitionElements === 0)
      return;

    const direction = 1;

    await this.measureItems(sharedElements, transitionElements);

    this.setState({
      ...this.state,
      toRoute: routes.toRoute,
      fromRoute: routes.fromRoute,
      direction,
      progress: this._transitionProgress,
      sharedElements,
      transitionElements,
    });
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
      getVisibilityProgress: () => this._transitionProgress,
      getTransitionProgress: () => this._transitionProgress,
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
