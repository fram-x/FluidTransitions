import React from 'react';
import { Dimensions, Animated } from 'react-native';

import BaseTransition from './BaseTransition';

class RightTransition extends BaseTransition {
	getTransitionStyle(transitionConfiguration) {
		if(!transitionConfiguration)
			return {};

		const { x, width } = transitionConfiguration.metrics;
		const distanceValue = Dimensions.get('window').width-(x + 25);
		const progress = transitionConfiguration.progress.interpolate({
			inputRange: [0, 1],
			outputRange: [distanceValue, 0]
		});

		return {
			transform: [{
				translateX: progress
			}]
		};
	}
}

export default RightTransition;