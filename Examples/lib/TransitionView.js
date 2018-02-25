import React from 'react';
import { View, Animated, UIManager, findNodeHandle } from 'react-native';
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

class Transition extends React.Component {
	constructor(props, context){
		super(props, context);
		this._name = `${uniqueBaseId}-${uuidCount++}`;
		this._transitionHelper = null;
	}

	_name
	_route
	_isMounted
	_transitionHelper

	render() {
		let element = React.Children.only(this.props.children);
		console.log("TransitionView render " + (element.type ? element.type.displayName : "UNKNOWN"));
		if(element.type.name==='Button')
			element = (<View>{element}</View>);

		const animatedComp = Animated.createAnimatedComponent(element.type);

		const style =  [element.props.style];
		const appearStyle = this.getAppearStyle();
		const transitionStyle = this.getTransitionStyle();

		const props = {
			...element.props,
			onLayout: this.onLayout.bind(this),
			collapsable: false,
			style: [style, appearStyle, transitionStyle],
			ref: (ref) => this._viewRef = ref
		};

		return React.createElement(animatedComp, props);
	}

	getTransitionStyle() {
		// const { getIsTransitionElement } = this.context;
		// if(!getIsTransitionElement)
		// 	return {};

		// if(!getIsTransitionElement(this._getName(), this._route))
		// 	return {};		

		const transitionHelper = this.getTransitionHelper(this.props.appear);
		if(transitionHelper){
			const transitionConfig = { progress: this.context.transitionProgress };
			console.log("TransitionView render with " + transitionHelper);
			return transitionHelper.getTransitionStyle(transitionConfig);
		}

		return {};
	}

	getAppearStyle() {
		const { getIsSharedElement, getIsTransitionElement } = this.context;

		if(getIsSharedElement(this._getName(), this._route)) {
			// Check if we are part of a shared elements
			const interpolator = this.context.appearProgress.interpolate({
				inputRange: [0, 0.5, 0.5, 1],
				outputRange: [1, 1, 0, 0],
			});
			return { opacity: interpolator };
		}

		return { };
	}

	onLayout(event) {
		const self = this;
		const { updateMetrics } = self.context;
		if(!updateMetrics) return;
		if(this._isMounted)
			updateMetrics(self._getName(), self._route, this._viewRef);
	}

	_getName(){
		if(this.props.shared)
			return this.props.shared;
		return this._name;
	}

	getTransitionHelper(appear){
		return new ScaleTransition();
		if(this._transitionHelper === null) {
			switch(appear){
				case 'top':
					this._transitionHelper = new TopTransition();
					break;
				case 'bottom':
					this._transitionHelper = new BottomTransition();
					break;
				case 'left':
					this._transitionHelper = new LeftTransition();
					break;
				case 'right':
					this._transitionHelper = new RightTransition();
					break;
				case 'horizontal':
					this._transitionHelper = new HorizontalTransition();
					break;
				case 'vertical':
					this._transitionHelper = new VerticalTransition();
					break;
				case 'scale':
					this._transitionHelper = new ScaleTransition();
					break;
				default:
					break;
			}
		}
		return this._transitionHelper;
	}

	static contextTypes = {
		register: PropTypes.func,
		unregister: PropTypes.func,
		updateMetrics: PropTypes.func,
		route: PropTypes.string,
		appearProgress: PropTypes.object,
		transitionProgress: PropTypes.object,
		getIsSharedElement: PropTypes.func,
		getIsTransitionElement: PropTypes.func,
	}

	componentWillMount() {
		this._isMounted = true;
		const register = this.context.register;
		if(register) {
			this._route = this.context.route;
			register(new TransitionItem(this._getName(), this.context.route,
				this, this.props.shared !== undefined, this.props.appear !== undefined,
				this.props.nodelay !== undefined));
		}
	}

	componentWillUnmount() {
		this._isMounted = false;
		const unregister = this.context.unregister;
		if(unregister) {
			unregister(this._getName(), this._route);
		}
	}
}

export default Transition;