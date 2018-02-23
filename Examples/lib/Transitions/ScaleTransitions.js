import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, Animated } from 'react-native';

import BaseTransitionHelper from './BaseTransitionHelper';

class ScaleTransition extends BaseTransitionHelper {
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