import React from 'react';
import { Dimensions, StyleSheet } from 'react-native';

import { createAnimatedWrapper, getResolvedMetrics } from '../Utils';
import { getTransitionType } from './TransitionTypes';
import * as Constants from '../TransitionConstants';
import TransitionItem from '../TransitionItem';
import {
  TransitionContext,
  RouteDirection,
  TransitionSpecification,
} from '../Types';

const getTransitionElements = (transitionElements: Array<TransitionItem>,
  transitionContext: TransitionContext) => {
  const screenSize = Dimensions.get('window');
  return transitionElements.map((item) => {
    const routeDirection = transitionContext.getDirectionForRoute(item.name, item.route);
    let element = React.Children.only(item.reactElement.props.children);
    const key = `ti-${item.name}`;

    // Check if we are on screen
    if (item.boundingBoxMetrics.x > screenSize.width
      || item.boundingBoxMetrics.x + item.boundingBoxMetrics.width < 0
      || item.boundingBoxMetrics.y > screenSize.height
      || item.boundingBoxMetrics.y + item.boundingBoxMetrics.height < 0) {
      return null;
    }

    const transitionStyle = getPositionStyle(
      item, routeDirection === RouteDirection.from
        ? transitionContext.delayCountFrom + 1 : transitionContext.delayCountTo + 1,
      routeDirection === RouteDirection.from
        ? transitionContext.delayIndexFrom : transitionContext.delayIndexTo,
      transitionContext,
    );

    const style = [transitionStyle, styles.transitionElement];
    const props = { ...element.props, __index: item.index };
    element = React.createElement(element.type, { ...props, key });
    const comp = createAnimatedWrapper({ component: element, nativeStyles: style });

    if (item.delay) {
      if (routeDirection === RouteDirection.from) {
        transitionContext.delayIndexFrom += transitionContext.delayFromFactor;
      } else {
        transitionContext.delayIndexTo += transitionContext.delayToFactor;
      }
    }
    return comp;
  }).filter(p => p !== null);
};

const getPositionStyle = (item: TransitionItem, delayCount: number, delayIndex: number,
  transitionContext: TransitionContext) => {
  const resolvedMetrics = getResolvedMetrics(item, item.metrics);
  return {
    left: resolvedMetrics.x,
    top: resolvedMetrics.y,
    width: resolvedMetrics.width,
    height: resolvedMetrics.height,
    ...getTransitionStyle(item, delayCount, delayIndex, transitionContext),
  };
};

const getTransitionStyle = (item: TransitionItem, delayCount: number, delayIndex: number,
  transitionContext: TransitionContext) => {
  const index = transitionContext.getIndex();
  const routeDirection = transitionContext.getDirectionForRoute(item.name, item.route);
  const progress = transitionContext.getTransitionProgress();
  const routes = transitionContext.getRoutes();

  if (progress) {
    const transitionFunction = getTransitionFunction(item, routeDirection);
    if (transitionFunction) {
      // Calculate start/end to handle delayed transitions
      let start = Constants.TRANSITION_PROGRESS_START;
      let end = Constants.TRANSITION_PROGRESS_END;

      const distance = routes.length > 1
        ? (1.0 - (Constants.TRANSITION_PROGRESS_START
        + (1.0 - Constants.TRANSITION_PROGRESS_END))) * 0.5
        : (1.0 - (Constants.TRANSITION_PROGRESS_START
        + (1.0 - Constants.TRANSITION_PROGRESS_END)));

      if (item.delay) {
        // Start/stop in delay window
        const delayStep = distance / delayCount;
        if (routeDirection === RouteDirection.from) {
          start += (delayStep * delayIndex);
        } else {
          end -= (delayStep * delayIndex);
        }
      } else if (routes.length > 1) {
        // Start/stop first/last half of transition
        if (routeDirection === RouteDirection.to) {
          start += distance;
        } else {
          end -= distance;
        }
      }

      // Create progress interpolation
      const interpolatedProgress = progress.interpolate({
        inputRange: [index - 1, index, index + 1],
        outputRange: [0, 1, 0],
      });

      const transitionSpecification: TransitionSpecification = {
        progress: interpolatedProgress,
        name: item.name,
        route: item.route,
        metrics: item.metrics,
        boundingbox: item.boundingBoxMetrics,
        direction: routeDirection,
        dimensions: Dimensions.get('window'),
        start,
        end,
      };

      return transitionFunction(transitionSpecification);
    }
  }
  return { };
};

const getTransitionFunction = (item: TransitionItem, routeDirection: RouteDirection) => {
  const getTransition = (transition: string | Function) => {
    if (transition instanceof Function) { return transition; }
    return getTransitionType(transition);
  };

  if (routeDirection === RouteDirection.to && item.appear) {
    return getTransition(item.appear);
  } if (routeDirection === RouteDirection.from && item.disappear) {
    return getTransition(item.disappear);
  } if (item.appear) {
    return getTransition(item.appear);
  }
  return null;
};

const styles = StyleSheet.create({
  transitionElement: {
    position: 'absolute',
  },
});

export { getTransitionElements };
