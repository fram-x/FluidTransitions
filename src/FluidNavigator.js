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

  class FluidView extends React.Component {
    render() {
      return (
        <FluidTransitioner
          navigation={this.props.navigation}
          descriptors={this.props.descriptors}
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
  const Navigator = createNavigator(FluidView, router, stackConfig);
  return createNavigationContainer(Navigator);
};
