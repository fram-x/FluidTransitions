import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, InteractionManager, Platform, Easing, Animated } from 'react-native';
import { addNavigationHelpers } from 'react-navigation';

import Transitioner from './BaseTransitioner';
import TransitionItemsView from './TransitionItemsView';

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
});

class FluidTransitioner extends React.Component {
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
        onTransitionStart={this._onTransitionStart.bind(this)}
        onTransitionEnd={this._onTransitionEnd.bind(this)}
        render={this._render.bind(this)}
        navigation={this.props.navigation}
      />
    );
  }

  shouldComponentUpdate(nextProps) {
    return this.props !== nextProps;
  }

  async componentDidMount() {
   const runAppearAnimations = async () => {
      if (!this._transitionItemsView) {
        return;
      }

      // Build properties
      const config = this._configureTransition();
      const { state } = this.props.navigation;
      const progress = new Animated.Value(0);
      const props = {
        index: state.index,
        progress,
        navigation: this.props.navigation,
        scene: {
          index: 1,
          route: state.routes[state.index],
        },
      };

      // Start transition
      const animations = [];
      await this._transitionItemsView.onTransitionStart(props, null, config, animations);
      if (animations.length === 0) {
        this._transitionItemsView.onTransitionEnd(props, null, config)
        return;
      }
      const animationsToRun = [];
      animations.forEach(ad => animationsToRun.push(ad.animation));

      // Run animation
      const { timing } = config;
      delete config.timing;
      Animated.parallel(animationsToRun).start(async () =>
        this._transitionItemsView.onTransitionEnd(props, null, config))
    }
    
    if(Platform.OS === 'android')
      InteractionManager.runAfterInteractions(runAppearAnimations);
    else
      setTimeout(runAppearAnimations, 200);
  }

  _onTransitionStart(props, prevProps, animations) {
    const config = this._configureTransition();
    return this._transitionItemsView.onTransitionStart(props, prevProps, config, animations);
  }

  _onTransitionEnd(props, prevProps) {
    const config = this._configureTransition();
    
    // Fix issue with nativeDriver and position
    // https://github.com/react-navigation/react-navigation/issues/3157
    if (this._configureTransition().useNativeDriver) {
      props.position.setValue(props.navigation.state.index);
    }

    return this._transitionItemsView.onTransitionEnd(props, prevProps, config);
  }

  _configureTransition() {
    return {
      timing: Animated.spring,
      stiffness: 1400,
      damping: 85,
      mass: 3,
      duration: 2350,
      easing: Easing.elastic(1.2),
      ...this.props.transitionConfig,
      isInteraction: true,
      useNativeDriver: true,
    };
  }

  _render(props, prevProps) {
    const scenes = props.scenes.map(scene => this._renderScene({ ...props, scene }, prevProps));
    return (
      <TransitionItemsView
        navigation={this.props.navigation}
        ref={ref => this._transitionItemsView = ref}
      >
        {scenes}
      </TransitionItemsView>
    );
  }

  _renderScene(transitionProps, prevProps) {
    const { position, scene } = transitionProps;
    const { index } = scene;

    // Ensure we hide bottom scenes
    let diff = 0;
    if (prevProps) { diff = (index - position.__getValue())};
    let opacity = 0.0;
    if (diff <= 1 && diff >= -1) {
      opacity = position.interpolate({
        inputRange: [index - 1, index - 0.0001, index, index + 0.9999, index + 1],
        outputRange: [0, 1, 1, 1, 0],
      });
    }

    const style = { opacity };
    const navigation = this._getChildNavigation(scene);

    const Scene = this.props.router.getComponentForRouteName(scene.route.routeName);

    return (
      <Animated.View
        key={transitionProps.scene.route.key}
        style={[style, styles.scene]}
      >
        <Scene navigation={navigation} />
      </Animated.View>
    );
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
