import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text, InteractionManager, Platform, Easing, Animated } from 'react-native';
import { addNavigationHelpers, Transitioner } from 'react-navigation';

import TransitionItemsView from './TransitionItemsView';
import TransitionRouteView from './TransitionRouteView';

const emptyFunction = ()=> {};

type SceneRenderedInfo = {
  key: string,
  isMounted: boolean,
};

class FluidTransitioner extends React.Component<*> {
  constructor(props) {
    super(props);
    
    this._onTransitionStart = this._onTransitionStart.bind(this);
    this._onTransitionEnd = this._onTransitionEnd.bind(this);

    this._screenDidMount = this._screenDidMount.bind(this);
    this._transitionItemsViewOnLayout = this._transitionItemsViewOnLayout.bind(this);
    this._configureTransition = this._configureTransition.bind(this);

    this._scenesMountedPromise = new Promise(resolve =>
      this._scenesMountedResolve = resolve);
  }

  _scenes: Array<SceneRenderedInfo> = [];
  _scenesMountedResolve: Function;
  _scenesMountedPromise: Promise<void>;
  _layoutsReady: boolean;

  static childContextTypes = {
    route: PropTypes.string,
    getTransitionConfig: PropTypes.func,
    onScreenDidMount: PropTypes.func,
  }

  _animatedSubscribeForNativeAnimation(animatedValue: Animated.Value){
    if(!animatedValue) return;
    if(!this._configureTransition().useNativeDriver) return;
    if (Object.keys(animatedValue._listeners).length === 0) {
      animatedValue.addListener(emptyFunction);
    }
  }

  getChildContext() {
    return {
      route: this.props.navigation.state.routes[
        this.props.navigation.state.index].routeName,
      onScreenDidMount: this._screenDidMount,
      getTransitionConfig: this._configureTransition
    };
  }

  render() {
    return (
      <Transitioner
        configureTransition={this._configureTransition}
        render={this._render.bind(this)}
        navigation={this.props.navigation}
        onTransitionStart={this._onTransitionStart}
        _onTransitionEnd={this._onTransitionEnd}
      />
    );
  }

  _transitionItemsViewOnLayout(evt) {
    this._layoutsReady = true;
    this._checkScenesAndLayouts();
  }

  _screenDidMount(key: string) {
    if(!this._scenesMountedResolve)
      return;

    // check if this is a scene we are waiting for
    const sceneRenderInfo = this._scenes.find(sri => sri.key === key);
    if(sceneRenderInfo) sceneRenderInfo.isMounted = true;

    this._checkScenesAndLayouts();
  }

  _checkScenesAndLayouts() {
    if(this._layoutsReady && !this._scenes.find(sri => !sri.isMounted)) {
      if(this._scenesMountedResolve){
        this._scenesMountedResolve();
        this._scenesMountedResolve = null;
      }
    }
  }

  async _onTransitionStart() {
    if(this._scenesMountedPromise)
      await this._scenesMountedPromise;
  }

  _onTransitionEnd() {
    this._scenesMountedPromise = new Promise(resolve =>
      this._scenesMountedResolve = resolve);
  }

  shouldComponentUpdate(nextProps) {
    return this.props !== nextProps;
  }

  _configureTransition() {
    return {
      timing: Animated.timing,
      duration: 550,
      easing: Easing.inOut(Easing.poly(4)),
      ...this.props.transitionConfig,
      isInteraction: true,
      useNativeDriver: true,
    };
  }

  _render(props, prevProps) {
    this._animatedSubscribeForNativeAnimation(props.position);
    this._updateSceneArray(props.scenes);
    this._layoutsReady = false;
    const scenes = props.scenes.map(scene =>
      this._renderScene({ ...props, scene }, prevProps));

    const toRoute = props.scene.route.routeName;
    const fromRoute = prevProps ? prevProps.scene.route.routeName : null;
    const index = props.scene.index;

    return (
      <TransitionItemsView
        navigation={this.props.navigation}
        progress={props.position}
        fromRoute={fromRoute}
        toRoute={toRoute}
        index={index}
        onLayout={this._transitionItemsViewOnLayout}
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
        sceneKey={scene.key}
      >
          <Scene navigation={navigation}/>
      </TransitionRouteView>
    );
  }

  getOpacityStyle(position: Animated.Value, index: number) {
    return { opacity: position.interpolate({
      inputRange: [index -1, index, index + 1],
      outputRange: [0, 1, 0],
    })};
  }

  _updateSceneArray(scenes: Array<any>) {
    scenes.forEach(scene => {
      if(!this._scenes.find(sri => sri.key === scene.key))
        this._scenes = [...this._scenes, { key: scene.key, isMounted: false}];
    });

    const toDelete = [];
    this._scenes.forEach(sri => {
      if(!scenes.find(scene => scene.key === sri.key))
        toDelete.push(sri);
    });

    toDelete.forEach(sri => {
      const index = this._scenes.indexOf(sri);
      this._scenes = [...this._scenes.slice(0, index), ...this._scenes.slice(index + 1)];
    });
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

export default FluidTransitioner;
