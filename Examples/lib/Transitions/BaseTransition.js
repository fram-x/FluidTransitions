import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, Animated } from 'react-native';

import ScaleTransition from './ScaleTransitions';
import TopTransition from './TopTransition';
import BottomTransition from './BottomTransition';
import LeftTransition from './LeftTransition';
import RightTransition from './RightTransition';
import HorizontalTransition from './HorizontalTransition';
import VerticalTransition from './VerticalTransition';



class BaseTransition extends React.Component {
	constructor(props, context){
		super(props, context);		
		this._transitionProgress = new Animated.Value(0);
		this.state = { transitionConfiguration: null };
		this._transitionHelper = null;
	}

	_transitionHelper
	_transitionProgress		
	_innerViewRef	

	setTransitionSpec(value, force = false){
		if(force){
			this.setState({...this.state, transitionConfiguration: value});
			return;
		}
		if(value === null && this.state.transitionConfiguration !== null)
			this.setState({...this.state, transitionConfiguration: value});
		else if(value !== null && this.state.transitionConfiguration === null)
			this.setState({...this.state, transitionConfiguration: {
				...value, 
				progress: this._transitionProgress}
			});
	}

	getTransitionSpec() {
		return this.state.transitionConfiguration;
	}

	render() {
		console.log(this.props);
		let element = React.Children.only(this.props.children);
		if(element.type.name==='Button')
			element = (<View>{element}</View>);

		const animatedComp = Animated.createAnimatedComponent(element.type);

		const style =  [element.props.style];
		const transitionStyle = this.getTransitionStyle(this.state.transitionConfiguration);

		const props = {
			...element.props,
			collapsable: false,
			style: [style],
			ref: ref => this._innerViewRef = ref,			
		};

		return React.createElement(animatedComp, props);
	}
	
	getTransitionStyle(transitionConfiguration) {
		return { opacity: 0 };
	}
	shouldComponentUpdate(nextProps, nextState){
		return nextState.transitionConfiguration !== this.state.transitionConfiguration;
	}
	getAnimationSpecs(animationSpecs){
		return animationSpecs;
	}
	getAnimation() {
		if(this.state.transitionConfiguration === null)
			return {};

		const animationSpecs = this.state.transitionConfiguration;
		const { start, end, delay, timing, config, metrics, direction } =
			this.getAnimationSpecs(animationSpecs);

		this._transitionProgress.setValue(start);
		const animation = timing(this._transitionProgress, {
			toValue: end,
			...config,
			delay,
		});

		return animation;
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

	getTransitionHelper(appear){
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
		appearProgress: PropTypes.object,
		transitionProgress: PropTypes.object,
		route: PropTypes.string,
	}
	
}

export default BaseTransition;