import React from 'react';
import { Dimensions, Animated } from 'react-native';

import BaseAppearTransition from './BaseAppearTransition';

class BottomTransition extends BaseAppearTransition {
	getTransitionStyle() {
		if(!this.state.transitionConfiguration)
			return {};

		const { y, height } = this.state.transitionConfiguration.metrics;
		const distanceValue = Dimensions.get('window').height - (y + 25);
		const progress = this.state.transitionConfiguration.progress.interpolate({
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

export default BottomTransition;