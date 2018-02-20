import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, Animated } from 'react-native';

import BaseTransition from './BaseTransition';

class SharedTransition extends BaseTransition {
	constructor(props, context){
		super(props, context);
    }

	render() {
		const swapStyle = {
			opacity: this.context.progress.interpolate({
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
}

export default SharedTransition;