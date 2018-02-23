import React from 'react';
import { Dimensions, Animated } from 'react-native';

import BaseAppearTransition from './BaseAppearTransition';

class VerticalTransition extends BaseAppearTransition {
	getTransitionStyle(transitionConfiguration) {
		if(!transitionConfiguration)
			return {};
        
        const { y, height } = transitionConfiguration.metrics;
        const distanceValue = transitionConfiguration.direction === 1 ? 
            -(height + y + 25) : Dimensions.get('window').height - (y - 25);

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

export default VerticalTransition;