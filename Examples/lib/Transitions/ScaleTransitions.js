import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, Animated } from 'react-native';

import BaseTransition from './BaseTransition';

class SharedTransition extends BaseTransition {
	constructor(props, context){
		super(props, context);
    }

	render() {
		const scaleStyle = {
            transform: [{
                scale: this.context.progress
            }]
		};

		const element = React.Children.only(this.props.children);
		const animatedComp = Animated.createAnimatedComponent(element.type);
		const style =  [scaleStyle, element.props.style];

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