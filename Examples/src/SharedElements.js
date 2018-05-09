import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { Transition, FluidNavigator } from 'react-navigation-fluid-transitions';

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
  circle1: {
    backgroundColor: '#EE0000',
    width: 50,
    height: 50,
    borderRadius: 4,
  },
  circle2: {
    backgroundColor: '#EE0000',
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  circle3: {
    backgroundColor: '#EE0000',
    width: 140,
    height: 140,
    borderRadius: 4,
  },
});

const Circle = (props) => (
  <View
    style={{
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: props.background,
      width: props.size,
      height: props.size,
      borderRadius: props.size / 2,
    }}
  />
);

const Screen1 = (props) => (
  <View style={styles.container}>
    <Transition appear="flip">
      <Text>1.Screen</Text>
    </Transition>
    <View style={styles.screen1}>
      <Transition shared="circle">
        <View style={styles.circle1} />
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
    <Transition appear="flip">
      <Text>2.Screen</Text>
    </Transition>
    <View style={styles.screen2}>
      <Transition shared="circle">
        <View style={styles.circle2} />
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
    <Transition appear="flip">
      <Text>3.Screen</Text>
    </Transition>
    <View style={styles.screen3}>
      <Transition shared="circle">
        <View style={styles.circle3} />
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

const Navigator = FluidNavigator({
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
