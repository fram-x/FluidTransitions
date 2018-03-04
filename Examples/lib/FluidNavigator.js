import React from 'react';
import { StackRouter, NavigationActions, createNavigationContainer, createNavigator } from 'react-navigation';
import FluidTransitioner from './FluidTransitioner';

export default (routeConfigMap, stackConfig = {}) => {
  const {
    initialRouteName,
    initialRouteParams,
    paths,
    transitionConfig,
    onTransitionStart,
    onTransitionEnd,
    navigationOptions,
  } = stackConfig;

  const stackRouterConfig = {
    initialRouteName,
    initialRouteParams,
    paths,
    navigationOptions,
  };

  const router = StackRouter(routeConfigMap, stackRouterConfig);

  // Create a navigator with CardStackTransitioner as the view
  const navigator = createNavigator(router, routeConfigMap, stackConfig)(props => (
    <FluidTransitioner
      {...props}
      transitionConfig={transitionConfig}
      onTransitionStart={onTransitionStart}
      onTransitionEnd={() => {
        const { dispatch } = props.navigation;
        dispatch(NavigationActions.completeTransition());
        if (onTransitionEnd) onTransitionEnd();
      }}
    />));

  return createNavigationContainer(navigator);
};
