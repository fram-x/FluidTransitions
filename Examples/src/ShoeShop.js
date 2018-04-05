import React from 'react';
import { View, Image, Dimensions, Text, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { Transition, FluidNavigator } from 'react-navigation-fluid-transitions';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  shoe1: {
    width: 230,
    height: 150,
    position: 'absolute',
    left: Dimensions.get('window').width - 180,
    top: Dimensions.get('window').height * 0.5 - 120,
    transform: [{ rotate: '20deg' }],
  },
  shoe2: {
    width: 200,
    height: 130,
    position: 'absolute',
    left: Dimensions.get('window').width * 0.5 - 100,
    top: Dimensions.get('window').height * 0.5 - 80,
  },
  top1: {
    backgroundColor: '#CCC',
    flex: 1,
  },
  paper1: {
    backgroundColor: '#AF2222',
    width: 220,
    height: 220,
    position: 'absolute',
    left: Dimensions.get('window').width * 0.5 - 110,
    top: Dimensions.get('window').height * 0.5 - 150,
    transform: [{ rotate: '-20deg' }],
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    padding: 10,
  },
  paper2: {
    backgroundColor: '#AA020222',
    position: 'absolute',
    left: 0,
    top: Dimensions.get('window').height * 0.5,
    bottom: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 70,
    padding: 10,
  },
  top2: {
    backgroundColor: '#EFEFEF',
    flex: 1,
  },
  boxHeader: {
    color: '#FFF',
  },
  boxHeader2: {
    color: '#555555',
    fontWeight: 'bold',
    fontSize: 18,
  },
  smallImageContainer: {
    position: 'absolute',
    left: 0,
    top: Dimensions.get('window').height * 0.5,
    bottom: 0,
    right: 0,
    alignItems: 'center',
    paddingTop: 70,
    flexDirection: 'row',
    justifyContent: 'center',
    marginLeft: 80,
    marginRight: 80,
    margin: 30,
  },
  smallImageWrapper: {
    width: 90,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginLeft: 5,
    marginRight: 5,
  },
  smallImage: {
    width: 80,
    height: 45,
  },
});

const Screen1 = (props) => (
  <View style={styles.container}>
    <TouchableWithoutFeedback onPress={() => props.navigation.navigate('screen2')}>
      <View style={styles.top1}>
        <Transition appear="left" shared="paper" modifiers="layout">
          <View style={styles.paper1}>
            <Text style={styles.boxHeader}>NIKE AIR JORDAN</Text>
          </View>
        </Transition>
        <Transition appear="right" shared="image">
          <Image style={styles.shoe1} source={require('./assets/air-jordan-1.png')} />
        </Transition>
      </View>
    </TouchableWithoutFeedback>
  </View>
);
const Screen2 = (props) => (
  <View style={styles.container}>
    <TouchableWithoutFeedback onPress={() => props.navigation.goBack()}>
      <View style={styles.top2}>
        <Transition shared="paper" modifiers="layout">
          <View style={styles.paper2}>
            <Transition appear="left">
              <Text style={styles.boxHeader2}>NIKE AIR JORDAN</Text>
            </Transition>
          </View>
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
          <Transition appear="horizontal" delay>
            <View style={styles.smallImageWrapper}>
              <Image style={styles.smallImage} source={require('./assets/air-jordan-1.png')} />
            </View>
          </Transition>
        </View>
      </View>
    </TouchableWithoutFeedback>
  </View>
);

const Navigator = FluidNavigator({
  screen1: { screen: Screen1 },
  screen2: { screen: Screen2 },
});

export default () => (
  <Navigator />
);
