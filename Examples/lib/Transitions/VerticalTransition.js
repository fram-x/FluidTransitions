import React from 'react';
import { Dimensions, Animated } from 'react-native';

import BaseTransitionHelper from './BaseTransitionHelper';

class VerticalTransition extends BaseTransitionHelper {
	getTransitionStyle(transitionConfiguration) {
		if(!transitionConfiguration || transitionConfiguration.metrics === undefined)
			return { opacity: 0 };
        
        const { y, height } = transitionConfiguration.metrics;
        const distanceValue = transitionConfiguration.direction === 1 ? 
            -(height + y + 25) : Dimensions.get('window').height - (y - 25);

		const progress = transitionConfiguration.progress.interpolate({
			inputRange: [0, 1],
			outputRange: [distanceValue, 0]
		});

		return {
			opacity: 1, 
			transform: [{
				translateY: progress
			}]
		};
	}
}

export default VerticalTransition;