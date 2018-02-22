import React from 'react';
import { View, StyleSheet, Easing, InteractionManager, Animated, findNodeHandle } from 'react-native';
import PropTypes from 'prop-types';

import TransitionItems from './TransitionItems';

export default class TransitionItemsView extends React.Component {
	constructor(props) {
		super(props);

		this._appearProgress = new Animated.Value(0);
		this._transitionProgress = new Animated.Value(0);
		this._transitionItems = new TransitionItems(
			newState => this._isMounted ? this.setState({...this.state, ...newState}) : 0,
			_ => this.state);

		this.state = { currentTransition: null };
		this._inTransition = false;
		this._isMounted = false;
	}
	_transitionItems
	_appearProgress
	_transitionProgress
	_layoutDoneResolve
	_inTransition
	_isMounted
	_viewReference
	_appearTransitionPromise
	_appearTransitionPromiseDone

	async onTransitionStart(props, prevProps, config) {
		this._inTransition = true;

		// Set up promise to wait for layout cycles.
		const promise = new Promise((resolve, reject) => this._layoutDoneResolve = resolve);

		// Calling set state here ensures we re-render and generate all the
		// shared elements
		this.setState({...this.state, currentTransition: {props, prevProps}});
		await promise;

		// Run swap animation
		let swapAnimationDone = null;
		const swapPromise = new Promise((resolve, reject) =>
			swapAnimationDone = resolve);

		// Begin appear transitions for elements not in shared
		const fromRoute = props.scene.route.routeName;
		const toRoute = prevProps.scene.route.routeName;
		await this.beginAppearTransitions(props.index, prevProps.index, fromRoute, toRoute, config);

		// Begin swap animation on shared elements - they are faded in
		this._appearProgress.setValue(0);

		Animated.timing(this._appearProgress, {
			toValue: 1.0,
			duration: 25,
			easing: Easing.linear,
			useNativeDriver : config.useNativeDriver
		}).start(swapAnimationDone);

		await swapPromise;

	}

	async onTransitionEnd(props, prevProps, config) {

		if(this._appearTransitionPromise)
			await this._appearTransitionPromise;

		// End swap animation on shared elements - they are faded in
		Animated.timing(this._appearProgress, {
			toValue: 0.0,
			duration: 25,
			easing: Easing.linear,
			useNativeDriver : config.useNativeDriver
		}).start(()=> {
			this._inTransition = false;
			this.setState({currentTransition: null});
		});
	}

	async beginAppearTransitions(index, prevIndex, fromRoute, toRoute, config, waitForInteractions = false) {
		if(waitForInteractions){
			// Set up promise to wait for layout cycles.
			const promise = new Promise((resolve, reject) => this._layoutDoneResolve = resolve);
			await promise;
		}
		
		this._appearTransitionPromise = new Promise((resolve, reject) =>
			this._appearTransitionPromiseDone = resolve);

		const animations = [];
		let delayIndex = 0;

		const start = index > prevIndex ? 0 : 1;
		const end = index > prevIndex ? 1 : 0;
		this._transitionProgress.setValue(start);
		const startRoute = start > end ? fromRoute : toRoute;
		const endRoute = start < end ? fromRoute : toRoute;

		if(start < end){
			delayIndex = this.beginAppearTransitionsForRoute(startRoute, 
				animations, delayIndex, end, start, config);

			delayIndex = this.beginAppearTransitionsForRoute(endRoute, 
				animations, delayIndex, start, end, config);
		}
		else {
			delayIndex = this.beginAppearTransitionsForRoute(endRoute, 
				animations, delayIndex, start, end, config);

			delayIndex = this.beginAppearTransitionsForRoute(startRoute, 
				animations, delayIndex + 1, end, start, config);
	
		}

		const self = this;
		const runAnimations = ()=> {
			Animated.parallel(animations).start(() => {
				if(self._appearTransitionPromiseDone)
					self._appearTransitionPromiseDone();

				self._appearTransitionPromiseDone = null;
				self._appearTransitionPromise = null;
			});
		};

		if(waitForInteractions)
			InteractionManager.runAfterInteractions(runAnimations);
		else
			runAnimations();

		// If moving back - wait for half of the delay before committing
		// to the final transition.
		if(index < prevIndex)
			return new Promise((resolve, reject)=>
				setTimeout(resolve, delayIndex * 40));
	}

