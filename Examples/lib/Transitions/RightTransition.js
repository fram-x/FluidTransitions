import React from 'react';
import { Dimensions, Animated } from 'react-native';

import BaseTransitionHelper from './BaseTransitionHelper';

class RightTransition extends BaseTransitionHelper {
	getTransitionStyle(transitionConfiguration) {
		if(!transitionConfiguration || transitionConfiguration.metrics === undefined)
			return { opacity: 0 };

		const { x, width } = transitionConfiguration.metrics;
		const distanceValue = Dimensions.get('window').width-(x - 25);
		const progress = transitionConfiguration.progress.interpolate({
			inputRange: [0, 1],
			outputRange: [distanceValue, 0]
		});

		return {
			opacity: 1,
			transform: [{
				translateX: progress
			}]
		};
	}
}

export default RightTransition;