import React, { Component } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { NavigationActions } from 'react-navigation';

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 80,
	},
});

export default (props) => (
	<View style={styles.container}>
		<Button title='Shared Elements' onPress={() => props.navigation.navigate('shared')}/>
        <Button title='Appearing Elements' onPress={() => props.navigation.navigate('appear')}/>
	</View>
);