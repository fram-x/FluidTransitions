import React from 'react';
import { View, StyleSheet, UIManager, InteractionManager, Animated, findNodeHandle } from 'react-native';
import PropTypes from 'prop-types';

import { Metrics, NavigationDirection, RouteDirection } from './Types';
import TransitionItem from './TransitionItem';
import TransitionItems from './TransitionItems';
import TransitionOverlayView from './TransitionOverlayView';
import { invariant } from './Utils/invariant';

type TransitionItemsViewState = {
  fromRoute: ?string,
  toRoute: ?string,
  direction: NavigationDirection,
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

    this.state = {
      toRoute: null,
      fromRoute: null,
      direction: NavigationDirection.Unknown,
      sharedElements: null,
      transitionElements: null,
    };

    this._transitionItems = new TransitionItems();
    this._onLayoutResolvePromise = new Promise(resolve => this._onLayoutResolve = resolve);
    this._transitionProgress = props.progress;
  }

  _viewRef: ?View;
  _transitionItems: TransitionItems;
  _isMounted: boolean;
  _onLayoutResolve: ?Function;
  _onLayoutResolvePromise: Promise<void>;
  _transitionProgress: Animated.Value;

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

    let { fromRoute, toRoute } = props;
    const direction = props.index > (prevProps ? prevProps.index : -1) ?
      NavigationDirection.forward : NavigationDirection.back;
      
    if(direction === NavigationDirection.back){
      const tmp = fromRoute;
      fromRoute = toRoute;
      toRoute = tmp;
    }

    const sharedElements = this._transitionItems.getSharedElements(fromRoute, toRoute);
    const transitionElements = this._transitionItems.getTransitionElements(fromRoute, toRoute);
    if(sharedElements.length === 0 && transitionElements === 0)
      return;

    await this.measureItems(sharedElements, transitionElements);

    // console.log("=======");
    // console.log("from:   " + props.fromRoute);
    // console.log("to:     " + props.toRoute);
    // console.log("index:  " + props.index);
    // console.log("navdir: " + (direction === NavigationDirection.forward ? "forward" : 
    //   (direction === NavigationDirection.back ? "back" : "none")));
    // console.log("SE:     " + sharedElements.length);
    // console.log("TE:     " + transitionElements.length);
    // console.log("=======");

    this.setState({
      ...this.state,
      toRoute: toRoute,
      fromRoute: fromRoute,
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

  getDirectionForRoute(name: string, route: string): RouteDirection {
    if(!this.state.fromRoute && !this.state.toRoute) { return RouteDirection.unknown; }
    if (!this.state.fromRoute) { return RouteDirection.from; } // First screne, always direction from/to???
    if(route === this.state.fromRoute)
      return RouteDirection.from;
    else if(route === this.state.toRoute)
      return RouteDirection.to;

    //invariant(true, "Route " + route + " is not part of transition!")
    return RouteDirection.unknown;
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
    getVisibilityProgress: PropTypes.func,
    getTransitionProgress: PropTypes.func,
    getDirectionForRoute: PropTypes.func,
    getDirection: PropTypes.func,    
  }

  getChildContext() {
    return {
      register: (item) => this._transitionItems.add(item),
      unregister: (name, route) => this._transitionItems.remove(name, route),
      getVisibilityProgress: ()=> this._transitionProgress,
      getTransitionProgress: () => this._transitionProgress,
      getDirectionForRoute: this.getDirectionForRoute.bind(this),
      getDirection: () => this.state.direction ? this.state.direction : NavigationDirection.unknown,      
    };
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
