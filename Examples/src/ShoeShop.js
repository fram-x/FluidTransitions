import React from 'react';
import { View, Image, Dimensions, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Transition, FluidNavigator } from 'react-navigation-fluid-transitions';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  shoe1: {
    width: 230,
    height: 150,
    position: 'absolute',
    left: Dimensions.get('window').width - 180,
    top: Dimensions.get('window').height * 0.5 - 100,
    transform: [{ rotate: '20deg' }],
  },
  shoe2: {
    width: 200,
    height: 130,
    position: 'absolute',
    left: Dimensions.get('window').width * 0.5 - 80,
    top: Dimensions.get('window').height * 0.5 - 80,
  },
  top1: {
    backgroundColor: '#EFEFEF',
    flex: 1,
  },
  paper1: {
    backgroundColor: '#AF2222',
    width: 200,
    height: 220,
    position: 'absolute',
    left: Dimensions.get('window').width * 0.5 - 100,
    top: Dimensions.get('window').height * 0.5 - 100,
    transform: [{ rotate: '-20deg' }],
  },
  paper2: {
    backgroundColor: '#AA020222',
    position: 'absolute',
    left: 0,
    top: Dimensions.get('window').height * 0.5,
    bottom: 0,
    right: 0,
  },
});

const Screen1 = (props) => (
  <View style={styles.container}>
    <TouchableOpacity style={styles.top1} onPress={() => props.navigation.navigate('screen2')}>
      <Transition appear="left" shared="paper">
        <View style={styles.paper1} />
      </Transition>
      <Transition appear="right" shared="image">
        <Image style={styles.shoe1} source={require('./assets/air-jordan-1.png')} />
      </Transition>
    </TouchableOpacity>
  </View>
);
const Screen2 = (props) => (
  <View style={styles.container}>
    <TouchableOpacity style={styles.top1} onPress={() => props.navigation.goBack()}>
      <Transition shared="paper" modifiers="layout">
        <View style={styles.paper2} />
      </Transition>
      <Transition shared="image">
        <Image style={styles.shoe2} source={require('./assets/air-jordan-1.png')} />
      </Transition>
    </TouchableOpacity>
  </View>
);

const Navigator = FluidNavigator({
  screen1: { screen: Screen1 },
  screen2: { screen: Screen2 },
});

export default () => (
  <Navigator />
);
