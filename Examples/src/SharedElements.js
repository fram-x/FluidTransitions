import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

import { FluidNavigator, Transition } from 'react-navigation-fluid-transitions';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 80,
  },
  screen1: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    alignSelf: 'stretch',
    padding: 20,
  },
  screen2: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    justifyContent: 'center',
    padding: 20,
  },
  screen3: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    justifyContent: 'center',
    padding: 20,
  },
  buttons: {
    flexDirection: 'row',
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 20,
    backgroundColor: '#EF4444',
  },
  circle2: {
    width: 100,
    height: 100,
    borderRadius: 100,
    backgroundColor: '#EF4444',
  },
});

const Screen1 = (props) => (
  <View style={styles.container}>
    <Text>Screen 1</Text>
    <View style={styles.screen1}>
      <Transition shared="circle">
        <View style={styles.circle} />
      </Transition>
    </View>
    <Button
      title="Next"
      onPress={() => props.navigation.navigate('screen2')}
    />
  </View>
);

const Screen2 = (props) => (
  <View style={styles.container}>
    <Text>Screen 2</Text>
    <View style={styles.screen2}>
      <Transition shared="circle">
        <View style={styles.circle} />
      </Transition>
    </View>
    <View style={styles.buttons}>
      <Button
        title="Back"
        onPress={() => props.navigation.goBack()}
      />
      <Button
        title="Next"
        onPress={() => props.navigation.navigate('screen3')}
      />
    </View>
  </View>
);

const Screen3 = (props) => (
  <View style={styles.container}>
    <Text>Screen 3</Text>
    <View style={styles.screen3}>
      <Transition shared="circle">
        <View style={styles.circle2} />
      </Transition>
    </View>
    <Button
      title="Back"
      onPress={() => props.navigation.goBack()}
    />
  </View>
);

const Navigator = FluidNavigator({
  screen1: { screen: Screen1 },
  screen2: { screen: Screen2 },
  screen3: { screen: Screen3 },
});

export default () => (
  <Navigator />
);
