import React from 'react';
import { Button, View, Animated, StyleSheet, findNodeHandle } from 'react-native';
import PropTypes from 'prop-types';

import TransitionItem from './TransitionItem';

import ScaleTransition from './Transitions/ScaleTransitions';
import TopTransition from './Transitions/TopTransition';
import BottomTransition from './Transitions/BottomTransition';
import LeftTransition from './Transitions/LeftTransition';
import RightTransition from './Transitions/RightTransition';
import HorizontalTransition from './Transitions/HorizontalTransition';
import VerticalTransition from './Transitions/VerticalTransition';

let uniqueBaseId = `transitionCompId-${Date.now()}`;
let uuidCount = 0;

const transitionTypes = [];
export function registerTransitionType(name, transitionClass) {
	transitionTypes.push({name, transitionClass})
}

registerTransitionType("scale", ScaleTransition);
registerTransitionType("top", TopTransition);
registerTransitionType("bottom", BottomTransition);
registerTransitionType("left", LeftTransition);
registerTransitionType("right", RightTransition);
registerTransitionType("horizontal", HorizontalTransition);
registerTransitionType("vertical", VerticalTransition);

class Transition extends React.Component {
	constructor(props, context){
		super(props, context);
		this._name = `${uniqueBaseId}-${uuidCount++}`;
		this._transitionHelper = null;

		this._isInTransition = false;
		this._forceUpdate = false;
	}

	_name
	_route
	_isMounted
	_transitionHelper
	_viewRef

	_forceUpdate
	_isInTransition

	beginTransition() {
		this._isInTransition = true;
		this._forceUpdate = true;
		if(this._isMounted)
			this.forceUpdate();
	}

	endTransition() {
		this._isInTransition = false;
		this._forceUpdate = true;
		if(this._isMounted)
			this.forceUpdate();
	}

	render() {
				
		// Get child
		let element = React.Children.only(this.props.children);
		let elementProps = element.props;
		let animatedComp;
		let child = null;

		if(element.type.displayName === 'Image')
			console.log("TransitionView render IMAGE " + this._getName() + " " + this._route);

		// Wrap buttons to be able to animate them
		if(element.type.name==='Button'){
			element = React.createElement(element.type, {...element.props, collapsable: false});
			const wrapper = (<View>{element}</View>);
			elementProps = {};
			animatedComp = Animated.createAnimatedComponent(wrapper.type);
			child = element;
		}
		else
		{
			// Convert to animated component
			animatedComp = Animated.createAnimatedComponent(element.type);
		}

		// Build styles
		const style =  [elementProps.style];
		const appearStyle = this.getAppearStyle();
		const transitionStyle = this.getTransitionStyle();

		const props = {
			...elementProps,
			onLayout: this.onLayout.bind(this),
			collapsable: false,
			style: [style, transitionStyle, appearStyle, styles.transitionElement],
			ref: (ref) => this._viewRef = ref
		};

		if(child)
			return React.createElement(animatedComp, props, child);

		return React.createElement(animatedComp, props);
	}

	getTransitionStyle() {
		const { hiddenProgress, getIsSharedElement, getMetrics, getDirection, getReverse } = this.context;
		if(!getIsSharedElement && !getMetrics && !getDirection && !getReverse) return { };

		if(this._isInTransition && this.context.transitionProgress()){
			const metrics = getMetrics(this._getName(), this._route);
			const transitionHelper = this.getTransitionHelper(this.props.appear);

			if(transitionHelper){
				const direction = getDirection(this._getName(), this._route);
				const transitionConfig = {
					progress: this.context.transitionProgress(),
					direction,
					metrics: metrics,
					start: direction === 1 ? 0 : 1,
					end: direction === 1 ? 1 : 0,
					reverse: getReverse(this._route)
				};
				return transitionHelper.getTransitionStyle(transitionConfig);
			}
		}
		return {};
	}

	getAppearStyle() {
		const { getIsSharedElement, hiddenProgress } = this.context;
		if(!getIsSharedElement || !hiddenProgress) return { };

		if(getIsSharedElement(this._getName(), this._route)) {
			const interpolator = hiddenProgress.interpolate({
				inputRange: [0, 1],
				outputRange: [0, 1],
			});
			return { opacity: interpolator };
		}

		// return { };
	}

	shouldComponentUpdate(nextProps, nextState){
		const retVal = this._forceUpdate;
		this._forceUpdate = false;
		return retVal;
	}

	getNodeHandle() {
		return findNodeHandle(this._viewRef);
	}

	async onLayout(event) {
		// console.log("TransitionView onLayout " + this._getName() + ", " + this._route);
		const { layoutReady } = this.context;
		if(!layoutReady) return;
		layoutReady(this._getName(), this._route);
	}

	_getName(){
		if(this.props.shared)
			return this.props.shared;
		return this._name;
	}

	getTransitionHelper(appear){
		if(this._transitionHelper === null) {
			if(appear){
				const transitionType = transitionTypes.find(e => e.name === appear);
				if(transitionType)
					this._transitionHelper = new transitionType.transitionClass();
			}
		}
		return this._transitionHelper;
	}

	componentWillMount() {
		const register = this.context.register;
		if(register) {
			this._route = this.context.route;
			register(new TransitionItem(this._getName(), this.context.route,
				this, this.props.shared !== undefined, this.props.appear !== undefined,
				this.props.nodelay !== undefined));
		}
	}

	componentDidMount() {
		this._isMounted = true;
	}

	componentWillUnmount() {
		this._isMounted = false;
		const unregister = this.context.unregister;
		if(unregister) {
			unregister(this._getName(), this._route);
		}
	}

	static contextTypes = {
		register: PropTypes.func,
		unregister: PropTypes.func,
		route: PropTypes.string,
		sharedProgress: PropTypes.object,
		hiddenProgress: PropTypes.object,
		transitionProgress: PropTypes.func,
		getIsSharedElement: PropTypes.func,
		getIsTransitionElement: PropTypes.func,
		getDirection: PropTypes.func,
		getReverse: PropTypes.func,
		layoutReady: PropTypes.func,
		getMetrics: PropTypes.func,
	}
}

const styles = StyleSheet.create({
	transitionElement: {
		// borderColor: '#FF0000',
		// borderWidth: 1,
	}
});

export default Transition;
