import React from 'react';
import {
	View,
	StyleSheet,
	Easing,
	UIManager,
	InteractionManager,
	Animated,
	Platform,
	findNodeHandle,
	Dimensions
} from 'react-native';
import PropTypes from 'prop-types';

import TransitionItems from './TransitionItems';
import TransitionOverlayView from './TransitionOverlayView';

export default class TransitionItemsView extends React.Component {
	constructor(props) {
		super(props);

		this._sharedProgress = new Animated.Value(0);
		this._transitionProgress = new Animated.Value(0);
		this._hiddenProgress = new Animated.Value(0);
		this._transitionItems = new TransitionItems();

		this.state = { currentTransition: null };
		this._isMounted = false;
		this._overlay = null;
		this._fadeTransitionTime = 25;

		this._resolveMeasurePromise = null;
		this._resolveLayoutPromise = new Promise(resolve => this._resolveLayoutFunc = resolve);
	}

	_fadeTransitionTime
	_overlay
	_transitionItems
	
	_sharedProgress
	_hiddenProgress

	_transitionProgress
	_transitionProgressListener

	_resolveLayoutPromise
	_resolveLayoutFunc
	_resolveMeasurePromise
	_resolveMeasureFunc

	_isMounted
	_appearTransitionPromise
	_appearTransitionPromiseResolve
	_viewMetrics

	async onTransitionStart(props, prevProps, config) {

		// Wait for self layout
		await this._resolveLayoutPromise;

		// Setup wait promise for resolving measurement on new items	
		this._resolveMeasurePromise = new Promise(resolve => this._resolveMeasureFunc = resolve);

		console.log("");
		console.log("TransitionItemsView onTransitionStart");
		console.log("");

		// Get routes and direction
		const toRoute = props.scene.route.routeName;
		const fromRoute = prevProps ? prevProps.scene.route.routeName : "UNKNOWN";
		const direction = props.index > (prevProps ? prevProps.index : 9999) ? 1 : -1;

		this.setState({...this.state, fromRoute, toRoute});

		if(direction === 1)	
			await this._resolveMeasurePromise;

		// Get items in transition
		const sharedElements = this._transitionItems.getSharedElements(fromRoute, toRoute);
		const transitionElements = this._transitionItems.getTransitionElements(fromRoute, toRoute);
		
		if(sharedElements.length === 0 && transitionElements.length === 0){
			this._sharedProgress.setValue(1);			
			return;
		}

		console.log("TransitionItemsView onTransitionStart items measured");

		// Extend state with information about shared elements and appear elements
		this.setState({
			...this.state,
			sharedElements,
			transitionElements,
			config,
			progress: props.progress
		});

		if(sharedElements.length > 0){
			// We should now have the overlay ready
			await this.runAppearAnimation(1.0, config);
		}

		// Show all items - they should now have their initial values set correctly
		// to begin their transition
		this._hiddenProgress.setValue(1);

		// Start transitions: TODO: setup individual animation to handle delays
		// const { timing } = config;
		// delete config.timing;
		// timing(this._transitionProgress, {
		// 	toValue: 1.0,
		// 	...config
		// }).start();
	}

	async onTransitionEnd(props, prevProps, config) {
		await this.runAppearAnimation(0.0, config);
		this.resetState();		
	}

	resetState() {
		this.setState({
			...this.state, 
			sharedElements: null, 
			transitionElements: null, 
			config: null, 
			progress: null
		});
	}

	runAppearAnimation(toValue, config){

		console.log("TransitionItemsView runAppearAnimation " + toValue);

		// Run swap animation
		let swapAnimationDone = null;
		const swapPromise = new Promise((resolve, reject) =>
			swapAnimationDone = resolve);

		Animated.timing(this._sharedProgress, {
			toValue: toValue,
			duration: this._fadeTransitionTime,
			easing: Easing.linear,
			useNativeDriver : config.useNativeDriver,
		}).start(swapAnimationDone);

		return swapPromise;
	}

	render() {
		console.log("TransitionItemsView: render");
		return(
			<View
				style={styles.container}
				onLayout={this.onLayout.bind(this)}
				ref={(ref) => this._viewRef = ref}
			>
				{this.props.children}
				<TransitionOverlayView
					pairs={this.state.sharedElements}
					progress={this.state.progress}
				/>
			</View>
		);
	}

	onLayout(event) {
		const { x, y, width, height } = event.nativeEvent.layout;
		this._viewMetrics = { x, y, width, height };
		console.log("TransitionItemsView onLayout: x:" + x + " y:" + y + " w:" + width + " h:" + height);
		if(this._resolveLayoutFunc){
			this._resolveLayoutFunc();
			this._resolveLayoutFunc = null;
		}
	}

	metricsUpdated(name, route) {
		const { toRoute, fromRoute } = this.state;
		let sharedElements = [];
		if(fromRoute && toRoute)
			sharedElements = this._transitionItems.getSharedElements(fromRoute, toRoute);

		const transitionElements = this._transitionItems.getTransitionElements(fromRoute, toRoute);

		for(let i=0; i<sharedElements.length; i++)
			if(!sharedElements[i].fromItem.metrics || !sharedElements[i].toItem.metrics)
				return;

		for(let i=0; i<transitionElements.length; i++)
			if(!transitionElements[i].metrics)
				return;

		if(this._resolveMeasureFunc)
			this._resolveMeasureFunc();
	}

	getIsSharedElement(name, route) {
		if(this.state.sharedElements){
			return this.state.sharedElements.findIndex(pair => 
				(pair.fromItem.name === name && pair.fromItem.route === route) ||
				(pair.toItem.name === name && pair.toItem.route === route)
			) > -1;
		}
		return false;
	}
	
	getIsTransitionElement(name, route) {
		if(this.state.transitionElements){
			return this.state.transitionElements.findIndex(item => 
				item.name === name && item.route === route) > -1;
		}
		return false;
	}

	async updateMetrics(name, route, view){
		await this._resolveLayoutPromise;		
		const parentNodeHandle = findNodeHandle(this._viewRef);
		const nodeHandle = findNodeHandle(view);
		const self = this;
		let resolveFunc;
		const promise = new Promise(resolve => resolveFunc = resolve);		
		UIManager.measureLayout(nodeHandle, parentNodeHandle, ()=> {
			console.log("FAIL");
		}, (x, y, width, height) => {
			const metrics = {x, y, width, height };
			if(self._transitionItems.updateMetrics(name, route, metrics))
				self.metricsUpdated();

			resolveFunc(metrics);
		});	

		return promise;
	}

	shouldComponentUpdate(nextProps, nextState) {
		return this.state != nextState;
	}

	componentDidMount() {
		this._isMounted = true;
	}

	componentWillUnmount() {
		this._isMounted = false;
	}

	static childContextTypes = {
		register: PropTypes.func,
		unregister: PropTypes.func,
		updateMetrics: PropTypes.func,
		sharedProgress: PropTypes.object,
		hiddenProgress: PropTypes.object,
		transitionProgress: PropTypes.func,
		getIsSharedElement: PropTypes.func,
		getIsTransitionElement: PropTypes.func,
	}

	getChildContext() {
		const self = this;
		return {
			register: (item) => this._transitionItems.add(item),
			unregister: (name, route) => this._transitionItems.remove(name, route),
			updateMetrics: this.updateMetrics.bind(this),
			sharedProgress: this._sharedProgress,
			hiddenProgress: this._hiddenProgress,
			transitionProgress: ()=> this.state.progress,
			getIsSharedElement: this.getIsSharedElement.bind(this),
			getIsTransitionElement: this.getIsTransitionElement.bind(this)
		};
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	}
});
