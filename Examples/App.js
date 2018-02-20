/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import { View, Button, Text, StyleSheet } from 'react-native';
import { StackNavigator } from 'react-navigation';

import HomeScreen from './HomeScreen';
import SharedElements from './src/SharedElements';
import AppearingElements from './src/AppearingElements';

const ExampleNavigator = StackNavigator({
	home: { screen: HomeScreen, navigationOptions: { title: 'Fluid Transitions' }},
	shared: { screen: SharedElements },
	appear: { screen: AppearingElements },
});

class MyApp extends React.Component {
	render () { 
		return (
			<ExampleNavigator />
		);
	}
}

export default MyApp;