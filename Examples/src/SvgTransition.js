import React from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { Transition, createFluidNavigator } from 'react-navigation-fluid-transitions';
// import { createStackNavigator } from 'react-navigation';
import { interpolate } from 'flubber';
import { Svg, G, Path } from 'react-native-svg';

const github = 'M256 70.7c-102.6 0-185.9 83.2-185.9 185.9 0 82.1 53.3 151.8 127.1 176.4 9.3 1.7 12.3-4 12.3-8.9V389.4c-51.7 11.3-62.5-21.9-62.5-21.9 -8.4-21.5-20.6-27.2-20.6-27.2 -16.9-11.5 1.3-11.3 1.3-11.3 18.7 1.3 28.5 19.2 28.5 19.2 16.6 28.4 43.5 20.2 54.1 15.4 1.7-12 6.5-20.2 11.8-24.9 -41.3-4.7-84.7-20.6-84.7-91.9 0-20.3 7.3-36.9 19.2-49.9 -1.9-4.7-8.3-23.6 1.8-49.2 0 0 15.6-5 51.1 19.1 14.8-4.1 30.7-6.2 46.5-6.3 15.8 0.1 31.7 2.1 46.6 6.3 35.5-24 51.1-19.1 51.1-19.1 10.1 25.6 3.8 44.5 1.8 49.2 11.9 13 19.1 29.6 19.1 49.9 0 71.4-43.5 87.1-84.9 91.7 6.7 5.8 12.8 17.1 12.8 34.4 0 24.9 0 44.9 0 51 0 4.9 3 10.7 12.4 8.9 73.8-24.6 127-94.3 127-176.4C441.9 153.9 358.6 70.7 256 70.7z';
const twitter = 'M419.6 168.6c-11.7 5.2-24.2 8.7-37.4 10.2 13.4-8.1 23.8-20.8 28.6-36 -12.6 7.5-26.5 12.9-41.3 15.8 -11.9-12.6-28.8-20.6-47.5-20.6 -42 0-72.9 39.2-63.4 79.9 -54.1-2.7-102.1-28.6-134.2-68 -17 29.2-8.8 67.5 20.1 86.9 -10.7-0.3-20.7-3.3-29.5-8.1 -0.7 30.2 20.9 58.4 52.2 64.6 -9.2 2.5-19.2 3.1-29.4 1.1 8.3 25.9 32.3 44.7 60.8 45.2 -27.4 21.4-61.8 31-96.4 27 28.8 18.5 63 29.2 99.8 29.2 120.8 0 189.1-102.1 185-193.6C399.9 193.1 410.9 181.7 419.6 168.6z';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 40,
  },
});

class Screen1 extends React.Component {
  constructor(props) {
    super(props);
    this._interpolator = interpolate(twitter, github);
  }

  _interpolator;
  _shape;
  _listener;

  interpolateFunction = (spec) => {
    const ip = spec.getInterpolation(false);
    if (this._listener) ip._parent.removeListener(this._listener);
    this._listener = ip._parent.addListener(this.animateIt);
    return {};
  }

  animateIt = ({ value }) => {
    if (this._shape) {
      this._shape.setNativeProps({ d: this._interpolator(value) });
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <Transition appear="top" shared="shape" interpolator={this.interpolateFunction}>
          <Svg height={250} width={250} >
            <G scale="0.5">
              <Path d={twitter} ref={(r) => this._shape = r} />
            </G>
          </Svg>
        </Transition>
        <Transition appear="horizontal">
          <Button title="Go to Github" onPress={() => this.props.navigation.navigate('screen2')} />
        </Transition>
      </View>
    );
  }
}

class Screen2 extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <Transition shared="shape">
          <Svg height={250} width={250} >
            <G scale="0.5">
              <Path d={github} />
            </G>
          </Svg>
        </Transition>
        <Transition appear="horizontal">
          <Button title="Back to Twitter" onPress={() => this.props.navigation.goBack()} />
        </Transition>
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
