import React from 'react';
import { Dimensions, StyleSheet } from 'react-native';

import { createAnimatedWrapper } from './../Utils/createAnimatedWrapper';
import { getTransitionType } from './TransitionTypes';
import * as Constants from './../TransitionConstants';
import {
  TransitionContext,
  RouteDirection,
  NavigationDirection,
  TransitionSpecification,
} from './../Types';


const getTransitionElements = (transitionElements: Array<TransitionItem>, transitionContext: TransitionContext) => {
  return transitionElements.map((item, idx) => {
    const routeDirection = transitionContext.getDirectionForRoute(item.name, item.route);
    let element = React.Children.only(item.reactElement.props.children);
    const key = `ti-${idx.toString()}`;
    
    const transitionStyle = getPositionStyle(
      item, routeDirection === RouteDirection.from ?
        transitionContext.delayCountFrom + 1 : transitionContext.delayCountTo + 1,
      routeDirection === RouteDirection.from ?
        transitionContext.delayIndexFrom : transitionContext.delayIndexTo,        
      transitionContext
    );

    const style = [transitionStyle, styles.transitionElement];
    element = React.createElement(element.type, { ...element.props, key });
    const comp = createAnimatedWrapper({component: element, nativeStyles: style});

    if (item.delay) {
      if (routeDirection === RouteDirection.from) {
        transitionContext.delayIndexFrom += transitionContext.delayFromFactor;
      } else {
        transitionContext.delayIndexTo += transitionContext.delayToFactor;
      }
    }
    return comp;
  });
}

const getPositionStyle = (item: TransitionItem, delayCount: number, delayIndex: number, transitionContext: TransitionContext) => {
  return {
    left: item.metrics.x,
    top: item.metrics.y,
    width: item.metrics.width,
    height: item.metrics.height,
    ...getTransitionStyle(item, delayCount, delayIndex, transitionContext),
  };
}

const getTransitionStyle = (item: TransitionItem, delayCount: number, delayIndex: number, transitionContext: TransitionContext) => {
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

      let distance = routes.length > 1 ? 
        (1.0 - (Constants.TRANSITION_PROGRESS_START +
        (1.0 - Constants.TRANSITION_PROGRESS_END))) * 0.5 : 
        (1.0 - (Constants.TRANSITION_PROGRESS_START +
        (1.0 - Constants.TRANSITION_PROGRESS_END)));

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
        inputRange: transitionContext.navDirection === NavigationDirection.forward ? [index - 1, index] : [index, index + 1],
        outputRange: [0, 1],
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
}

const getTransitionFunction = (item: TransitionItem, routeDirection: RouteDirection) => {
  const getTransition = (transition: string | Function) => {
    if (transition instanceof Function) { return transition; }
    return getTransitionType(transition);
  };

  if (routeDirection === RouteDirection.to && item.appear) {
    return getTransition(item.appear);
  } else if (routeDirection === RouteDirection.from && item.disappear) {
    return getTransition(item.disappear);
  } else if (item.appear) {
    return getTransition(item.appear);
  }
  return null;
}

const styles = StyleSheet.create({
  transitionElement: {
    // borderColor: '#00F',
    // borderWidth: 1,
    position: 'absolute',
    margin: 0,
    marginVertical: 0,
    marginHorizontal: 0,
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0,
    marginStart: 0,
    marginEnd: 0,
  },
});

export { getTransitionElements };