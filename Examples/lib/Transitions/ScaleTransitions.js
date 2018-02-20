import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, Animated } from 'react-native';

import BaseTransition from './BaseTransition';

class ScaleTransition extends BaseTransition {
	constructor(props, context){
		super(props, context);		
    }
	getTransitionStyle(progress) {
		return {				
            transform: [{
                scale: progress.interpolate({
					inputRange: [0, 1],
					outputRange: [0, 1]
				})
            }]
		};
	}	
}

export default ScaleTransition;