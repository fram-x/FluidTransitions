import React from 'react';
import { Dimensions, Animated } from 'react-native';

import BaseTransitionHelper from './BaseTransitionHelper';

class HorizontalTransition extends BaseTransitionHelper {
	getTransitionStyle(transitionConfiguration) {
		if(!transitionConfiguration)
			return {};
        
        const { x, width } = transitionConfiguration.metrics;
        const distanceValue = transitionConfiguration.direction === 1 ? 
            -(width + x + 25) : Dimensions.get('window').width - (x - 25);

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

export default HorizontalTransition;