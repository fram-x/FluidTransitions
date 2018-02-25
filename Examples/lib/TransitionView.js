import React from 'react';
import { View, Animated, UIManager, findNodeHandle } from 'react-native';
import PropTypes from 'prop-types';

import TransitionItem from './TransitionItem';
import SharedTransition from './Transitions/SharedTransition';
import BaseAppearTransition from './Transitions/BaseAppearTransition';
import BaseTransition from './Transitions/BaseTransition';

let uniqueBaseId = `transitionCompId-${Date.now()}`;
let uuidCount = 0;

class Transition extends React.Component {
	constructor(props, context){
		super(props, context);
		this._name = `${uniqueBaseId}-${uuidCount++}`;
	}

	_name
	_route
	_isMounted

	render() {
		let element = React.Children.only(this.props.children);
		console.log("TransitionView render " + (element.type ? element.type.displayName : "UNKNOWN"));
		if(element.type.name==='Button')
			element = (<View>{element}</View>);

		const animatedComp = Animated.createAnimatedComponent(element.type);

		const style =  [element.props.style];
		const appearStyle = this.getAppearStyle();
		// TODO: Use helper to generate transitionStyle
		// const transitionStyle = this.getTransitionStyle(this.state.transitionConfiguration);

		const props = {
			...element.props,
			onLayout: this.onLayout.bind(this),
			collapsable: false,
			style: [style, appearStyle],
			ref: (ref) => this._viewRef = ref
		};

		return React.createElement(animatedComp, props);
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

	static contextTypes = {
		register: PropTypes.func,
		unregister: PropTypes.func,
		updateMetrics: PropTypes.func,
		route: PropTypes.string,
		appearProgress: PropTypes.object,
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