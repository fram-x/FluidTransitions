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
		this._hiddenProgress = new Animated.Value(1);
		this._transitionItems = new TransitionItems();
		this._transitionConfig = {};

		this._isMounted = false;
		this._overlayView = null;
		this._fadeTransitionTime = 50;
		this._delayTransitionTime = 80;
		this._itemsToMeasure = [];
	}

	_fadeTransitionTime
	_delayTransitionTime

	_overlayView

	_transitionItems

	_transitionConfig

	_sharedProgress
	_hiddenProgress

	_transitionProgress
	_transitionProgressListener

	_ownAnimationsPromise

	_isMounted
	_appearTransitionPromise
	_appearTransitionPromiseResolve

	_itemsToMeasure

	async onTransitionStart(props, prevProps, config) {

		// console.log("TransitionItemsView onTransitionStart");
		let ownAnimationsResolve;
		this._ownAnimationsPromise = new Promise(resolve => ownAnimationsResolve = resolve);

		// Get the rest of the data required to run a transition
		const toRoute = props.scene.route.routeName;
		const fromRoute = prevProps ? prevProps.scene.route.routeName : "UNKNOWN";
		const direction = props.index > (prevProps ? prevProps.index : 9999) ? 1 : -1;
		const sharedElements = this._transitionItems.getSharedElements(fromRoute, toRoute);
		const transitionElements = this._transitionItems.getTransitionElements(fromRoute, toRoute);

		// If we're appearing and there are no appear transition, lets just bail out.
		if(!prevProps && transitionElements.length === 0) {
			console.log("TransitionItemsView onTransitionStart skipping. No transitions.");
			return;
		}

		// Configure animations
		const animations = this.configureAnimations(transitionElements, props.progress, config)

		this._transitionConfig = {
			fromRoute, toRoute, sharedElements, transitionElements, direction, config
		};

		if(sharedElements.length === 0 && transitionElements.length === 0){
			console.log("TransitionItemsView onTransitionStart skip transitions.");
			return false;
		}

		// wait for layouts in child elements
		if(this._itemsToMeasure.length > 0) {
			await this.measureItems(sharedElements, transitionElements);
			this._itemsToMeasure = [];
		}
		else
			await this.resolveLayouts(sharedElements, transitionElements, prevProps === null);

		// Force update the overlay
		if(this._overlayView)
			this._overlayView.setTransitionConfig({sharedElements,
				progress: props.progress,
				direction}
		);

		// Lets fade in the overlay
		await this.runAppearAnimation(this._sharedProgress, 1.0, config);

		this._transitionConfig.sharedElements.forEach(pair => {
			pair.fromItem.reactElement.beginTransition();
			pair.toItem.reactElement.beginTransition();
		});

		this._transitionConfig.transitionElements.forEach(item =>
			item.reactElement.beginTransition());

		await this.runAppearAnimation(this._hiddenProgress, 0.0, config);

		// Show all items - they should now have their initial values set correctly
		// to begin their transition
		if(animations.length > 0){
			// Start transitions: setup individual animation to handle delays
			Animated.parallel(animations).start(ownAnimationsResolve);
			const delayTime = transitionElements.reduce((accumulator, item) =>
				accumulator + (item.delay ? this._delayTransitionTime : 0), 0);

			if(direction === -1) {
				await new Promise(resolve => setTimeout(resolve, delayTime));
			}

		}
		else{
			ownAnimationsResolve();
		}

		return true;
	}

	async onTransitionEnd(props, prevProps, config) {
		await this._ownAnimationsPromise;
		if(this._transitionConfig.toRoute && this._transitionConfig.fromRoute){

			this._transitionConfig.sharedElements.forEach(pair => {
				pair.fromItem.reactElement.endTransition();
				pair.toItem.reactElement.endTransition();
			});

			this._transitionConfig.transitionElements.forEach(item =>
				item.reactElement.endTransition());

			await this.runAppearAnimation(this._hiddenProgress, 1.0, config);
			await this.runAppearAnimation(this._sharedProgress, 0.0, config);

			this._transitionConfig = {
				toRoute: null,
				fromRoute: null,
				sharedElements: null,
				transitionElements: null,
				config: null,
				progress: null
			};

			if(this._overlayView)
				this._overlayView.setTransitionConfig({});

			this._itemsToMeasure = [];
		}
	}

	configureAnimations(transitionElements, progress, config){
		const hasDelayedAnimations = transitionElements.find(e => e.delay);
		if(!hasDelayedAnimations){
			transitionElements.forEach(item => item.progress = progress);
			return [];
		}

		const transitionConfig = {...config};
		const { timing } = transitionConfig;
		delete transitionConfig.timing;

		// Create animations
		const animations = [];
		let index = 0;
		transitionElements.forEach(item => {
			item.progress = new Animated.Value(0);
			const animation = timing(item.progress, {
				...transitionConfig,
				toValue: 1.0,
				delay: item.delay ? index * this._delayTransitionTime : 0,
			});
			if(item.delay) index++;
			animations.push(animation);
		});

		return animations;
	}

	runAppearAnimation(progress, toValue, config){
		return swapPromise = new Promise(resolve => {
			Animated.timing(progress, {
				toValue: toValue,
				duration: this._fadeTransitionTime,
				easing: Easing.linear,
				useNativeDriver : config.useNativeDriver,
			}).start(resolve);
		});
	}

	render() {
		return(
			<View style={styles.container} ref={(ref) => this._viewRef = ref}>
				{this.props.children}
				<TransitionOverlayView ref={(ref) => this._overlayView = ref} />
			</View>
		);
	}

	async resolveLayouts(sharedElements, transitionElements, appear = false) {
		if(this._transitionConfig.direction !== -1 || appear) {
			await this.measureItems(sharedElements, transitionElements);
		}
	}

	layoutReady(name, route) {
		const sharedElements = this._transitionItems.getSharedElements(
			this._transitionConfig.fromRoute, this._transitionConfig.toRoute);

		const transitionElements = this._transitionItems.getTransitionElements(
			this._transitionConfig.fromRoute, this._transitionConfig.toRoute);

		const item = this._transitionItems.getItemByNameAndRoute(name, route);
		if(!item){
			// a stray element that will be removed - lets just bail out
			return;
		}

		if(sharedElements.length === 0 && transitionElements.length === 0) {
			this._itemsToMeasure.push(item);
			return;
		}

		item.layoutReady = true;
	}

	async measureItems(sharedElements, transitionElements) {
		let viewMetrics = {};
		const nodeHandle = findNodeHandle(this._viewRef);

		const promise = new Promise(resolve => {
			UIManager.measureInWindow(nodeHandle, (x, y, width, height) => {
				viewMetrics = {x, y, width, height };
				resolve();
			});
		});

		await promise;

		if(sharedElements) {
			for(let i=0; i<sharedElements.length; i++){
				const pair = sharedElements[i];
				await this.measureItem(viewMetrics, pair.fromItem, nodeHandle);
				await this.measureItem(viewMetrics, pair.toItem, nodeHandle);
			}
		}

		if(transitionElements) {
			for(let i=0; i<transitionElements.length; i++){
				await this.measureItem(viewMetrics, transitionElements[i], nodeHandle);
			}
		}
	}

	async measureItem(viewMetrics, item, parentNodeHandle){
		if(item.metrics)
			return;

		const self = this;
		return new Promise((resolve, reject) => {
			UIManager.measureInWindow(item.reactElement.getNodeHandle(), (x, y, width, height) => {
				item.metrics = {x: x - viewMetrics.x, y: y - viewMetrics.y, width, height };
				resolve();
			});
		});
	}

	getMetrics(name, route) {
		const item = this._transitionItems.getItemByNameAndRoute(name, route);
		return item.metrics;
	}

	getDirection(name, route) {
		if(!this._transitionConfig.fromRoute)
			return 0;

		if(route === this._transitionConfig.fromRoute)
			return -1;
		else
			return 1;
	}

	getReverse(route) {
		return route === this._transitionConfig.fromRoute;
	}

	getIsSharedElement(name, route) {
		if(this._transitionConfig.sharedElements){
			return this._transitionConfig.sharedElements.findIndex(pair =>
				(pair.fromItem.name === name && pair.fromItem.route === route) ||
				(pair.toItem.name === name && pair.toItem.route === route)
			) > -1;
		}
		return false;
	}

	getIsTransitionElement(name, route) {
		const item = this._transitionItems.getItemByNameAndRoute(name, route);
		return item && item.appear && !this.getIsSharedElement(name, route);
	}

	getTransitionProgress(name, route) {
		const item = this._transitionItems.getItemByNameAndRoute(name, route);
		if(item)
			return item.progress;

		return null;
	}

	_lastChildCount;
	shouldComponentUpdate(nextProps, nextState) {
		const retVal =  nextProps.children.length !== this._lastChildCount;
		this._lastChildCount = nextProps.children.length;
		return retVal;
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
		getDirection: PropTypes.func,
		getReverse: PropTypes.func,
		sharedProgress: PropTypes.object,
		hiddenProgress: PropTypes.object,
		getTransitionProgress: PropTypes.func,
		getIsSharedElement: PropTypes.func,
		getIsTransitionElement: PropTypes.func,
		layoutReady: PropTypes.func,
		getMetrics: PropTypes.func
	}

	getChildContext() {
		const self = this;
		return {
			register: (item) => this._transitionItems.add(item),
			unregister: (name, route) => this._transitionItems.remove(name, route),
			sharedProgress: this._sharedProgress,
			hiddenProgress: this._hiddenProgress,
			getDirection: this.getDirection.bind(this),
			getReverse: this.getReverse.bind(this),
			getTransitionProgress: this.getTransitionProgress.bind(this),
			getIsSharedElement: this.getIsSharedElement.bind(this),
			getIsTransitionElement: this.getIsTransitionElement.bind(this),
			layoutReady: this.layoutReady.bind(this),
			getMetrics: this.getMetrics.bind(this),
		};
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	}
});
