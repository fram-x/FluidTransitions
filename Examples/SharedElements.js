import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
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
    <View style={styles.buttons}>
      <Button title="Next" onPress={() => props.navigation.navigate('screen2')} />
    </View>

  </View>
);

const Screen2 = (props) => (
  <View style={styles.container}>
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
    <View style={styles.buttons}>
      <Button title="Back" onPress={() => props.navigation.goBack()} />
      <View style={{ width: 20 }} />
      <Button title="Next" onPress={() => props.navigation.navigate('screen3')} />
    </View>

  </View>
);

const Screen3 = (props) => (
  <View style={styles.container}>
    <Transition appear="flip">
      <Text>3.Screen</Text>
    </Transition>
    <View style={styles.screen3}>
      <Transition shared="circle">
        <Shape size={140} borderRadius={70} background="#EE0000" />
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
    const { navigation } = this.props;
    return (
      <Navigator navigation={navigation} />
    );
  }
}

export default SharedElements;
