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
import { ScreenContainer } from 'react-native-screens';

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
  style: StyleSheet.Styles,
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
    this._transitionProgress.setValue(-1); // Reset to handle first transition
    // this._transitionProgress.addListener(console.log);

    this._interactionDonePromise = new Promise(
      resolve => this._interactionDonePromiseDone = resolve,
    );
  }

  _viewRef: ?View;

  _viewMetrics: Metrics;

  _transitionItems: TransitionItems;

  _isMounted: boolean;

  _transitionProgress: Animated.Value;

  _nonNativeTransitionProgress: Animated.Value;

  _interactionDonePromise: Promise;

  _interactionDonePromiseDone: Function;

  _shouldRunStartAnimation: boolean = true;

  componentWillReceiveProps(nextProps) {
    this.updateFromProps(nextProps, this.props);
  }

  updateFromProps(props, prevProps) {
    if (!this._isMounted) return;

    const { fromRoute, toRoute } = props;
    const direction = props.index >= (prevProps ? prevProps.index : Number.MIN_SAFE_INTEGER)
      ? NavigationDirection.forward : NavigationDirection.back;

    const index = prevProps ? props.index : 0;

    if (toRoute !== this.state.toRoute
      || fromRoute !== this.state.fromRoute
      || index !== this.state.index
      || direction !== this.state.direction) {
      this.setState({
        toRoute,
        fromRoute,
        direction,
        index,
      });
    }
  }

  render() {
    const { style, children } = this.props;
    const { direction, fromRoute, toRoute, index, sharedElements, transitionElements } = this.state;
    return (
      <View
        {...this.props}
        style={[styles.container, style]}
        ref={(ref) => this._viewRef = ref}
        collapsable={false}
      >
        <ScreenContainer style={{ ...StyleSheet.absoluteFillObject }}>
          {children}
        </ScreenContainer>
        <TransitionOverlayView
          direction={direction}
          fromRoute={fromRoute}
          toRoute={toRoute}
          index={index}
          sharedElements={sharedElements}
          transitionElements={transitionElements}
        />
      </View>
    );
  }

  getDirectionForRoute = (name: string, route: string): RouteDirection => {
    const { fromRoute, toRoute } = this.state;
    if (!fromRoute && !toRoute) { return RouteDirection.unknown; }
    if (!fromRoute) { return RouteDirection.to; } // First screen, always direction to
    if (route === fromRoute) {
      return RouteDirection.from;
    } if (route === toRoute) {
      return RouteDirection.to;
    }
    return RouteDirection.unknown;
  }

  getTransitionProgress = (useNative = true) => {
    if (useNative) return this._transitionProgress;

    if (!this._nonNativeTransitionProgress) {
      this._nonNativeTransitionProgress = new Animated.Value(-1);
      this._transitionProgress.addListener(Animated.event([{
        value: this._nonNativeTransitionProgress }],
      { useNativeDriver: false }));
    }
    return this._nonNativeTransitionProgress;
  }

  getRoutes = () => {
    const { fromRoute, toRoute } = this.state;
    return [fromRoute, toRoute].filter(r => r !== null);
  }

  getIsAnchored = (name: string, route: string) => {
    const item = this._transitionItems.getItemByNameAndRoute(name, route);
    if (!item) return false;

    const { fromRoute, toRoute } = this.state;
    const sharedElements = this._transitionItems.getSharedElements(fromRoute, toRoute);
    if (sharedElements
      && (sharedElements.find(p => p.fromItem.name === item.anchor && p.fromItem.route === route))
      || sharedElements.find(p => p.toItem.name === item.anchor && p.toItem.route === route)) {
      return true;
    }
    return false;
  }

  getItemByNameAndRoute = (
    name: string, route: string,
  ) => this._transitionItems.getItemByNameAndRoute(name, route)

  getItemDelayInfo = (name: string, route: string) => {
    const { fromRoute, toRoute } = this.state;
    const transitionElements = this._transitionItems
      .getItems()
      .filter(itm => itm.route === route && !itm.shared && itm.delay);

    const delayCount = transitionElements.length + 1;
    let delayFactor = 0;
    let delayIndex = 0;
    if (fromRoute === route) {
      delayFactor = 1;
      delayIndex = 0;
    } else if (toRoute === route) {
      delayFactor = -1;
      delayIndex = delayCount - 1;
    }

    for (let i = 0; i < transitionElements.length; i++) {
      delayIndex += delayFactor;
      if (transitionElements[i].name === name
        && transitionElements[i].route === route) {
        break;
      }
    }

    return { delayCount, delayIndex };
  }

  getIsPartOfSharedTransition = (name: string, route: string) => {
    const item = this._transitionItems.getItemByNameAndRoute(name, route);
    if (!item || !item.shared) return false;

    const { fromRoute, toRoute } = this.state;
    const sharedElements = this._transitionItems.getSharedElements(fromRoute, toRoute);

    if (sharedElements.find(pair => (pair.fromItem.name === item.name
      && pair.fromItem.route === item.route)
      || (pair.toItem.name === item.name && pair.toItem.route === item.route))) {
      return true;
    }
    return false;
  }

  getDirection = () => {
    const { direction } = this.state;
    return direction;
  }

  getIndex = () => {
    const { index } = this.state;
    return index;
  }

  getIsPartOfTransition = (name: string, route: string) => {
    const item = this._transitionItems.getItemByNameAndRoute(name, route);
    if (!item || !(item.appear || item.disappear)) return false;

    const { fromRoute, toRoute } = this.state;
    const transitionElements = this._transitionItems.getTransitionElements(fromRoute, toRoute);

    if (transitionElements.find(o => item.name === o.name && item.route === o.route)) {
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
    const promises = [];
    const viewMetrics = await this.getViewMetrics();
    if (sharedElements) {
      for (let i = 0; i < sharedElements.length; i++) {
        const pair = sharedElements[i];
        promises.push(this.measureItem(viewMetrics, pair.fromItem));
        promises.push(this.measureItem(viewMetrics, pair.toItem));
        if (pair.fromItem && pair.fromItem.anchors) {
          for (let n = 0; n < pair.fromItem.anchors.length; n++) {
            promises.push(this.measureItem(viewMetrics, pair.fromItem.anchors[n]));
          }
        }
        if (pair.toItem && pair.toItem.anchors) {
          for (let n = 0; n < pair.toItem.anchors.length; n++) {
            promises.push(this.measureItem(viewMetrics, pair.toItem.anchors[n]));
          }
        }
      }
    }

    if (transitionElements) {
      for (let i = 0; i < transitionElements.length; i++) {
        promises.push(this.measureItem(viewMetrics, transitionElements[i]));
      }
    }

    if (promises.length > 0) await Promise.all(promises);
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
    const { fromRoute, toRoute } = this.state;
    if (!fromRoute && !toRoute) return;

    this._inUpdate = true;

    // Wait a little bit to give the layout system some time to reconcile
    let measureAndUpdateFunc = async () => {
      const sharedElements = this._transitionItems.getSharedElements(fromRoute, toRoute);
      const transitionElements = this._transitionItems.getTransitionElements(fromRoute, toRoute);

      await this._interactionDonePromise;
      await this.measureItems(sharedElements, transitionElements);

      if (!sharedElements.find(p => !p.fromItem.metrics || !p.toItem.metrics)
        && !transitionElements.find(i => !i.metrics)) {
        // Update style based on calculation by re-rendering all transition elements.
        // Ref, https://github.com/fram-x/FluidTransitions/issues/8
        this._transitionItems.getItems().forEach(item => item.forceUpdate());

        // HACK: Setting state in componentDidUpdate is not nice - but
        // this is the only way we can notify the transitioner that we are
        // ready to move along with the transition and we're trying to be nice
        // by waiting a few milliseconds
        this.setState((prevState) => ({
          ...prevState,
          sharedElements,
          transitionElements,
        }), () => {
          const { onLayout } = this.props;
          if (onLayout) onLayout();
          this._runStartAnimation(transitionElements.length);
          this._inUpdate = false;
        });
      }
    };

    measureAndUpdateFunc = measureAndUpdateFunc.bind(this);
    setTimeout(measureAndUpdateFunc, 10);
  }

  async _runStartAnimation(numberOfTransitions: number) {
    if (!this._shouldRunStartAnimation) { return; }

    this._shouldRunStartAnimation = false;
    const { getTransitionConfig } = this.context;
    const { toRoute, navigation, index } = this.props;

    if (index > 0) {
      this._transitionProgress.setValue(index - 1);
    }

    const transitionSpec = getTransitionConfig
      ? getTransitionConfig(toRoute, navigation) : {
        timing: Animated.timing,
        duration: 650,
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
        toValue: index,
      }),
    ];

    Animated.parallel(animations).start();
  }

  componentDidMount() {
    this._isMounted = true;
    this.updateFromProps({ ...this.props, index: -1 });
    // check for transition elements - we don't need to wait for transitions
    // if we don't have any appearing elements
    const { fromRoute, toRoute } = this.props;
    const te = this._transitionItems.getTransitionElements(fromRoute, toRoute);
    if (te.length > 0) {
      InteractionManager.runAfterInteractions(this._interactionDonePromiseDone);
    } else {
      this._interactionDonePromiseDone();
    }
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
    getIsPartOfTransition: PropTypes.func,
    getRoutes: PropTypes.func,
    getIsAnchored: PropTypes.func,
    getItemByNameAndRoute: PropTypes.func,
    getItemDelayInfo: PropTypes.func,
  }

  static contextTypes = {
    getTransitionConfig: PropTypes.func,
  }

  getChildContext() {
    return {
      register: (item) => this._transitionItems.add(item),
      unregister: (name, route) => this._transitionItems.remove(name, route),
      getTransitionProgress: this.getTransitionProgress,
      getDirectionForRoute: this.getDirectionForRoute,
      getIndex: () => this.getIndex(),
      getDirection: () => (this.getDirection() || NavigationDirection.unknown),
      getIsPartOfSharedTransition: this.getIsPartOfSharedTransition,
      getIsPartOfTransition: this.getIsPartOfTransition,
      getIsAnchored: this.getIsAnchored,
      getRoutes: this.getRoutes,
      getItemByNameAndRoute: this.getItemByNameAndRoute,
      getItemDelayInfo: this.getItemDelayInfo,
    };
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
});
