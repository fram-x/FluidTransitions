import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    alignSelf: 'stretch',
    margin: 10,
  },
  button: {
    padding: 20,
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 16,
  },
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
    <ItemButton backgroundColor="#CECECE" text="Shared Elements" nav={props.navigation} target="shared" />
    <ItemButton backgroundColor="#DEDEDE" text="Appearing Elements" nav={props.navigation} target="appear" />
    <ItemButton backgroundColor="#BEBEBE" text="Image Transitions" nav={props.navigation} target="image" />
    <ItemButton backgroundColor="#DCDCDC" text="Layout Transitions" nav={props.navigation} target="layout" />
    <ItemButton backgroundColor="#AEAEAE" text="Onboarding Transitions" nav={props.navigation} target="onboarding" />
    <ItemButton backgroundColor="#AEAEAE" text="Shoe Shopping" nav={props.navigation} target="shoes" />
  </ScrollView>
);
