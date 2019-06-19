import React from 'react';
import {
  StackRouter,
  createNavigator,
  StackActions,
  getCustomActionCreators,
} from 'react-navigation';

import FluidTransitioner from './FluidTransitioner';

export default (routeConfigMap, stackConfig = {}) => {
  const {
    initialRouteName,
    initialRouteParams,
    paths,
    mode,
    transitionConfig,
    defaultNavigationOptions,
    style,
  } = stackConfig;

  const stackRouterConfig = {
    initialRouteName,
    initialRouteParams,
    paths,
    defaultNavigationOptions,
    getCustomActionCreators,
  };

  class FluidNavigationView extends React.Component {
    render() {
      const { navigation, screenProps, descriptors, onTransitionStart,
        onTransitionEnd } = this.props;

      return (
        <FluidTransitioner
          mode={mode}
          style={style}
          navigation={navigation}
          screenProps={screenProps}
          descriptors={descriptors}
          transitionConfig={transitionConfig}
          onTransitionStart={onTransitionStart}
          onTransitionEnd={(transition, lastTransition) => {
            if (transition.navigation.state.isTransitioning) {
              navigation.dispatch(
                StackActions.completeTransition({
                  key: navigation.state.key,
                  toChildKey: navigation.state.routes[navigation.state.index].key
                }),
              );
            }
            if (onTransitionEnd) onTransitionEnd(transition, lastTransition);
          }}
        />
      );
    }
  }

  const router = StackRouter(routeConfigMap, stackRouterConfig);
  return createNavigator(FluidNavigationView, router, stackConfig);
};
