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
    shadowOpacity: 0.3,
    shadowColor: '#AAA',
    shadowOffset: { width: 0, height: 4 },
  },
  smallImage: {
    width: Dimensions.get('window').width - 40,
    height: Dimensions.get('window').width - 60,
  },
  imageHeader: {
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarImage: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  avatarText: {
    fontSize: 11,
    marginLeft: 8,
  },
  smallTitle: {
    margin: 10,
    marginBottom: 20,
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
    paddingHorizontal: 10,
  },
  commentsContainer: {
    padding: 10,
  },
  comment: {
    fontSize: 11,
  },
  buttons: {
    flexDirection: 'row',
    padding: 20,
  },
});

const Card = ({ navigation, avatar, imageSource, id }) => (
  <Transition shared={`card${id}`} top appear="horizontal" disappear="fade">
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.card}
      onPress={() => navigation.navigate('screen2', { id, source: imageSource, avatar })}
      hitSlop={{ left: 20, top: 20, right: 20, bottom: 20 }}
    >
      <Transition appear="horizontal" disappear="fade">
        <View style={styles.imageHeader}>
          <Image source={avatar.source} style={styles.avatarImage} />
          <Text style={styles.avatarText}>{avatar.name}</Text>
        </View>
      </Transition>
      <Transition shared={`image${id}`}>
        <Image style={styles.smallImage} source={imageSource} />
      </Transition>
      <Transition appear="horizontal" disappear="fade">
        <View style={styles.imageHeader}>
          <Icon name="heart-outline" size={22} />
          <View style={{ width: 10 }} />
          <Icon name="comment-outline" size={22} />
          <View style={{ width: 10 }} />
          <Icon name="paperclip" size={22} />
        </View>
      </Transition>
      <Transition appear="horizontal" disappear="fade">
        <Text style={styles.smallTitle}>{`Card ${id}`}</Text>
      </Transition>
    </TouchableOpacity>
  </Transition>
);

const NavCard = withNavigation(Card);

class Screen1 extends React.Component {
  constructor(props) {
    super(props);
    this.state = { items: [], users: [] };
  }

  componentWillMount() {
    const items = getRandomImages(15, Dimensions.get('window').width);
    const users = getRandomImages(15, 30).map(img => ({
      source: img,
      name: 'User name',
    }));
    this.setState((prevState) => ({ ...prevState, items, users }));
  }

  render() {
    const { items, users } = this.state;
    return (
      <ScrollView style={styles.container}>
        {items.map((source, index) => (
          <NavCard
            key={index}
            id={index}
            imageSource={source}
            avatar={users[index]}
          />
        ))}
      </ScrollView>);
  }
}

const getRandomImages = (count: number, size: number) => {
  const items = [];
  const randMax = 100;
  for (let i = 0; i < count; i++) {
    let randomNumber = Math.floor((Math.random() * randMax) + 1);
    const idExists = (e) => e.id === randomNumber;
    while (items.findIndex(idExists) > -1) {
      randomNumber = Math.floor((Math.random() * randMax) + 1);
    }

    items.push({ url: `https://picsum.photos/${size}/${size}?image=${randomNumber}`, id: randomNumber });
  }
  return items;
};

const Screen2 = ({ navigation }) => (
  <View style={styles.container}>
    <Transition shared={`card${navigation.getParam('id')}`}>
      <View style={styles.bigCard}>
        <Transition shared={`image${navigation.getParam('id')}`}>
          <Image style={styles.bigImage} source={navigation.getParam('source')} />
        </Transition>
        <Transition appear="fade">
          <View style={styles.imageHeader}>
            <Image source={navigation.getParam('avatar').source} style={styles.avatarImage} />
            <Text style={styles.avatarText}>{navigation.getParam('avatar').name}</Text>
          </View>
        </Transition>
        <Transition appear="fade">
          <Text style={styles.bigTitle}>{`Card ${navigation.getParam('id')}`}</Text>
        </Transition>
        <Transition appear="fade">
          <ScrollView style={styles.commentsContainer}>
            <Text style={styles.comment}>Comment 1</Text>
            <Text style={styles.comment}>Comment 2</Text>
            <Text style={styles.comment}>Comment 3</Text>
            <Text style={styles.comment}>Comment 4</Text>
            <Text style={styles.comment}>Comment 5</Text>
            <Text style={styles.comment}>Comment 6</Text>
          </ScrollView>
        </Transition>
      </View>
    </Transition>
    <Transition anchor={`image${navigation.getParam('id')}`}>
      <View style={styles.buttons}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ left: 20, top: 20, right: 20, bottom: 20 }}
        >
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
  navigationOptions: {
    gesturesEnabled: true,
    gestureResponseDistance: {
      horizontal: Dimensions.get('window').width,
      vertical: Dimensions.get('window').height,
    },
  },
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
