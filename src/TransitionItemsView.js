import React from 'react';
import {
  View,
  StyleSheet,
  UIManager,
  Easing,
  InteractionManager,
  Animated,
  findNodeHandle,
} from 'react-native';
import PropTypes from 'prop-types';

import { Metrics, NavigationDirection, RouteDirection } from './Types';
import TransitionItem from './TransitionItem';
import TransitionItems from './TransitionItems';
import TransitionOverlayView from './TransitionOverlayView';

type State = {
  fromRoute: ?string,
  toRoute: ?string,
  direction: NavigationDirection,
  index: number,
  sharedElements: ?Array<any>,
  transitionElements: ?Array<TransitionItem>
}

type Props = {
  children: Array<any>,
  progress: Animated.Value,
  fromRoute: string,
  toRoute: string,
  index: ?number,
  navigation: any,
  onLayout: (evt: any) => void,
}

export default class TransitionItemsView extends React.Component<
  Props, State> {
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
      index: -1,
    };

    this._transitionItems = new TransitionItems();
    this._transitionProgress = props.progress;
    props.progress.setValue(-1);
    // props.progress.addListener(console.log);

    this.getIsPartOfSharedTransition = this.getIsPartOfSharedTransition.bind(this);
    this.getTransitionProgress = this.getTransitionProgress.bind(this);
    this.getRoutes = this.getRoutes.bind(this);
    this._interactionDonePromise = new Promise(resolve => this._interactionDonePromiseDone = resolve);
  }

  _viewRef: ?View;
  _viewMetrics: Metrics;
  _transitionItems: TransitionItems;
  _isMounted: boolean;
  _transitionProgress: Animated.Value;
  _nonNativeTransitionProgress: Animated.Value;
  _interactionDonePromise: Promise;
  _interactionDonePromiseDone: Function;

  componentWillReceiveProps(nextProps) {
    if (nextProps.toRoute !== this.props.toRoute ||
      nextProps.fromRoute !== this.props.fromRoute) {
      this.updateFromProps(nextProps, this.props);
    }
  }

  updateFromProps(props, prevProps) {
    if (!this._isMounted) return;

    let { fromRoute, toRoute } = props;
    const direction = props.index > (prevProps ? prevProps.index : Number.MIN_SAFE_INTEGER) ?
      NavigationDirection.forward : NavigationDirection.back;

    const index = prevProps ? props.index : 0;

    if (direction === NavigationDirection.back) {
      const tmp = fromRoute;
      fromRoute = toRoute;
      toRoute = tmp;
    }

    this.setState({ ...this.state, toRoute, fromRoute, direction, index });
  }

  render() {
    return (
      <View 
        style={styles.container} 
        ref={(ref) => this._viewRef = ref}
        collapsable={false} 
      >
        {this.props.children}
        <TransitionOverlayView                  
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
    if (!this.state.fromRoute && !this.state.toRoute) { return RouteDirection.unknown; }
    if (!this.state.fromRoute) { return RouteDirection.to; } // First screne, always direction to
    if (route === this.state.fromRoute) {
      return RouteDirection.from;
    } else if (route === this.state.toRoute) {
      return RouteDirection.to;
    }

    // invariant(true, "Route " + route + " is not part of transition!")
    return RouteDirection.unknown;
  }

  getTransitionProgress = (useNative = true) => {
    if(useNative) return this._transitionProgress;
    
    if(!this._nonNativeTransitionProgress) {
      this._nonNativeTransitionProgress = new Animated.Value(-1);
      this._nonNativeTransitionProgress.dada = 'non native';
      this._transitionProgress.addListener(Animated.event([{
        value: this._nonNativeTransitionProgress }],
        { useNativeDriver: false }));
    }
    return this._nonNativeTransitionProgress;    
  }

  getRoutes() {
    return [this.state.fromRoute, this.state.toRoute].filter(r => r !== null);
  }

  getIsPartOfSharedTransition(name: string, route: string) {
    const item = this._transitionItems.getItemByNameAndRoute(name, route);
    if (!item || !item.shared) return false;

    const sharedElements = this._transitionItems.getSharedElements(this.state.fromRoute, this.state.toRoute);

    if (sharedElements.find(pair =>
      (pair.fromItem.name === item.name && pair.fromItem.route === item.route) ||
      (pair.toItem.name === item.name && pair.toItem.route === item.route))) {
      return true;
    }
    return false;
  }

  async getViewMetrics():Metrics {
    const nodeHandle = findNodeHandle(this._viewRef);
    let viewMetrics: Metrics;
    if (!nodeHandle) return viewMetrics;

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
    const nodeHandle = item.getNodeHandle();
    if (!nodeHandle) return;

    await new Promise(resolve => {
      UIManager.measureInWindow(nodeHandle, (x, y, width, height) => {
        item.updateMetrics(viewMetrics, { x, y, width, height });
        resolve();
      });
    });
  }

  _inUpdate: boolean = false;
  componentDidUpdate() {
    if (this._inUpdate) return;
    if (!this.state.fromRoute && !this.state.toRoute) return;

    this._inUpdate = true;

    // Wait a little bit to give the layout system some time to reconcile
    let measureAndUpdateFunc = async () => {
      let sharedElements = this._transitionItems.getSharedElements(this.state.fromRoute, this.state.toRoute);
      let transitionElements = this._transitionItems.getTransitionElements(this.state.fromRoute, this.state.toRoute);

      await this._interactionDonePromise;
      await this.measureItems(sharedElements, transitionElements);

      // Update visibility style based on calculation by re-rendering all transition elements.
      this._transitionItems.getItems().forEach(item => item.reactElement.forceUpdate());

      if (!sharedElements.find(p => !p.fromItem.metrics || !p.toItem.metrics) &&
        !transitionElements.find(i => !i.metrics)) {
        // HACK: Setting state in componentDidUpdate is not nice - but
        // this is the only way we can notify the transitioner that we are
        // ready to move along with the transition and we're trying to be nice
        // by waiting a few milliseconds
        this.setState({
          ...this.state,
          sharedElements,
          transitionElements,
        });

        this.props.onLayout && this.props.onLayout();

        if (this.state.fromRoute === null) {
          this._runStartAnimation(transitionElements.length);
        }
      }
      this._inUpdate = false;
    };

    measureAndUpdateFunc = measureAndUpdateFunc.bind(this);
    setTimeout(measureAndUpdateFunc, 10);
  }

  async _runStartAnimation(numberOfTransitions: number) {
    const { getTransitionConfig } = this.context;
    const { toRoute, navigation } = this.props;
    const transitionSpec = getTransitionConfig ?
      getTransitionConfig(toRoute, navigation) : {
        timing: Animated.timing,
        duration: 750,
        easing: Easing.inOut(Easing.poly(4)),
        isInteraction: true,
        useNativeDriver: true,
      };

    const { timing } = transitionSpec;
    delete transitionSpec.timing;

    const animations = [
      timing(this._transitionProgress, {
        ...transitionSpec,
        duration: numberOfTransitions === 0 ? 25 : transitionSpec.duration,
        toValue: 0,
      }),
    ];

    Animated.parallel(animations).start();
  }

  componentDidMount() {
    this._isMounted = true;
    this.updateFromProps({ ...this.props, index: -1 });
    InteractionManager.runAfterInteractions(this._interactionDonePromiseDone);
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
    getIsPartOfSharedTransition: PropTypes.func,
    getRoutes: PropTypes.func,
  }

  static contextTypes = {
    getTransitionConfig: PropTypes.func,
  }

  getChildContext() {
    return {
      register: (item) => this._transitionItems.add(item),
      unregister: (name, route) => this._transitionItems.remove(name, route),
      getTransitionProgress: this.getTransitionProgress,
      getDirectionForRoute: this.getDirectionForRoute.bind(this),
      getIndex: () => this.state.index,
      getDirection: () => (this.state.direction ?
        this.state.direction : NavigationDirection.unknown),
      getIsPartOfSharedTransition: this.getIsPartOfSharedTransition,
      getRoutes: this.getRoutes
    };
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden'
  },
});
