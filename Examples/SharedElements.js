import React from 'react';
import { View, Text, Animated, Button, StyleSheet } from 'react-native';
import { Transition, createFluidNavigator } from '../lib';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
    padding: 20,
  },
  text1: {
    fontSize: 12,
    color: 'black',
  },
  text2: {
    fontSize: 24,
    color: '#EE0000',
  },
  text3: {
    fontSize: 12,
    color: '#55AA55',
  },
});

const Circle = ({ background, size }) => (
  <View
    style={{
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: background,
      width: size,
      height: size,
      borderRadius: size / 2,
    }}
  />
);

const Shape = ({ background, size, borderRadius }) => (
  <View
    style={{
      backgroundColor: background || '#EE0000',
      width: size,
      height: size,
      borderRadius: borderRadius || 0,
    }}
  />
);

const Screen1 = (props) => (
  <View style={styles.container}>
    <Transition shared="text">
      <Text style={styles.text1}>Fluid Transitions</Text>
    </Transition>
    <Animated.Text></Animated.Text>
    <View style={styles.screen1}>
      <Transition shared="circle">
        <Shape size={50} borderRadius={4} background="#EE0000" />
      </Transition>
    </View>
    <View style={{ flexDirection: 'row' }}>
      <Transition appear="horizontal" delay>
        <Circle background="#55AA55" size={20} />
      </Transition>
      <View style={{ width: 20 }} />
      <Transition appear="horizontal" delay>
        <Circle background="#55AA55" size={20} />
      </Transition>
      <View style={{ width: 20 }} />
      <Transition appear="horizontal" delay>
        <Circle background="#55AA55" size={20} />
      </Transition>
    </View>
    <Transition appear="horizontal">
      <View style={styles.buttons}>
        <Button title="Next" onPress={() => props.navigation.navigate('screen2')} />
      </View>
    </Transition>
  </View>
);

const Screen2 = (props) => (
  <View style={styles.container}>
    <Transition shared="text">
      <Text style={styles.text2}>Fluid Transitions</Text>
    </Transition>
    <View style={styles.screen2}>
      <Transition shared="circle">
        <Shape size={50} borderRadius={25} background="#EE0000" />
      </Transition>
    </View>
    <View style={{ flexDirection: 'row' }}>
      <Transition appear="horizontal" delay>
        <Circle background="#55AA55" size={20} />
      </Transition>
      <View style={{ width: 20 }} />
      <Transition appear="horizontal" delay>
        <Circle background="#55AA55" size={20} />
      </Transition>
      <View style={{ width: 20 }} />
      <Transition appear="horizontal" delay>
        <Circle background="#55AA55" size={20} />
      </Transition>
    </View>
    <Transition appear="horizontal">
      <View style={styles.buttons}>
        <Button title="Back" onPress={() => props.navigation.goBack()} />
        <View style={{ width: 20 }} />
        <Button title="Next" onPress={() => props.navigation.navigate('screen3')} />
      </View>
    </Transition>
  </View>
);

const Screen3 = (props) => (
  <View style={styles.container}>
    <Transition shared="text">
      <Text style={styles.text3}>Fluid Transitions</Text>
    </Transition>
    <View style={styles.screen3}>
      <Transition shared="circle">
        <Shape size={140} borderRadius={4} background="#EE0000" />
      </Transition>
    </View>
    <View style={{ flexDirection: 'row' }}>
      <Transition appear="horizontal" delay>
        <Circle background="#55AA55" size={20} />
      </Transition>
      <View style={{ width: 20 }} />
      <Transition appear="horizontal" delay>
        <Circle background="#55AA55" size={20} />
      </Transition>
      <View style={{ width: 20 }} />
      <Transition appear="horizontal" delay>
        <Circle background="#55AA55" size={20} />
      </Transition>
    </View>
    <Transition appear="horizontal">
      <View style={styles.buttons}>
        <Button title="Back" onPress={() => props.navigation.goBack()} />
      </View>
    </Transition>
  </View>
);

const Navigator = createFluidNavigator({
  screen1: { screen: Screen1 },
  screen2: { screen: Screen2 },
  screen3: { screen: Screen3 },
}, {
  navigationOptions: { gesturesEnabled: true },
});

class SharedElements extends React.Component {
  static router = Navigator.router;

  render() {
    return (
      <Navigator navigation={this.props.navigation} />
    );
  }
}

export default SharedElements;
