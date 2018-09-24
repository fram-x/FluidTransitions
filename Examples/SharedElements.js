import React from 'react';
import { View, Text, ScrollView, Image, Dimensions, TouchableOpacity, StyleSheet } from 'react-native';
import { withNavigation } from 'react-navigation';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Transition, createFluidNavigator } from '../lib';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    backgroundColor: '#ECEEFA',
    flexDirection: 'column',
    justifyContent: 'center',
    margin: 20,
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 4,
    shadowOpacity: 0.5,
    shadowColor: '#AAA',
    shadowOffset: { width: 2, height: 5 },
  },
  smallImage: {
    width: Dimensions.get('window').width - 40,
    height: Dimensions.get('window').width - 60,
  },
  smallTitle: {
    margin: 10,
  },
  bigCard: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#FFF',
    justifyContent: 'flex-start',
  },
  bigImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').width,
  },
  bigTitle: {
    margin: 20,
  },
  buttons: {
    flexDirection: 'row',
    padding: 20,
  },
});

const Card = ({ navigation, source, id }) => (
  <Transition shared={`card${id}`} top appear="horizontal" disappear="fade" delay>
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.card}
      onPress={() => navigation.navigate('screen2', { id, source })}
      hitSlop={{ left: 20, top: 20, right: 20, bottom: 20 }}
    >
      <Transition shared={`image${id}`}>
        <Image style={styles.smallImage} source={source} />
      </Transition>
      <Transition shared={`text${id}`}>
        <Text style={styles.smallTitle}>{`Card ${id}`}</Text>
      </Transition>
    </TouchableOpacity>
  </Transition>
);

const NavCard = withNavigation(Card);

class Screen1 extends React.Component {
  constructor(props) {
    super(props);
    this.state = { item: [] };
  }

  componentWillMount() {
    const items = [];
    const size = Dimensions.get('window').width;
    const max = 10;
    const randMax = 100;
    for (let i = 0; i < max; i++) {
      let randomNumber = Math.floor((Math.random() * randMax) + 1);
      const idExists = (e) => e.id === randomNumber;
      while (items.findIndex(idExists) > -1) {
        randomNumber = Math.floor((Math.random() * randMax) + 1);
      }

      items.push({ url: `https://picsum.photos/${size}/${size}?image=${randomNumber}`, id: randomNumber });
    }
    this.setState((prevState) => ({ ...prevState, items }));
  }

  render() {
    const { items } = this.state;
    return (
      <ScrollView style={styles.container}>
        {items.map((source, index) => (<NavCard key={index} id={index} source={source} />))}
      </ScrollView>);
  }
}

const Screen2 = ({ navigation }) => (
  <View style={styles.container}>
    <Transition shared={`card${navigation.getParam('id')}`}>
      <View style={styles.bigCard}>
        <Transition shared={`image${navigation.getParam('id')}`}>
          <Image style={styles.bigImage} source={navigation.getParam('source')} />
        </Transition>
        <Transition shared={`text${navigation.getParam('id')}`}>
          <Text style={styles.bigTitle}>{`Card ${navigation.getParam('id')}`}</Text>
        </Transition>
      </View>
    </Transition>
    <Transition anchor={`image${navigation.getParam('id')}`}>
      <View style={styles.buttons}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
    </Transition>
  </View>
);

const Navigator = createFluidNavigator({
  screen1: { screen: Screen1 },
  screen2: { screen: Screen2 },
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
