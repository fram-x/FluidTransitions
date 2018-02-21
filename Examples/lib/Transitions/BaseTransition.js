import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, Animated } from 'react-native';

import TransitionItem from './../TransitionItem';

let uniqueBaseId = `transitionCompId-${Date.now()}`;
let uuidCount = 0;

function generateKey() {
    return `${uniqueBaseId}-${uuidCount++}`;
}

class BaseTransition extends React.Component {
	constructor(props, context){
		super(props, context);
		this._name = generateKey();
		this._transitionProgress = new Animated.Value(0);
		this.state = {
			transitionConfiguration: null
		};
	}

	_transitionProgress
	_innerViewRef
	_route
	_name
	_innerViewRef

	render() {

		const element = React.Children.only(this.props.children);
		const animatedComp = Animated.createAnimatedComponent(element.type);
		
		const style =  [element.props.style];		
		const transitionStyle = 
			this.getTransitionStyle(this.state.transitionConfiguration);

		const props = {
			...element.props,
			collapsable: false,
			style: [style, transitionStyle],
			ref: ref => this._innerViewRef = ref
		};

		return React.createElement(animatedComp, props);
	}
	getTransitionStyle(transitionConfiguration) {
		return {};
	}
	shouldComponentUpdate(nextProps, nextState){
		return nextState != this.state;
	}
	getAnimation(start, end, index, timing, config, metrics) {
		this.setState({...this.state, transitionConfiguration: {
			metrics,
			progress: this._transitionProgress
		}})

		this._transitionProgress.setValue(start);
		const animation = timing(this._transitionProgress, {
			toValue: end,
			...config,
			delay: index * 80,
		});
		return animation;
	}
	componentDidMount() {
		const register = this.context.register;
		if(register) {
			this._route = this.context.route;
			if(this.props.shared){
				register(new TransitionItem(this.props.shared, this.context.route,
					this, true));
			}
			else {
				register(new TransitionItem(this._name, this.context.route,
					this, false));
			}
		}
	}
	componentWillUnmount() {
		const unregister = this.context.unregister;
		if(unregister) {
			if(this.props.shared)
				unregister(this.props.shared, this._route);
			else
				unregister(this._name, this._route);
		}
	}
	getInnerViewRef() {
		return this._innerViewRef;
	}
	getReactElement() {
		return React.Children.only(this.props.children);
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
		appearProgress: PropTypes.object,
		transitionProgress: PropTypes.object,		
		route: PropTypes.string,
	}
}

export default BaseTransition;