import React from 'react';
import { Dimensions, Animated } from 'react-native';

import BaseAppearTransition from './BaseAppearTransition';

class TopTransition extends BaseAppearTransition {
	getTransitionStyle(transitionConfiguration) {
		if(!transitionConfiguration)
			return {};

		const { y, height } = transitionConfiguration.metrics;
		const distanceValue = -(height + y + 25);		
		const progress = transitionConfiguration.progress.interpolate({
			inputRange: [0, 1],
			outputRange: [distanceValue, 0]
		});

		return {
			transform: [{
				translateY: progress
			}]
		};
	}
}

export default TopTransition;