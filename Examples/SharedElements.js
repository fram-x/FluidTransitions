import React from 'react';
import { View, Text, TouchableOpacity, Button, StyleSheet } from 'react-native';
import { withNavigation } from 'react-navigation';
import { Transition, createFluidNavigator } from '../lib';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    backgroundColor: '#ECEEFA',
    margin: 20,
    marginTop: 10,
    marginBottom: 10,
    padding: 20,
    borderColor: '#AAA',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    shadowOpacity: 0.5,
    shadowColor: '#AAA',
    shadowOffset: { width: 2, height: 5 },
  },
  bigCard: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttons: {
    flexDirection: 'row',
    padding: 20,
  },
});

const Card = ({ navigation, id }) => (
  <Transition shared={`card${id}`} top appear="horizontal" delay>
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('screen2', { id })}
      hitSlop={{ left: 20, top: 20, right: 20, bottom: 20 }}
    >
      <Transition shared={`text${id}`}>
        <Text>{`Card ${id}`}</Text>
      </Transition>
    </TouchableOpacity>
  </Transition>
);

const NavCard = withNavigation(Card);

const Screen1 = (props) => (
  <View style={styles.container}>
    <NavCard id={1} />
    <NavCard id={2} />
    <NavCard id={3} />
    <NavCard id={4} />
  </View>
);

const Screen2 = ({ navigation }) => (
  <View style={styles.container}>
    <Transition shared={`card${navigation.getParam('id')}`}>
      <View style={styles.bigCard}>
        <Transition shared={`text${navigation.getParam('id')}`}>
          <Text>{`Card ${navigation.getParam('id')}`}</Text>
        </Transition>
      </View>
    </Transition>
    <Transition appear="horizontal">
      <View style={styles.buttons}>
        <Button title="Back" onPress={() => navigation.goBack()} />
        <View style={{ width: 20 }} />
        <Button title="Next" onPress={() => navigation.navigate('screen3')} />
      </View>
    </Transition>
  </View>
);

const Screen3 = (props) => (
  <View style={styles.container}>
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
