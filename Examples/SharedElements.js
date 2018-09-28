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
    backgroundColor: '#FFF',
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
  avatarSmallImage: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  avatarText: {
    fontSize: 11,
    marginLeft: 8,
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
  commentsContainer: {
  },
  commentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    paddingVertical: 6,
  },
  comment: {
    fontSize: 11,
    paddingLeft: 6,
  },
  buttons: {
    flexDirection: 'row',
    padding: 10,
    paddingTop: 50,
  },
});

const ImageHeader = () => (
  <View style={styles.imageHeader}>
    <Icon name="heart-outline" size={22} />
    <View style={{ width: 10 }} />
    <Icon name="comment-outline" size={22} />
    <View style={{ width: 10 }} />
    <Icon name="paperclip" size={22} />
  </View>
);

const AvatarImage = ({ source }) => (
  <Image source={source} style={styles.avatarImage} />
);

const SmallAvatarImage = ({ source }) => (
  <Image source={source} style={styles.avatarSmallImage} />
);

const Avatar = ({ avatar }) => (
  <View style={styles.imageHeader}>
    <AvatarImage source={avatar.source} />
    <Text style={styles.avatarText}>{avatar.name}</Text>
  </View>
);

const Card = ({ navigation, item, id }) => (
  <Transition shared={`card${id}`} appear="horizontal" disappear="fade">
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.card}
      onPress={() => navigation.navigate('screen2', { id, item })}
      hitSlop={{ left: 20, top: 20, right: 20, bottom: 20 }}
    >
      <Transition shared={`avatar${id}`}>
        <Avatar avatar={item.avatar} />
      </Transition>
      <Transition shared={`image${id}`}>
        <Image style={styles.smallImage} source={item.source} />
      </Transition>
      <Transition shared={`imageHeader${id}`}>
        <ImageHeader />
      </Transition>
    </TouchableOpacity>
  </Transition>
);

const NavCard = withNavigation(Card);

class Screen1 extends React.Component {
  constructor(props) {
    super(props);
    this.state = { items: [] };
  }

  componentWillMount() {
    this.setState((prevState) => ({ ...prevState, items: createItemsData() }));
  }

  render() {
    const { items } = this.state;
    return (
      <ScrollView style={styles.container}>
        {items.map((item, index) => (
          <NavCard
            key={index}
            id={index}
            item={item}
          />
        ))}
      </ScrollView>);
  }
}

const Comment = ({ comment }) => (
  <View style={styles.commentRow}>
    <SmallAvatarImage source={comment.avatar.source} />
    <Text style={styles.comment}>{comment.text}</Text>
  </View>
);

const Screen2 = ({ navigation }) => (
  <View style={styles.container}>
    <Transition shared={`card${navigation.getParam('id')}`}>
      <View style={styles.bigCard}>
        <Transition shared={`avatar${navigation.getParam('id')}`}>
          <Avatar avatar={navigation.getParam('item').avatar} />
        </Transition>
        <Transition shared={`image${navigation.getParam('id')}`}>
          <Image style={styles.bigImage} source={navigation.getParam('item').source} />
        </Transition>
        <Transition shared={`imageHeader${navigation.getParam('id')}`}>
          <ImageHeader />
        </Transition>
        <Transition anchor={`image${navigation.getParam('id')}`} appear="horizontal">
          <ScrollView style={styles.commentsContainer}>
            {navigation.getParam('item').comments.map((comment, index) => (
              <Comment key={index} comment={comment} />
            ))}
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

const createItemsData = () => {
  const users = getRandomImages(15, 30).map(img => ({
    source: img,
    name: ['Marge Manns',
      'Wallace Doe',
      'Cheryle Hodnett',
      'Jared Muszynski',
      'Jayme Poyer',
      'Gina Dennett'][Math.floor((Math.random() * 6))],
  }));

  const createComments = () => {
    const comments = [];
    for (let i = 0; i < Math.floor((Math.random() * 6) + 4); i++) {
      comments.push({
        text: ['Great picture! Thanks', 'I like it!', 'Wow! Great', 'Cool!', 'Thanks :-)', ':-)'][Math.floor((Math.random() * 6))],
        avatar: users[Math.floor((Math.random() * 15))],
      });
    }
    return comments;
  };
  const items = getRandomImages(15, Dimensions.get('window').width).map(img => ({
    source: img,
    comments: createComments(),
    avatar: users[Math.floor((Math.random() * 15))],
  }));
  return items;
};
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

export default SharedElements;
