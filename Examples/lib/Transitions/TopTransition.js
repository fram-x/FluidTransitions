import React from 'react';
import { Dimensions, Animated } from 'react-native';

import BaseTransition from './BaseTransition';

class TopTransition extends BaseTransition {
	getTransitionStyle(transitionConfiguration) {
		if(!transitionConfiguration)
			return {};
			
		const { y, height } = transitionConfiguration.metrics;
		const distanceValue = Animated.add(y, height);
		const positionValue = Animated.multiply(distanceValue, 1);
		const progress = Animated.multiply(positionValue, transitionConfiguration.progress);		
		
		return {
			transform: [{
				translateY: progress
			}]
		};
	}
}

export default TopTransition;