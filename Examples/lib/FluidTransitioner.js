import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, InteractionManager, Animated, Easing, UIManager } from 'react-native';
import { Transitioner, addNavigationHelpers } from 'react-navigation';

import TransitionItemsView from './TransitionItemsView';

class FluidTransitioner extends Component {
	constructor(props) {
		super(props);
	}

	_transitionItemsView

	static childContextTypes = {
		route: PropTypes.string
	}

	getChildContext() {
		const self = this;
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

	shouldComponentUpdate(nextProps, nextState) {
		return this.props !== nextProps;
	}

	componentDidMount() {

		// Add appear transitions here
		InteractionManager.runAfterInteractions(async () => {

			if(!this._transitionItemsView){
				// console.log("FluidTransitioner componentDidMount after interactions - bailing out.");
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
					route: state.routes[state.index]
				}
			};

			// Start transition
			const retVal = await this._transitionItemsView.onTransitionStart(props, null, config);
			if(!retVal)
				return;

			// Run animation
			const { timing } = config;
			delete config.timing;
			timing(progress, {
				toValue: 1.0,
				...config
			}).start(async ()=> await this._transitionItemsView.onTransitionEnd(props, null, config));
		});
	}

	async _onTransitionStart (props, prevProps) {
		const config = this._configureTransition();
		await this._transitionItemsView.onTransitionStart(props, prevProps, config);
	}

	async _onTransitionEnd(props, prevProps) {
		const config = this._configureTransition();
		await this._transitionItemsView.onTransitionEnd(props, prevProps, config);

		// Fix issue with nativeDriver and position
		// https://github.com/react-navigation/react-navigation/issues/3157
		if(this._configureTransition().useNativeDriver)
			props.position.setValue(props.navigation.state.index);
	}

	_configureTransition(transitionProps, prevTransitionProps) {
		return {
			timing: Animated.spring,
			stiffness: 140,
			damping: 8.5,
			mass: 0.5,
			duration: 450,
			...this.props.transitionConfig,
			isInteraction: true,
			useNativeDriver : true,
		}
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
		)
	}

	_renderScene(transitionProps, prevProps) {
		const { position, scene } = transitionProps;
		const { index } = scene;
		// console.log('FluidTransitioner renderScene ' + index);

		let diff = 0;
		if(prevProps)
			diff = (index - prevProps.index);

		let opacity = 0.0;
		if(diff <= 1 && diff >= -1)
			opacity = position.interpolate({
				inputRange: [index - 1, index - 0.0001, index, index + 0.9999, index + 1],
				outputRange: [0, 1, 1, 1, 0],
			});

		const style = { opacity };
		const navigation = this._getChildNavigation(scene);

		const Scene = this.props.router.getComponentForRouteName(scene.route.routeName);

		return (
			<Animated.View
				key={transitionProps.scene.route.key}
				style={[style, styles.scene]}
			>
				<Scene navigation={navigation}/>
			</Animated.View>
		);
	}
	_getChildNavigation = (scene) => {
		if (!this._childNavigationProps)
			this._childNavigationProps = {};

		let navigation = this._childNavigationProps[scene.key];
		if (!navigation || navigation.state !== scene.route) {
			navigation = this._childNavigationProps[scene.key] = addNavigationHelpers({
				...this.props.navigation,
				state: scene.route
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
});

export default FluidTransitioner;
