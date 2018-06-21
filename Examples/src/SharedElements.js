import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Button,
  Image,
} from 'react-native';
import { FluidNavigator, Transition } from 'react-navigation-fluid-transitions';
import CardStack, { Card } from 'react-native-card-stack-swiper';

class HomeScreen extends Component<{}> {
  render() {
    return (
      <View style={{ flex: 1 }}>
        <CardStack
          style={styles.content}
          renderNoMoreCards={() => <Text style={{ fontWeight: '700', fontSize: 18, color: 'gray' }}>No more cards :(</Text>}
        >

          <Card style={[styles.card, styles.card1]}>
            <TouchableOpacity onPress={() => this.props.navigation.navigate('Detail', { id: 1 })}>
              <Transition shared="logo1">
                <Image source={require('./assets/expo.symbol.white.png')} resizeMode="contain" style={{ height: 300, width: 300 }} />
              </Transition>
            </TouchableOpacity>
          </Card>

          <Card style={[styles.card, styles.card2]}>
            <TouchableOpacity onPress={() => this.props.navigation.navigate('Detail', { id: 2 })}>
              <Transition shared="logo2">
                <Image source={require('./assets/expo.symbol.white.png')} resizeMode="contain" style={{ height: 250, width: 250 }} />
              </Transition>
            </TouchableOpacity>
          </Card>

          <Card style={[styles.card, styles.card3]}>
            <TouchableOpacity onPress={() => this.props.navigation.navigate('Detail', { id: 3 })}>
              <Transition shared="logo3">
                <Image source={require('./assets/expo.symbol.white.png')} resizeMode="contain" style={{ height: 200, width: 200 }} />
              </Transition>
            </TouchableOpacity>
          </Card>

        </CardStack>
      </View>
    );
  }
}

class DetailScreen extends React.Component {
  render() {
    const id = this.props.navigation.getParam('id');

    return (
      <View style={{ backgroundColor: 'black', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Transition shared={`logo${id}`}>
          <Image source={require('./assets/expo.symbol.white.png')} resizeMode="contain" style={{ height: 300, width: 300 }} />
        </Transition>
        <Button title="Back" onPress={() => this.props.navigation.goBack()} />
      </View>
    );
  }
}

const Navigator = FluidNavigator({
  Home: { screen: HomeScreen },
  Detail: { screen: DetailScreen },
});

export default class App extends React.Component {
  static router = Navigator.router;
  render() {
    return <Navigator navigation={this.props.navigation} />;
  }
}

const styles = StyleSheet.create({
  content: {
    flex: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: 320,
    height: 470,
    backgroundColor: '#FE474C',
    borderRadius: 5,
    shadowColor: 'rgba(0,0,0,0.5)',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.5,
  },
  card1: {
    backgroundColor: '#FE474C',
  },
  card2: {
    backgroundColor: '#FEB12C',
  },
  card3: {
    backgroundColor: '#AEB12C',
  },
});
