import React from 'react';
import { View, Text, Button, Image, StyleSheet } from 'react-native';

import { FluidNavigator, Transition } from 'react-navigation-fluid-transitions';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 80,
  },
  screen: {
    flex: 1,
    flexDirection: 'row',
    padding: 20,
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 40,
    margin: 10,
    backgroundColor: '#EF4444',
  },
  text: {
    textAlign: 'center',
    paddingBottom: 40,
  },
  textContainer: {
    backgroundColor: '#AFECEC',
    padding: 20,
    borderRadius: 20,
  },
  image: {
    width: 200,
    height: 100,
    margin: 20,
    borderRadius: 10,
  },
});

const InitialScreen = (props) => (
  <View style={styles.container}>
    <Transition
      appear={(transitionInfo) => {
        const { progress, start, end } = transitionInfo;
        const scaleInterpolation = progress.interpolate({
          inputRange: [0, start, end, 1],
          outputRange: [88, 80, 1, 1],
        });
        return { transform: [{ scale: scaleInterpolation }] };
      }}
      disappear={
        (transitionInfo) => {
          const { progress, start, end } = transitionInfo;
          const rotateInterpolation = progress.interpolate({
            inputRange: [0, start, end, 1],
            outputRange: ['360deg', '360deg', '0deg', '0deg'],
          });
          const opacityInterpolation = progress.interpolate({
            inputRange: [0, start, end, 1],
            outputRange: [1, 1, 0, 0],
          });
          return { transform: [{ rotate: rotateInterpolation }],
            opacity: opacityInterpolation };
        }
      }
    >
      <Text style={styles.text}>Click toggle to see appearance animations.</Text>
    </Transition>
    <Transition shared="button" appear="scale">
      <Button title="Toggle" onPress={() => props.navigation.navigate('screen')} />
    </Transition>
  </View>
);

const Screen = (props) => (
  <View style={[styles.container, { backgroundColor: '#EF000022' }]}>
    <Transition appear="scale">
      <View style={styles.textContainer}>
        <Text>Screen</Text>
      </View>
    </Transition>
    <View style={styles.screen}>
      <Transition appear="scale" delay>
        <View style={styles.circle} />
      </Transition>
      <Transition appear="scale" delay>
        <View style={styles.circle} />
      </Transition>
      <Transition appear="scale" delay>
        <View style={styles.circle} />
      </Transition>
      <Transition appear="scale" delay>
        <View style={styles.circle} />
      </Transition>
    </View>
    <Transition appear="bottom">
      <Image source={{ uri: 'https://picsum.photos/200/100?image=12' }} style={styles.image} />
    </Transition>
    <Transition shared="button">
      <View>
        <Button title="Toggle" onPress={() => props.navigation.goBack()} />
      </View>
    </Transition>
  </View>
);

const Navigator = FluidNavigator({
  home: { screen: InitialScreen },
  screen: { screen: Screen },
});

class AppearingElements extends React.Component {
  static router = Navigator.router;
  render() {
    return (
      <Navigator navigation={this.props.navigation} />
    );
  }
}

export default AppearingElements;

