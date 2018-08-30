import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
  Dimensions,
  Animated,
  UIManager,
  findNodeHandle,
} from 'react-native';

import { createAnimatedWrapper } from '../lib/Utils';

const Shape = (props) => (
  <View {...props} />
);

export default class Playground extends Component {
  constructor(props) {
    super(props);
    this._nativeProgress = new Animated.Value(0);
    this._progress = new Animated.Value(0);
    this._nativeProgress.addListener(Animated.event(
      [{ value: this._progress }],
      {
        duration: 1750,
        useNativeDriver: false,
      },
    ));

    this._rotate = { transform: [{ rotate: this._nativeProgress.interpolate({
      inputRange: [0, 1],
      outputRange: ['-20deg', '-140deg'],
    }) }] };

    this._translate = { transform: [{ translateX: this._nativeProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [-100, +100],
    }) }] };

    this._background = {
      backgroundColor: this._progress.interpolate({
        inputRange: [0, 1],
        outputRange: ['#AF2222', '#22AF22'],
      }),
      borderRadius: this._progress.interpolate({
        inputRange: [0, 1],
        outputRange: [4, 25],
      }),
      borderColor: '#AAA',
      borderWidth: this._progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 10],
      }),
    };
  }

  _nativeProgress: Animated;

  _progress: Animated;

  _rotate: any;

  _translate: any;

  _background: any;

  _ref: any;

  animate = () => {
    Animated.timing(this._nativeProgress, { toValue: 1, useNativeDriver: true })
      .start(() => Animated.timing(this._nativeProgress, { toValue: 0, useNativeDriver: true })
        .start());
  }

  setRef = (ref: any) => {
    this._ref = ref;
  }

  onLayout = () => {
    if (!this._ref) return;
    const nh = findNodeHandle(this._ref);
    UIManager.measure(nh, (x, y, width, height) => {
      console.log(`${x},${y} - ${width},${height}`);
    });
  }

  render() {
    return (
      <View style={styles.container}>
        {cw(<Text>Hello World!</Text>)}
        {cw(<View style={styles.buttons}>
          <Button title="Button1" onPress={this.animate} />
          <Button title="Button2" onPress={this.animate} />
            </View>)}
        {cw(<Shape ref={this.setRef} onLayout={this.onLayout} style={styles.circle1} />, null, this._background)}
        {cw(<View style={styles.roundText}><Text style={styles.innerRoundText}>Text</Text></View>, this._translate)}
        {cw(<Shape style={styles.paper1}><Text>Paper 1</Text></Shape>, this._rotate, this._background)}
        {cw(<View style={styles.paper2}><Text>Paper 2</Text></View>)}
        {cw(<View style={styles.detailsView}>
          <Text style={styles.text}>Hello World</Text>
          <View style={styles.buttonContainer}>
            <Button title="Back" onPress={() => {}} />
          </View>
        </View>)}
      </View>
    );
  }
}

const cw = (
  component: any,
  nativeStyles: ?StyleSheet.Styles,
  styles: ?StyleSheet.Styles,
) => createAnimatedWrapper({ component,
  nativeStyles: [nativeStyles],
  styles,
  log: true,
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
    paddingTop: 80,
  },
  circle1: {
    width: 50,
    height: 50,
    margin: 20,
    backgroundColor: '#EE0000',
    borderRadius: 4,
    shadowColor: '#000',
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    elevation: 5,
  },
  paper1: {
    width: 180,
    height: 180,
    margin: 20,
    position: 'absolute',
    left: Dimensions.get('window').width * 0.5 - 90,
    top: Dimensions.get('window').height * 0.5,
    transform: [{ rotate: '-20deg' }],
    backgroundColor: '#AF2222',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'flex-end',
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
    padding: 10,
  },
  roundText: {
    borderRadius: 25,
    backgroundColor: '#1F0FAA',
    padding: 10,
    paddingTop: 15,
    paddingBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerRoundText: {
    color: '#FFF',
  },
  buttons: {
    flexDirection: 'row',
  },
  detailsView: {
    padding: 10,
    marginBottom: 40,
    backgroundColor: '#ECECEC',
    flex: 1,
  },
  buttonContainer: {
    padding: 10,
    flex: 1,
    backgroundColor: '#0F0',
    justifyContent: 'flex-end',
  },
  text: {
    paddingBottom: 40,
  },
});
