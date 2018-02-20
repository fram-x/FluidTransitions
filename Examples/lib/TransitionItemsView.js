import React from 'react';
import { View, StyleSheet, Easing, Animated } from 'react-native';
import PropTypes from 'prop-types';

import TransitionItems from './TransitionItems';

export default class TransitionItemsView extends React.Component {
	constructor(props) {
		super(props);
		this._progress = new Animated.Value(0);
		this._progressDirection = new Animated.Value(0);
		this._transitionItems = new TransitionItems(
			newState => this.setState({...this.state, ...newState}),
			_ => this.state);

		this.state = { currentTransition: null };
		this._inTransition = false;
	}
	_transitionItems
	_progress
	_progressDirection
	_layoutDoneResolve
	_inTransition
	async onTransitionStart(props, prevProps, config) {

		this._inTransition = true;

		// Calling set state here ensures we re-render and generate all the
		// shared elements
		this.setState({...this.state, currentTransition: {props, prevProps}});
		await new Promise((resolve, reject) => this._layoutDoneResolve = resolve);

		// Run swap animation
		let swapAnimationDone = null;
		const swapPromise = new Promise((resolve, reject) =>
			swapAnimationDone = resolve);

		// Begin swap animation on shared elements - they are faded in
		this._progress.setValue(0);

		Animated.timing(this._progress, {
			toValue: 1.0,
			duration: 25,
			easing: Easing.linear,
			useNativeDriver : config.useNativeDriver
		}).start(swapAnimationDone);

		return swapPromise;
	}
	onTransitionEnd(props, prevProps, config) {
		// Begin swap animation on shared elements - they are faded in
		Animated.timing(this._progress, {
			toValue: 0.0,
			duration: 25,
			easing: Easing.linear,
			useNativeDriver : config.useNativeDriver
		}).start(()=> {
			this._inTransition = false;
			this.setState({currentTransition: null});
		});
	}

	render() {
		const overlay = this.renderOverlay();
		return(
			<Animated.View style={[this.props.style]} onLayout={this.onLayout.bind(this)}>
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
				opacity: this._progress.interpolate({
					inputRange: [0, 0.5, 0.5, 1],
					outputRange: [0, 0, 1, 1],
				}),
			};
			const element = fromItem.getReactElement();
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

		for(let i=0; i<itemsToMeasure.length; i++){
			const item = itemsToMeasure[i];
			const metrics = await item.measure();
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
			transform: [{ translateX }, { translateY }, { scaleX }, { scaleY }]
		}];
	}
	static childContextTypes = {
		register: PropTypes.func,
		unregister: PropTypes.func,
		progress: PropTypes.object,
		progressDirection: PropTypes.object
	}
	shouldComponentUpdate(nextProps, nextState) {
		return this.state != nextState;
	}
	getChildContext() {
		return {
			register: (item) => this._transitionItems.add(item),
			unregister: (item) => this._transitionItems.remove(item),
			progress: this._progress,
			progressDirection: this._progressDirection
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