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
		this._itemsToMeasure = [];
	}

	_fadeTransitionTime

	_overlayView

	_transitionItems

	_transitionConfig

	_sharedProgress
	_hiddenProgress

	_transitionProgress
	_transitionProgressListener

	// _resolveChildLayoutPromise
	// _resolveChildLayoutFunc

	_isMounted
	_appearTransitionPromise
	_appearTransitionPromiseResolve

	_itemsToMeasure

	async onTransitionStart(props, prevProps, config) {

		console.log("TransitionItemsView onTransitionStart");
		
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

		this._transitionConfig = {
			fromRoute, toRoute, sharedElements, transitionElements, direction, config,
			progress: props.progress
		};

		if(sharedElements.length === 0 && transitionElements.length === 0){
			console.log("TransitionItemsView onTransitionStart skip transitions.");
			return false;
		}

		console.log("TransitionItemsView onTransitionStart se:" + sharedElements.length +
			", t:" + transitionElements.length);

		// wait for layouts in child elements
		if(this._itemsToMeasure.length > 0) {
			await this.measureItems(sharedElements, transitionElements);
			this._itemsToMeasure = [];
		}
		else
			await this.resolveLayouts(sharedElements, transitionElements, prevProps === null);

		// Lets update the overlay
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

		this._transitionConfig.transitionElements.forEach(item => item.reactElement.beginTransition());

		await this.runAppearAnimation(this._hiddenProgress, 0.0, config);

		// Show all items - they should now have their initial values set correctly
		// to begin their transition
		// this._hiddenProgress.setValue(1);

		// Start transitions: TODO: setup individual animation to handle delays
		// const { timing } = config;
		// delete config.timing;
		// timing(this._transitionProgress, {
		// 	toValue: 1.0,
		// 	...config
		// }).start();
		return true;
	}

	async onTransitionEnd(props, prevProps, config) {
		// console.log("TransitionItemsView onTransitionEnd");
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

	runAppearAnimation(progress, toValue, config){
		let swapAnimationDone = null;
		const swapPromise = new Promise((resolve, reject) =>
			swapAnimationDone = resolve);

		Animated.timing(progress, {
			toValue: toValue,
			duration: this._fadeTransitionTime,
			easing: Easing.linear,
			useNativeDriver : config.useNativeDriver,
		}).start(swapAnimationDone);

		return swapPromise;
	}

	render() {
		// console.log("TransitionItemsView: render");
		return(
			<View
				onLayout={this.onLayout.bind(this)}
				style={styles.container}
				ref={(ref) => this._viewRef = ref}
			>
				{this.props.children}
				<TransitionOverlayView
					ref={(ref) => this._overlayView = ref}
					onLayout={this.onOverlayLayout.bind(this)}
				/>
			</View>
		);
	}

	onOverlayLayout() {
		// console.log("TransitionItemsView onOverlaylayout");
	}

	async resolveLayouts(sharedElements, transitionElements, appear = false) {
		if(this._transitionConfig.direction !== -1 || appear)
		{
			// console.log("TransitionItemsView onTransitionStart wait for child layout callbacks...");
			// await new Promise(resolve => this._resolveChildLayoutFunc = resolve);
			// console.log("TransitionItemsView onTransitionStart begin items measure...");
			await this.measureItems(sharedElements, transitionElements);
			// console.log("TransitionItemsView onTransitionStart items measure done");
		}
	}

	onLayout() {
		// console.log("TransitionItemsView onLayout");
	}

	layoutReady(name, route) {
		// console.log("TransitionItemsView layoutReady " + name + ", " + route);
		const sharedElements = this._transitionItems.getSharedElements(
			this._transitionConfig.fromRoute, this._transitionConfig.toRoute);

		const transitionElements = this._transitionItems.getTransitionElements(
			this._transitionConfig.fromRoute, this._transitionConfig.toRoute);

		const item = this._transitionItems.getItemByNameAndRoute(name, route);
		if(!item){
			// a stray element that will be removed - lets just bail out
			//console.log("TransitionItemsView layoutReady bailing out. No item found " + name + ", " + route);
			return;
		}		
	
		if(sharedElements.length === 0 && transitionElements.length === 0) {
			// console.log("TransitionItemsView layoutReady bailing out. No items in transition.");
			this._itemsToMeasure.push(item);
			return;
		}		

		item.layoutReady = true;

		// // resolve layout read
		// for(let i=0; i<sharedElements.length; i++){
		// 	if(!sharedElements[i].fromItem.layoutReady)
		// 		return;

		// 	if(!sharedElements[i].toItem.layoutReady)
		// 		return;
		// }
		// for(let i=0; i<transitionElements.length; i++)
		// 	if(!transitionElements[i].layoutReady)
		// 		return;

		// if(this._resolveChildLayoutFunc){
		// 	this._resolveChildLayoutFunc();
		// 	this._resolveChildLayoutFunc = null;
		// }
	}

	async measureItems(sharedElements, transitionElements) {
		let resolveFunc;
		let viewMetrics = {};
		const promise = new Promise(resolve => resolveFunc = resolve);
		const nodeHandle = findNodeHandle(this._viewRef);
		UIManager.measureInWindow(nodeHandle, (x, y, width, height) => {
			viewMetrics = {x, y, width, height };
			resolveFunc();
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
			// console.log("TransitionItemsView measureItem " + item.name + ", " + item.route);
			UIManager.measureInWindow(item.reactElement.getNodeHandle(), (x, y, width, height) => {
				// console.log("TransitionItemsView measureItem success " + item.name + ", " + item.route);
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
		if(route === this._transitionConfig.toRoute)
			return 1;
		else
			return -1;
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

	_lastChildCount;
	shouldComponentUpdate(nextProps, nextState) {
		const retVal = nextProps.children.length !== this._lastChildCount;
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
		transitionProgress: PropTypes.func,
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
			transitionProgress: ()=> this._transitionConfig.progress,
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
