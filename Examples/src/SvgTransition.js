import React from 'react';
import { View, Button } from 'react-native';
import { TransitionView, createFluidNavigator } from 'react-navigation-fluid-transitions';
import { createStackNavigator } from 'react-navigation';

class Screen1 extends React.Component {
  render() {
    return (
      <View>
        <Button title="Next" onPress={() => this.props.navigation.navigate('screen2')} />
      </View>
    );
  }
}

class Screen2 extends React.Component {
  render() {
    return (
      <View>
        <Button title="Back" onPress={() => this.props.navigation.goBack()} />
      </View>
    );
  }
}

const Navigator = createFluidNavigator({
  screen1: { screen: Screen1 },
  screen2: { screen: Screen2 },
}, {
  navigationOptions: { gesturesEnabled: true },
});

class SvgTransition extends React.Component {
  static router = Navigator.router;
  render() {
    return (
      <Navigator navigation={this.props.navigation} />
    );
  }
}

export default SvgTransition;
