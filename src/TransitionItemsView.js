import React from 'react';
import { View, StyleSheet, UIManager, InteractionManager, Animated, findNodeHandle } from 'react-native';
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
  progress: Animated.Value,
  fromRoute: string,
  toRoute: string,
  index: number
}

export default class TransitionItemsView extends React.Component<
  TransitionItemsViewProps, TransitionItemsViewState>  {
  constructor(props) {
    super(props);
    this._isMounted = false;
    this._viewRef = null;

    this._itemAdded = this._itemAdded.bind(this);

    this.state = {
      toRoute: null,
      fromRoute: null,
      direction: null,
      sharedElements: null,
      transitionElements: null,
    };

    this._transitionItems = new TransitionItems(this._itemAdded);
    this._onLayoutResolvePromise = new Promise(resolve => this._onLayoutResolve = resolve);
    this._transitionProgress = props.progress;
  }

  _viewRef: ?View;
  _transitionItems: TransitionItems;
  _isMounted: boolean;
  _onLayoutResolve: ?Function;
  _onLayoutResolvePromise: Promise<void>;
  _transitionProgress: Animated.Value;

  async _itemAdded(item: TransitionItem) {

    if(!this._isMounted || !this._viewRef) return;

    const sharedElements = this._transitionItems.getSharedElements(
      this.props.fromRoute, this.props.toRoute);

    const transitionElements = this._transitionItems.getTransitionElements(
      this.props.fromRoute, this.props.toRoute);

    if(sharedElements.length === 0 && transitionElements === 0)
      return;

    await this.measureItems(sharedElements, transitionElements);

    this.setState({
      ...this.state,
      sharedElements,
      transitionElements,
    });
  }

  async componentWillReceiveProps(nextProps) {
    if(nextProps.toRoute != this.props.toRoute ||
      nextProps.fromRoute != this.props.fromRoute) {

      await this.updateFromProps(nextProps, this.props);
    }
  }

  async updateFromProps(props, prevProps) {
    if(!this._isMounted) return;
    const indexHasChanged = props.index != (prevProps ? prevProps.index : -1);
    if(!indexHasChanged) return;

    const sharedElements = this._transitionItems.getSharedElements(
      props.fromRoute, props.toRoute);

    const transitionElements = this._transitionItems.getTransitionElements(
      props.fromRoute, props.toRoute);

    if(sharedElements.length === 0 && transitionElements === 0)
      return;

    const direction = props.index > (prevProps ? prevProps.index : -1) ? 1 : -1;

    await this.measureItems(sharedElements, transitionElements);

    this.setState({
      ...this.state,
      toRoute: props.toRoute,
      fromRoute: props.fromRoute,
      direction,
      sharedElements,
      transitionElements,
    });
  }

  render() {
    return (
      <View
        style={styles.container}
        ref={(ref) => this._viewRef = ref}
        onLayout={this.onLayout.bind(this)}>
        {this.props.children}
        <TransitionOverlayView
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

  getDirection(name: string, route: string): number {
    if (!this.state.toRoute) { return 0; }
    return this.state.fromRoute ?
      (this.state.fromRoute === route ? 1 : -1) :
      (this.state.fromRoute === route ? -1 : 1);
  }

  getReverse(name: string, route: string): boolean {
    return route !== this.state.toRoute;
  }  

  async getViewMetrics(): Metrics {
    let viewMetrics: Metrics;
    const nodeHandle = findNodeHandle(this._viewRef);
    if(!nodeHandle) return viewMetrics;

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
    if(!nodeHandle) return;

    return new Promise((resolve, reject) => {
      UIManager.measureInWindow(nodeHandle, (x, y, width, height) => {
        item.metrics = { x: x - viewMetrics.x, y: y - viewMetrics.y, width, height };
        resolve();
      });
    });
  }

  componentDidMount() {
    this._isMounted = true;
    InteractionManager.runAfterInteractions(async ()=> {
      // Wait for layouts
      await this._onLayoutResolvePromise;
      await this.updateFromProps(this.props);
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
  }

  getChildContext() {
    return {
      register: (item) => this._transitionItems.add(item),
      unregister: (name, route) => this._transitionItems.remove(name, route),
      layoutReady: this.layoutReady.bind(this),
      getVisibilityProgress: ()=> this._transitionProgress,
      getTransitionProgress: () => this._transitionProgress,
      getDirection: this.getDirection.bind(this),
      getReverse: this.getReverse.bind(this),
    };
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
