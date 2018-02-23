import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, Animated } from 'react-native';

import BaseTransition from './BaseTransition';

class SharedTransition extends BaseTransition {
	getTransitionStyle() {
		if(this.state.transitionConfiguration){
			return {
				opacity: this.context.appearProgress.interpolate({
					inputRange: [0, 0.5, 0.5, 1],
					outputRange: [1, 1, 0, 0],
				})
			};
		}
		else{
			return { opacity: 1.0 };
		}
	}
}

export default SharedTransition;