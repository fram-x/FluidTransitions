import React from 'react';
import { Dimensions, Animated } from 'react-native';

import BaseTransition from './BaseTransition';

class HorizontalTransition extends BaseTransition {
	getTransitionStyle(transitionConfiguration) {
		if(!transitionConfiguration || transitionConfiguration.metrics === undefined)
			return { };
        
        const { x, width } = transitionConfiguration.metrics;
        const distanceValue = transitionConfiguration.reverse ? 
            -(width + x + 25) : Dimensions.get('window').width - (x - 25);

		const progress = transitionConfiguration.progress.interpolate({
			inputRange: [0, 1],
			outputRange: transitionConfiguration.direction === -1 ? [0, distanceValue] : [distanceValue, 0]
		});

		return {			
			transform: [{
				translateX: progress
			}]
		};
	}
}

export default HorizontalTransition;