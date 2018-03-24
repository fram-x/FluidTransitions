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
  index: number,
  sharedElements: ?Array<any>,
  transitionElements: ?Array<TransitionItem>
}

type TransitionItemsViewProps = {
  children: Array<any>,
  progress: Animated.Value,
  fromRoute: string,
  toRoute: string,
  index: ?number,
  onLayout: (evt: any) => void,
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
    this._transitionProgress = props.progress;

    this._getIsPartOfSharedTransition = this._getIsPartOfSharedTransition.bind(this);
  }

  _viewRef: ?View;
  _viewMetrics: Metrics;
  _transitionItems: TransitionItems;
  _isMounted: boolean;
  _transitionProgress: Animated.Value;

  componentWillReceiveProps(nextProps) {
    if(nextProps.toRoute != this.props.toRoute ||
      nextProps.fromRoute != this.props.fromRoute) {
      this.updateFromProps(nextProps, this.props);
    }
  }

  updateFromProps(props, prevProps) {
    if(!this._isMounted) return;
    const indexHasChanged = props.index != (prevProps ? prevProps.index : -1);
    if(!indexHasChanged) return;

    let { fromRoute, toRoute } = props;
    const direction = props.index > (prevProps ? prevProps.index : -1) ?
      NavigationDirection.forward : NavigationDirection.back;

    const index = prevProps ? props.index : 1;

    if(direction === NavigationDirection.back){
      const tmp = fromRoute;
      fromRoute = toRoute;
      toRoute = tmp;
    }

    this.setState({
      ...this.state,
      toRoute: toRoute,
      fromRoute: fromRoute,
      direction,
      index
    });
  }

  render() {
    return (
      <View
        style={styles.container}        
      >
        {this.props.children}
        <TransitionOverlayView
          ref={(ref) => this._viewRef = ref}
          direction={this.state.direction}
          fromRoute={this.state.fromRoute}
          toRoute={this.state.toRoute}
          index={this.state.index}
          sharedElements={this.state.sharedElements}
          transitionElements={this.state.transitionElements}
        />
      </View>
    );
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

  _getIsPartOfSharedTransition(name: string, route: string) {
    const item = this._transitionItems.getItemByNameAndRoute(name, route);
    if(!item || !item.shared) return false;

    const sharedElements = this._transitionItems.getSharedElements(this.state.toRoute, this.state.toRoute);    
    if(sharedElements.find(pair => 
      (pair.fromItem.name === item.name && pair.fromItem.route === item.route) ||
      (pair.toItem.name === item.name && pair.toItem.route === item.route))) {
        return true;
    }
    return false;
  }

  async getViewMetrics(): Metrics {
    const nodeHandle = findNodeHandle(this._viewRef);
    let viewMetrics: Metrics;
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

  _inUpdate: boolean = false;
  async componentDidUpdate(){
    if(this._inUpdate) return;

    this._inUpdate = true;
    const sharedElements = this._transitionItems.getSharedElements(this.state.fromRoute, this.state.toRoute);
    const transitionElements = this._transitionItems.getTransitionElements(this.state.fromRoute, this.state.toRoute);
    await this.measureItems(sharedElements, transitionElements);
    if(!sharedElements.find(p => !p.fromItem.metrics || !p.toItem.metrics) &&
      !transitionElements.find(i => !i.metrics)) {
      this.setState({
        ...this.state,
        sharedElements,
        transitionElements,
      });
      this.props.onLayout && this.props.onLayout();
    }
    this._inUpdate = false;
  }

  componentDidMount() {
    this._isMounted = true;
    InteractionManager.runAfterInteractions(async ()=> {
      this.updateFromProps(this.props);
    });
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  static childContextTypes = {
    register: PropTypes.func,
    unregister: PropTypes.func,
    getTransitionProgress: PropTypes.func,
    getDirectionForRoute: PropTypes.func,
    getDirection: PropTypes.func,
    getIndex: PropTypes.func,
    getIsPartOfSharedTransition: PropTypes.func
  }

  getChildContext() {
    return {
      register: (item) => this._transitionItems.add(item),
      unregister: (name, route) => this._transitionItems.remove(name, route),
      getTransitionProgress: () => this._transitionProgress,
      getDirectionForRoute: this.getDirectionForRoute.bind(this),
      getIndex: ()=> this.state.index,
      getDirection: () => this.state.direction ? this.state.direction : NavigationDirection.unknown,
      getIsPartOfSharedTransition: this._getIsPartOfSharedTransition
    };
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
