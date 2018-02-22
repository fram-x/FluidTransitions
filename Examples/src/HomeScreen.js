import React, { Component } from 'react';
import { View, Text, Button, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { NavigationActions } from 'react-navigation';

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
    },
    buttonContainer: {
        alignSelf: 'stretch',
    },
    button: {
        padding: 20
    },
    buttonText: {
        textAlign: 'center',
        fontSize: 16
    }
});

const ItemButton = (props) => (
    <TouchableOpacity onPress={() => props.nav.navigate(props.target)} style={styles.buttonContainer}>
        <View style={styles.button} backgroundColor={props.backgroundColor}>
            <Text style={styles.buttonText}>{props.text}</Text>
        </View>
    </TouchableOpacity>
);

export default (props) => (
    <ScrollView contentContainerStyle={styles.container}>
        <ItemButton backgroundColor='#CECECE' text='Shared Elements' nav={props.navigation} target='shared'/>
        <ItemButton backgroundColor='#DEDEDE' text='Appearing Elements' nav={props.navigation} target='appear'/>
        <ItemButton backgroundColor='#BEBEBE' text='Image Transitions' nav={props.navigation} target='image'/>
    </ScrollView>
);