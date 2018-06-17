import React from 'react';
import { 
  StackRouter, 
  NavigationActions, 
  createNavigationContainer, 
  createNavigator, 
  StackActions 
} from 'react-navigation';

import FluidTransitioner from './FluidTransitioner';

export default (routeConfigMap, stackConfig = {}) => {
  const {
    initialRouteName,
    initialRouteParams,
    paths,
    mode,
    transitionConfig,
    onTransitionStart,
    onTransitionEnd,
    navigationOptions,
    style,
  } = stackConfig;

  const stackRouterConfig = {
    initialRouteName,
    initialRouteParams,
    paths,
    navigationOptions,
  };

  class FluidNavigationView extends React.Component {
    render() {
      return (
        <FluidTransitioner
          mode={mode}
          style={style}
          navigation={this.props.navigation}
          screenProps={this.props.screenProps}
          descriptors={this.props.descriptors}
          transitionConfig={transitionConfig}
          onTransitionStart={this.props.onTransitionStart}
          onTransitionEnd={(transition, lastTransition) => {
            const { onTransitionEnd, navigation } = this.props;
            if (
              transition.navigation.state.isTransitioning &&
              !lastTransition.navigation.state.isTransitioning
            ) {
              navigation.dispatch(
                StackActions.completeTransition({
                  key: navigation.state.key,
                })
              );
            }
            onTransitionEnd && onTransitionEnd(transition, lastTransition);
          }}
      />
      );
    }
  }

  const router = StackRouter(routeConfigMap, stackRouterConfig);
  const Navigator = createNavigator(FluidNavigationView, router, stackConfig);
  return createNavigationContainer(Navigator);
};