	beginAppearTransitionsForRoute(route, animations, delayIndex, start, end, config){
		const appearElements = this._transitionItems.getAppearElements(route);
		let index = delayIndex;
		transitionSpec = {...config};
		const { timing } = transitionSpec;
		delete transitionSpec.timing;
		
		for(let i=0; i<appearElements.length; i++){
			const item = appearElements[i];
			const animation = item.reactElement.getAnimation({
				start, 
				end, 
				delay: index * 75, 
				timing, 
				config: transitionSpec, 
				metrics: item.metrics
			});

				index++;
			animations.push(animation);
		}

		return index;
	}

	render() {
		const overlay = this.renderOverlay();
		return(
			<Animated.View
				style={[this.props.style]}
				onLayout={this.onLayout.bind(this)}
				ref={ref => this._viewReference = ref}
			>
				{this.props.children}
				{overlay}
			</Animated.View>
		);
	}
	renderOverlay() {
		if(!this.state.currentTransition)
			return;

		const { props, prevProps } = this.state.currentTransition;
		const fromRoute = prevProps ? prevProps.scene.route.routeName : 'unknownRoute';
		const toRoute = props.scene.route.routeName;

		const pairs = this._transitionItems.getMeasuredItemPairs(fromRoute, toRoute);
		const self = this;

		const sharedElements = pairs.map((pair, idx) => {
			const {fromItem, toItem} = pair;

			const animatedStyle = this._getAnimatedStyle(props.progress, fromItem, toItem);
			const swapStyle = {
				opacity: this._appearProgress.interpolate({
					inputRange: [0, 0.5, 0.5, 1],
					outputRange: [0, 0, 1, 1],
				}),
			};
			let element = fromItem.getReactElement();
			if(element.type.name === 'Button')
				element = (<View>{element}</View>);

			const AnimatedComp = Animated.createAnimatedComponent(element.type);

			const sharedElement = React.createElement(AnimatedComp,
				{ ...element.props, style: [element.props.style, animatedStyle, swapStyle], key: idx },
				element.props.children);

			return sharedElement;
		});

		return (
			<Animated.View
				style={[styles.overlay]}
				onLayout={this.onLayout.bind(this)}
			>
				{sharedElements}
			</Animated.View>
		);
	}
	async onLayout() {
		const itemsToMeasure = this._transitionItems.getItemsToMeasure();
		const toUpdate = [];
		const viewNodeHandle = findNodeHandle(this._viewReference);
		for(let i=0; i<itemsToMeasure.length; i++){
			const item = itemsToMeasure[i];
			const metrics = await item.measure(viewNodeHandle);
			toUpdate.push({ name: item.name, route: item.route, metrics });
		};

		if (toUpdate.length > 0) {
			this._transitionItems.updateMetrics(toUpdate);
		}
		this._layoutResolved();
	}
	_layoutResolved() {
		if(this._layoutDoneResolve) {
			this._layoutDoneResolve();
			this._layoutDoneResolve = null;
		}
	}
	_getAnimatedStyle(progress, itemFrom, itemTo) {
		const toVsFromScaleX = itemTo.scaleRelativeTo(itemFrom).x;
		const toVsFromScaleY = itemTo.scaleRelativeTo(itemFrom).y;

		const scaleX = progress.interpolate({
			inputRange: [0, 1],
			outputRange: [1, toVsFromScaleX],
		});

		const scaleY = progress.interpolate({
			inputRange: [0, 1],
			outputRange: [1, toVsFromScaleY],
		});

		const translateX = progress.interpolate({
			inputRange: [0, 1],
			outputRange: [itemFrom.metrics.x, itemTo.metrics.x +
				itemFrom.metrics.width/2 * (toVsFromScaleX-1)],
		});

		const translateY = progress.interpolate({
			inputRange: [0, 1],
			outputRange: [itemFrom.metrics.y, itemTo.metrics.y +
				itemFrom.metrics.height/2 * (toVsFromScaleY-1)],
		});

		return [styles.sharedElement, {
			width: itemFrom.metrics.width,
			height: itemFrom.metrics.height,
			transform: [{ translateX }, { translateY }, { scaleX }, { scaleY }]
		}];
	}
	static childContextTypes = {
		register: PropTypes.func,
		unregister: PropTypes.func,
		appearProgress: PropTypes.object,
		transitionProgress: PropTypes.object,
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
	getChildContext() {
		return {
			register: (item) => this._transitionItems.add(item),
			unregister: (name, route) => this._transitionItems.remove(name, route),
			appearProgress: this._appearProgress,
			transitionProgress: this._transitionProgress,
		};
	}
}

const styles = StyleSheet.create({
	overlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
	},
	sharedElement: {
		position: 'absolute',
		// borderColor: '#34CE34',
		// borderWidth: 2,
		margin: 0,
		left: 0,
		top: 0,
	}
});