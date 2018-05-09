import React from 'react';
import { View, Image, Dimensions, Text, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { Transition, FluidNavigator } from 'react-navigation-fluid-transitions';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  top1: {
    backgroundColor: '#C14534',
    flex: 1,
  },
  paper1: {
    backgroundColor: '#EC806E',
    width: Dimensions.get('window').width * 0.65,
    height: Dimensions.get('window').height * 0.45,
    position: 'absolute',
    left: 10,
    top: Dimensions.get('window').height * 0.5 - 150,
    transform: [{ rotate: '-20deg' }],
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    padding: 10,
    shadowColor: '#000',
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    // elevation: 17,
  },
  shoe1: {
    width: 350,
    height: 240,
    position: 'absolute',
    left: Dimensions.get('window').width * 0.2,
    top: Dimensions.get('window').height * 0.5 - 160,
    transform: [{ rotate: '35deg' }],
  },
  headerContainer1: {
    padding: 20,
    paddingTop: Dimensions.get('window').height * 0.1,
  },
  header1: {
    color: '#FFF',
    fontSize: 80,
    marginBottom: -14,
    fontFamily: 'Bebas Neue',
  },
  subHeader1: {
    color: '#FFF',
    fontSize: 34,
    fontFamily: 'Bebas Neue',
  },
  top2: {
    backgroundColor: '#C14534',
    flex: 1,
  },
  shoe2: {
    width: 291,
    height: 200,
    position: 'absolute',
    left: Dimensions.get('window').width * 0.5 - (291 / 2),
    top: 60,
  },
  paper2: {
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    left: 0,
    top: Dimensions.get('window').height * 0.5,
    bottom: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 70,
    padding: 10,
  },
  headerContainer2: {
    padding: 20,
    justifyContent: 'center',
    paddingTop: Dimensions.get('window').height * 0.52,
  },
  header2: {
    color: '#444',
    fontSize: 42,
    textAlign: 'center',
    fontFamily: 'Bebas Neue',
    marginBottom: -6,
  },
  subHeader2: {
    color: '#444',
    fontSize: 22,
    textAlign: 'center',
    fontFamily: 'Bebas Neue',
  },
  smallImageContainer: {
    position: 'absolute',
    left: 0,
    top: Dimensions.get('window').height * 0.54,
    bottom: 0,
    right: 0,
    alignItems: 'center',
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginLeft: 80,
    marginRight: 80,
    margin: 30,
  },
  smallImageWrapper: {
    width: Dimensions.get('window').width / 4,
    height: Dimensions.get('window').width / 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ECECEC',

  },
  smallImage: {
    width: 90,
    height: 50,
  },
});

const Screen1 = (props) => (
  <View style={styles.container}>
    <TouchableWithoutFeedback onPress={() => props.navigation.navigate('screen2')}>
      <View style={styles.top1}>
        <Transition appear="left" shared="paper">
          <View style={styles.paper1} />
        </Transition>
        <Transition appear="right" shared="image">
          <Image style={styles.shoe1} source={require('./assets/air-jordan-1.png')} />
        </Transition>
        <Transition appear="horizontal">
          <View style={styles.headerContainer1}>
            <Text style={styles.header1}>THE TEN</Text>
            <Text style={styles.subHeader1}>AIR JORDAN 1</Text>
          </View>
        </Transition>
      </View>
    </TouchableWithoutFeedback>
  </View>
);
const Screen2 = (props) => (
  <View style={styles.container}>
    <TouchableWithoutFeedback onPress={() => props.navigation.goBack()}>
      <View style={styles.top2}>
        <Transition shared="paper">
          <View style={styles.paper2} />
        </Transition>
        <Transition shared="image">
          <Image style={styles.shoe2} source={require('./assets/air-jordan-1.png')} />
        </Transition>
        <View style={styles.smallImageContainer}>
          <Transition appear="horizontal" delay>
            <View style={styles.smallImageWrapper}>
              <Image style={styles.smallImage} source={require('./assets/air-jordan-1.png')} />
            </View>
          </Transition>
          <Transition appear="horizontal" delay>
            <View style={styles.smallImageWrapper}>
              <Image style={styles.smallImage} source={require('./assets/air-jordan-1.png')} />
            </View>
          </Transition>
        </View>
        <Transition appear="horizontal">
          <View style={styles.headerContainer2}>
            <Text style={styles.header2}>THE TEN</Text>
            <Text style={styles.subHeader2}>AIR JORDAN 1</Text>
          </View>
        </Transition>
      </View>
    </TouchableWithoutFeedback>
  </View>
);

const Navigator = FluidNavigator({
  screen1: { screen: Screen1 },
  screen2: { screen: Screen2 },
}, {
  style: { backgroundColor: '#C14534' },
  navigationOptions: {
    gesturesEnabled: true,
  },
});

export default () => (
  <Navigator />
);
