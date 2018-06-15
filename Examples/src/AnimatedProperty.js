import React, { Component } from 'react';
import { Text, StyleSheet, View, Animated, Button } from 'react-native';
import { createFluidNavigator, Transition } from 'react-navigation-fluid-transitions';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  animated: {
    width: 150,
    height: 150,
    backgroundColor: '#FF0000',
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
    if (this.props.progress) {
      const spin = this.props.progress.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
      });

      const background = this.props.progress.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: ['#FF0000', '#0000FF', '#FF0000'],
      });

      const border = this.props.progress.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 75, 0],
      });

      const scale = this.props.progress.interpolate({
        inputRange: [0, 0.1, 0.9, 1],
        outputRange: [1, 0.5, 0.5, 1],
      });

      return (
        <Animated.View style={[styles.animated,
          {
            transform: [{ rotate: spin }, { scale }],
            backgroundColor: background,
            borderRadius: border,
          }]}
        />
      );
    }

    return (
      <Animated.View style={[styles.animated,
        {
          backgroundColor: '#FF0000',
          borderRadius: 0,
        }]}
      />
    );
  }
}

const Description = (props) => (
  <Text style={styles.text}>
    This cube is an animated component that contains a property
    that accepts an interpolation, and will interpolate size,
    border and background color when the interpolation changes. It
    is connected to the Transition through its animated property.
  </Text>
);

class Screen1 extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Description />
        <Transition animated="progress" shared="square">
          <SpinningCube />
        </Transition>
        <Transition appear="horizontal">
          <View style={styles.buttonContainer}>
            <Button title="Next" onPress={() => this.props.navigation.navigate('screen2')} />
          </View>
        </Transition>
      </View>
    );
  }
}

class Screen2 extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Description />
        <Transition animated="progress" shared="square">
          <SpinningCube />
        </Transition>
        <Transition appear="horizontal">
          <View style={styles.buttonContainer}>
            <Button title="Back" onPress={() => this.props.navigation.goBack()} />
            <Button title="Next" onPress={() => this.props.navigation.navigate('screen3')} />
          </View>
        </Transition>
      </View>
    );
  }
}

class Screen3 extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Description />
        <Transition animated="progress" shared="square">
          <SpinningCube />
        </Transition>
        <Transition appear="horizontal">
          <View style={styles.buttonContainer}>
            <Button title="Back" onPress={() => this.props.navigation.goBack()} />
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
    return (
      <Navigator navigation={this.props.navigation} />
    );
  }
}

export default AnimatedProperty;
