import React, { Component } from 'react';
import { View, Text, Button, ScrollView, StyleSheet } from 'react-native';
import { NavigationActions } from 'react-navigation';

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',		
    },
    button: {
        alignSelf: 'stretch',        
        padding: 10,
    }
});

export default (props) => (	
    <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.button} backgroundColor='#CECECE'>
		    <Button title='Shared Elements' onPress={() => props.navigation.navigate('shared')}/>
        </View>
        <View style={styles.button} backgroundColor='#DEDEDE'>
            <Button title='Appearing Elements' onPress={() => props.navigation.navigate('appear')}/>
        </View>
    </ScrollView>	
);