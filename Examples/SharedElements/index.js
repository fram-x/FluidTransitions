import React from 'react';
import { View, Text, ScrollView, Image, Dimensions, TouchableOpacity } from 'react-native';
import { withNavigation } from 'react-navigation';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Transition, createFluidNavigator } from '../../lib';

import styles from './styles';
import { createItemsData } from './data';

const ImageFooter = () => (
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
        <ImageFooter />
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
          <ImageFooter />
        </Transition>
        <Transition anchor={`card${navigation.getParam('id')}`}>
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
