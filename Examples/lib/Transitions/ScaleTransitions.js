import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, Animated } from 'react-native';

import BaseTransition from './BaseTransition';

class ScaleTransition extends BaseTransition {
	getTransitionStyle(transitionConfiguration) {
		if(!transitionConfiguration)
			return {};

		return {				
            transform: [{
                scale: transitionConfiguration.progress.interpolate({
					inputRange: [0, 1],
					outputRange: [0, 1]
				})
            }]
		};
	}	
}

export default ScaleTransition;