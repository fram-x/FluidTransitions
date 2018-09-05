import React, { Component } from 'react';
import { Text, StyleSheet, View, Animated, Button } from 'react-native';
import { createFluidNavigator, Transition } from '../lib';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animated: {
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  animatedElement: {
    width: 150,
    height: 150,
  },
  buttonContainer: {
    margin: 40,
    flexDirection: 'row',
  },
  text: {
    margin: 40,
    textAlign: 'center',
  },
});

class SpinningCube extends Component {
  render() {
    const { progress, startColor, endColor } = this.props;
    if (progress) {
      const spin = progress.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
      });

      const background = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [startColor, endColor],
      });

      const border = progress.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 75, 0],
      });

      const scale = progress.interpolate({
        inputRange: [0, 0.1, 0.9, 1],
        outputRange: [1, 0.5, 0.5, 1],
      });

      return (
        <View style={styles.animated}>
          <Animated.View style={[styles.animatedElement,
            {
              transform: [{ rotate: spin }, { scale }],
              backgroundColor: background,
              borderRadius: border,
            }]}
          />
        </View>
      );
    }

    return (
      <View style={styles.animated}>
        <Animated.View style={[styles.animatedElement,
          {
            backgroundColor: startColor,
            borderRadius: 0,
          }]}
        />
      </View>
    );
  }
}

const Description = () => (
  <Text style={styles.text}>
    This cube is an animated component that contains a property
    that accepts an interpolation, and will interpolate size,
    border and background color when the interpolation changes. It
    is connected to the Transition through its animated property.
  </Text>
);

class Screen1 extends Component {
  render() {
    const { navigation } = this.props;
    return (
      <View style={styles.container}>
        <Description />
        <Transition animated="progress" shared="square">
          <SpinningCube startColor="#FF0000" endColor="#00FF00" />
        </Transition>
        <Transition appear="horizontal">
          <View style={styles.buttonContainer}>
            <Button title="Next" onPress={() => navigation.navigate('screen2')} />
          </View>
        </Transition>
      </View>
    );
  }
}

class Screen2 extends Component {
  render() {
    const { navigation } = this.props;
    return (
      <View style={styles.container}>
        <Description />
        <Transition animated="progress" shared="square">
          <SpinningCube startColor="#00FF00" endColor="#0000FF" />
        </Transition>
        <Transition appear="horizontal">
          <View style={styles.buttonContainer}>
            <Button title="Back" onPress={() => navigation.goBack()} />
            <Button title="Next" onPress={() => navigation.navigate('screen3')} />
          </View>
        </Transition>
      </View>
    );
  }
}

class Screen3 extends Component {
  render() {
    const { navigation } = this.props;
    return (
      <View style={styles.container}>
        <Description />
        <Transition animated="progress" shared="square">
          <SpinningCube startColor="#0000FF" endColor="#FF0" />
        </Transition>
        <Transition appear="horizontal">
          <View style={styles.buttonContainer}>
            <Button title="Back" onPress={() => navigation.goBack()} />
          </View>
        </Transition>
      </View>
    );
  }
}

const Navigator = createFluidNavigator({
  screen1: { screen: Screen1 },
  screen2: { screen: Screen2 },
  screen3: { screen: Screen3 },
});

class AnimatedProperty extends React.Component {
  static router = Navigator.router;

  render() {
    const { navigation } = this.props;
    return (
      <Navigator navigation={navigation} />
    );
  }
}

export default AnimatedProperty;
