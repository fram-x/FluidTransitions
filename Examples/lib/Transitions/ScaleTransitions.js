import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, Animated } from 'react-native';

import BaseAppearTransition from './BaseAppearTransition';

class ScaleTransition extends BaseAppearTransition {
	constructor(props, context){
		super(props, context);			
	}
	getTransitionStyle(transitionConfiguration) {
		if(!transitionConfiguration)
			return { };
			
		const scaleInterpolation = transitionConfiguration.progress.interpolate({
			inputRange: [0, 1],
			outputRange: [0, 1]
		});

		const opacityInterpolation = transitionConfiguration.progress.interpolate({
			inputRange: [0, 0.1, 0.9, 1],
			outputRange: [0, 1, 1, 1]
		});

		return {
			opacity: opacityInterpolation,
            transform: [{ scaleX: scaleInterpolation }, { scaleY: scaleInterpolation }]
		};
	}	
}

export default ScaleTransition;