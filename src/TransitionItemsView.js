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

    this._transitionItems = new TransitionItems();

    this._onLayoutResolvePromise = new Promise(resolve => this._onLayoutResolve = resolve);
  }

  _overlayView: Object;
  _viewRef: any
  _transitionItems: TransitionItems
  _isMounted: boolean
  _onLayoutResolve
  _onLayoutResolvePromise
  
  async onTransitionStart(props: Object, prevProps?: Object, config: Object, animations: Array<any>): boolean | Promise<boolean> {
    await this._onLayoutResolvePromise;

    // Get the rest of the data required to run a transition
    const toRoute = props.scene.route.routeName;
    const fromRoute = prevProps ? prevProps.scene.route.routeName : 'UNKNOWN';
    const direction = props.index > (prevProps ? prevProps.index : -999) ? 1 : -1;
    const sharedElements = this._transitionItems.getSharedElements(fromRoute, toRoute);
    const transitionElements = this._transitionItems.getTransitionElements(fromRoute, toRoute);

    // If we're appearing and there are no appear transition, lets just bail out.
    if (!prevProps && transitionElements.length === 0) {
      return false;
    }
  
    if (sharedElements.length === 0 && transitionElements.length === 0) {
      return false;
    }
  
    return true;
  }

  async onTransitionEnd(props: Object, prevProps?: Object, config: Object) {
    
  }
  
  render() {
    return (
      <View style={styles.container} ref={(ref) => this._viewRef = ref} onLayout={this.onLayout.bind(this)}>
        {this.props.children}
        <TransitionOverlayView ref={(ref) => this._overlayView = ref}/>
      </View>
    );
  }

  onLayout() {
    if(this._onLayoutResolve){
      this._onLayoutResolve();
      this._onLayoutResolve = null;
    }
  }

  async resolveLayouts(
    sharedElements: Map<TransitionItem>,
    transitionElements: Array<TransitionItem>, appear: boolean = false,
  ) {
    if (this._transitionConfig.direction !== -1 || appear) {
      await this.measureItems(sharedElements, transitionElements);
    }
  }

  layoutReady(name: string, route: string) {
    return;
    const sharedElements = this._transitionItems.getSharedElements(this._transitionConfig.fromRoute, this._transitionConfig.toRoute);
    const transitionElements = this._transitionItems.getTransitionElements(this._transitionConfig.fromRoute, this._transitionConfig.toRoute);

    const item = this._transitionItems.getItemByNameAndRoute(name, route);
    if (!item) {
      // a stray element that will be removed - lets just bail out
      return;
    }

    if (sharedElements.length === 0 && transitionElements.length === 0) {
      this._itemsToMeasure.push(item);
      return;
    }

    item.layoutReady = true;
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
  }

  getChildContext() {
    return {
      register: (item) => this._transitionItems.add(item),
      unregister: (name, route) => this._transitionItems.remove(name, route),
      layoutReady: this.layoutReady.bind(this),    
    };
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
