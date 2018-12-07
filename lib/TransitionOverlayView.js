import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import PropTypes from 'prop-types';
import sortBy from 'lodash.sortby';

import TransitionItem from './TransitionItem';
import { TransitionContext, RouteDirection } from './Types';
import * as Constants from './TransitionConstants';

import { initTransitionTypes, getTransitionElements } from './Transitions';
import { initInterpolatorTypes, getSharedElements, getAnchoredElements } from './Interpolators';
import { compareSharedElements, compareTransitionElements } from './Utils/utilities';

initTransitionTypes();
initInterpolatorTypes();

type Props = {
  fromRoute: string,
  toRoute: string,
  visibility: Animated.Value,
  direction: number,
  index: number,
  sharedElements: Array<any>,
  transitionElements: Array<TransitionItem>
}

class TransitionOverlayView extends React.Component<Props> {
  constructor(props: Props, context) {
    super(props, context);
    this._isMounted = false;
    this.getInterpolation = this.getInterpolation.bind(this);
  }

  _isMounted: boolean;

  _nativeInterpolation: any;

  _interpolation: any;

  /* shouldComponentUpdate(nextProps: Props) {
    const { direction, fromRoute, toRoute, index, sharedElements, transitionElements } = this.props;
    const seDiffers = !compareSharedElements(sharedElements, nextProps.sharedElements);
    const teDiffers = !compareTransitionElements(transitionElements, nextProps.transitionElements);
    if (direction !== nextProps.direction
      || index !== nextProps.index
      || fromRoute !== nextProps.fromRoute
      || toRoute !== nextProps.toRoute
      || seDiffers || teDiffers) {
      return true;
    }
    return false;
  }*/

  render() {
    const { fromRoute, toRoute } = this.props;
    let { transitionElements, sharedElements } = this.props;
    const from = fromRoute;
    const to = toRoute;
    transitionElements = transitionElements ? transitionElements
      .filter(i => !i.inline && (i.route === from || i.route === to)) : [];

    sharedElements = sharedElements ? sharedElements
      .filter(p => (p.fromItem.route === from || p.fromItem.route === to)
        && (p.toItem.route === from || p.toItem.route === to)) : [];

    const transitionContext = this.getTransitionContext(transitionElements);
    if (!transitionContext || !this.getMetricsReady()
      || (sharedElements.length === 0 && transitionElements.length === 0)) {
      return <View style={styles.overlay} pointerEvents="none" />;
    }

    this._interpolation = null;
    this._nativeInterpolation = null;

    const transitionViews = getTransitionElements(transitionElements, transitionContext);
    const sharedElementViews = getSharedElements(sharedElements, this.getInterpolation);
    const anchoredViews = getAnchoredElements(sharedElements, this.getInterpolation);

    let views = [...transitionViews, ...sharedElementViews, ...anchoredViews];
    views = sortBy(views, 'props.index');

    return (
      <Animated.View
        style={[
          styles.overlay,
          this.getVisibilityStyle(),
        ]}
        pointerEvents="none"
      >
        {views}
      </Animated.View>
    );
  }

  getVisibilityStyle() {
    const { getTransitionProgress } = this.context;
    const { index } = this.props;

    if (!getTransitionProgress) return {};
    const progress = getTransitionProgress();
    if (!progress) return { opacity: 0 };

    const inputRange = [index - 1, (index - 1) + Constants.OP, index - Constants.OP, index];
    const outputRange = [0, 1, 1, 0];
    const visibility = progress.interpolate({ inputRange, outputRange });

    return { opacity: visibility };
  }

  getMetricsReady(): boolean {
    let metricsReady = true;
    const { transitionElements, sharedElements } = this.props;
    if (transitionElements) {
      transitionElements.forEach(item => {
        if (!item.metrics) {
          metricsReady = false;
        }
      });
    }

    if (sharedElements) {
      sharedElements.forEach(pair => {
        if (!pair.toItem.metrics || !pair.fromItem.metrics) {
          metricsReady = false;
        }
        if (pair.fromItem && pair.fromItem.anchors) {
          for (let n = 0; n < pair.fromItem.anchors.length; n++) {
            if (!pair.fromItem.anchors[n].metrics) {
              metricsReady = false;
              break;
            }
          }
        }
        if (pair.toItem && pair.toItem.anchors) {
          for (let n = 0; n < pair.toItem.anchors.length; n++) {
            if (!pair.toItem.anchors[n].metrics) {
              metricsReady = false;
              break;
            }
          }
        }
      });
    }
    return metricsReady;
  }

  getInterpolation(useNativeDriver: boolean) {
    const { getTransitionProgress, getIndex } = this.context;
    if (!getTransitionProgress || !getIndex) return null;

    const index = getIndex();
    const inputRange = [index - 1, index, index + 1];

    if (useNativeDriver && !this._nativeInterpolation) {
      this._nativeInterpolation = getTransitionProgress(true).interpolate({
        inputRange, outputRange: [0, 1, 0],
      });
    } else if (!useNativeDriver && !this._interpolation) {
      this._interpolation = getTransitionProgress(false).interpolate({
        inputRange, outputRange: [0, 1, 0],
      });
    }

    if (useNativeDriver) return this._nativeInterpolation;
    return this._interpolation;
  }

  getTransitionContext(transitionElements): TransitionContext {
    const { getDirectionForRoute, getIndex, getDirection,
      getRoutes, getTransitionProgress } = this.context;

    if (!transitionElements || !getDirectionForRoute || !getDirection
      || !getRoutes || !getIndex || !getTransitionProgress) {
      return null;
    }

    const delayCountFrom = transitionElements
      .filter(item => getDirectionForRoute(item.name, item.route) === RouteDirection.from)
      .reduce((prevValue, item) => (item.delay ? prevValue + 1 : prevValue), 0);

    const delayCountTo = transitionElements
      .filter(item => getDirectionForRoute(item.name, item.route) === RouteDirection.to)
      .reduce((prevValue, item) => (item.delay ? prevValue + 1 : prevValue), 0);

    const navDirection = getDirection();
    const delayIndexFrom = 0;
    const delayIndexTo = Math.max(0, delayCountTo - 1);
    const delayFromFactor = 1;
    const delayToFactor = -1;

    return {
      delayCountFrom,
      delayCountTo,
      navDirection,
      delayIndexFrom,
      delayIndexTo,
      delayToFactor,
      delayFromFactor,
      getDirectionForRoute,
      getIndex,
      getTransitionProgress,
      getRoutes,
    };
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  static contextTypes = {
    getTransitionProgress: PropTypes.func,
    getDirectionForRoute: PropTypes.func,
    getDirection: PropTypes.func,
    getIndex: PropTypes.func,
    getRoutes: PropTypes.func,
  }
}

const styles: StyleSheet.Styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    // backgroundColor: '#FF00AE11',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default TransitionOverlayView;
