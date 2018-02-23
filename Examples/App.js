/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import { View, Button, Text, StyleSheet } from 'react-native';
import { StackNavigator } from 'react-navigation';

import HomeScreen from './src/HomeScreen';
import SharedElements from './src/SharedElements';
import AppearingElements from './src/AppearingElements';
import ImageTransition from './src/ImageTransition';
import LayoutTransition from './src/LayoutTransition';

const ExampleNavigator = StackNavigator({
	home: { screen: HomeScreen, navigationOptions: { title: 'Fluid Transitions' }},
	shared: { screen: SharedElements },
	appear: { screen: AppearingElements },
	image: { screen: ImageTransition },
	layout: { screen: LayoutTransition }
});

class MyApp extends React.Component {
	render () { 
		return (
			<ExampleNavigator />
		);
	}
}

export default MyApp;