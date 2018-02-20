import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, Animated } from 'react-native';

import TransitionItem from './TransitionItem';

class Transition extends React.Component {
	constructor(props, context){
		super(props, context);
	}
	_innerViewRef
	_route
	render() {
		
		const opacityNegValue = Animated.multiply(
			this.context.progress, this.context.progressDirection);

		const opacityValue = Animated.add(this.context.progress, opacityNegValue);
		const swapStyle = {
			opacity: opacityValue.interpolate({
				inputRange: [0, 0.5, 0.5, 1],
				outputRange: [1, 1, 0, 0],
			}),
		};

		const element = React.Children.only(this.props.children);
		const animatedComp = Animated.createAnimatedComponent(element.type);
		const style =  [swapStyle, element.props.style];

		const props = {
			...element.props,
			collapsable: false,
			style: style,
			ref: ref => this._innerViewRef = ref
		};

		return React.createElement(animatedComp, props);
	}
	componentDidMount() {
		const register = this.context.register;
		if(register && this.props.shared){
			this._route = this.context.route;
			register(new TransitionItem(this.props.shared, this.context.route, this));
		}
	}
	componentWillUnmount() {
		const unregister = this.context.unregister;
		if(unregister && this.props.shared)
			unregister(this.props.shared, this._route)
	}
	getInnerViewRef() {
		return this._innerViewRef;
	}
	getReactElement() {
		return React.Children.only(this.props.children);
	}
	static contextTypes = {
		register: PropTypes.func,
		unregister: PropTypes.func,
		progress: PropTypes.object,
		progressDirection: PropTypes.object,
		route: PropTypes.string,
	}
}

export default Transition;