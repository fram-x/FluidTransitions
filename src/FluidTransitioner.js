import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text, InteractionManager, Platform, Easing, Animated } from 'react-native';
import { addNavigationHelpers, Transitioner } from 'react-navigation';

import TransitionItemsView from './TransitionItemsView';
import TransitionRouteView from './TransitionRouteView';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  scene: {
    position: 'absolute',
    backgroundColor: '#FFF',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sceneContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  }
});

class FluidTransitioner extends React.Component<*> {
  _transitionItemsView: any;

  static childContextTypes = {
    route: PropTypes.string,
  }

  getChildContext() {
    return {
      route: this.props.navigation.state.routes[
        this.props.navigation.state.index].routeName,
    };
  }

  render() {
    return (
      <Transitioner
        configureTransition={this._configureTransition.bind(this)}
        render={this._render.bind(this)}
        navigation={this.props.navigation}
      />
    );
  }

  shouldComponentUpdate(nextProps) {
    return this.props !== nextProps;
  }

  _configureTransition() {
    return {
      timing: Animated.timing,
      duration: 1750,
      easing: Easing.inOut(Easing.poly(4)),
      ...this.props.transitionConfig,
      isInteraction: true,
      useNativeDriver: true,
    };
  }

  _render(props, prevProps) {
    const scenes = props.scenes.map(scene => this._renderScene({ ...props, scene }, prevProps));
    const toRoute = props.scene.route.routeName;
    const fromRoute = prevProps ? prevProps.scene.route.routeName : null;
    const index = props.scene.index;

    return (
      <TransitionItemsView
        navigation={this.props.navigation}
        ref={ref => this._transitionItemsView = ref}
        progress={props.position}
        fromRoute={fromRoute}
        toRoute={toRoute}
        index={index}
      >
        {scenes}
      </TransitionItemsView>
    );
  }

  _renderScene(transitionProps, prevProps) {
    const { position, scene } = transitionProps;
    const { index } = scene;    
    const navigation = this._getChildNavigation(scene);
    const Scene = this.props.router.getComponentForRouteName(scene.route.routeName);    

    return (
      <TransitionRouteView
        style={[styles.scene, this.getOpacityStyle(transitionProps.position, index)]}
        key={transitionProps.scene.route.key}
        route={scene.route.routeName}
      >
          <Scene navigation={navigation}/>
      </TransitionRouteView>
    );
  }

  getOpacityStyle(position: Animated.Value, index: number) {
    return { opacity: position.interpolate({
      inputRange: [index -1, index - 0.5, index, index + 0.5, index + 1],
      outputRange: [0, 1, 1, 1, 0],
    })};
  }

  _getChildNavigation = (scene) => {
    if (!this._childNavigationProps) { this._childNavigationProps = {}; }

    let navigation = this._childNavigationProps[scene.key];
    if (!navigation || navigation.state !== scene.route) {
      navigation = this._childNavigationProps[scene.key] = addNavigationHelpers({
        ...this.props.navigation,
        state: scene.route,
      });
    }

    return navigation;
  }
}

export default FluidTransitioner;
