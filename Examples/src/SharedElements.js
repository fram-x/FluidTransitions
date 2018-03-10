import React from 'react';
import { View, Text, Button, Slider, Animated, Easing, StyleSheet } from 'react-native';

import { Transition, TransitionView, TransitionRouteView } from 'react-navigation-fluid-transitions';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  screen1: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    alignSelf: 'stretch',
    padding: 20,
  },
  screen2: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    justifyContent: 'center',
    padding: 20,
  },
  screen3: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    justifyContent: 'center',
    padding: 20,
  },
  buttons: {
    flexDirection: 'row',
  },
});

const Circle = (props) => (
  <View
    style={{
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: props.background,
      width: props.size,
      height: props.size,
      borderRadius: props.size / 2,
    }}
  />
);

// class Circle extends React.Component {
//   render() {
//     return (
//       <View
//         style={{ ...this.props.style,
//           justifyContent: 'center',
//           alignItems: 'center',
//           backgroundColor: this.props.background,
//           width: this.props.size,
//           height: this.props.size,
//           borderRadius: this.props.size / 2,
//         }}
//       />
//     );
//   }
// }

const Screen1 = () => (
  <View style={styles.container}>
    <Transition appear="scale">
      <Text>1.Screen</Text>
    </Transition>
    <View style={styles.screen1}>
      <Transition shared="circle">
        <Circle background="#FF0000" size={10} />
      </Transition>
    </View>
    <View style={{ flexDirection: 'row' }}>
      <Transition appear="horizontal" delay>
        <Circle background="#55AA55" size={20} />
      </Transition>
      <View style={{ width: 20 }} />
      <Transition appear="horizontal" delay>
        <Circle background="#55AA55" size={20} />
      </Transition>
      <View style={{ width: 20 }} />
      <Transition appear="horizontal" delay>
        <Circle background="#55AA55" size={20} />
      </Transition>
    </View>
  </View>
);

const Screen2 = () => (
  <View style={styles.container}>
    <Transition appear="scale">
      <Text>2.Screen</Text>
    </Transition>
    <View style={styles.screen2}>
      <Transition shared="circle">
        <Circle background="#FF0000" size={40} />
      </Transition>
    </View>
    <View style={{ flexDirection: 'row' }}>
      <Transition appear="horizontal" delay>
        <Circle background="#55AA55" size={20} />
      </Transition>
      <View style={{ width: 20 }} />
      <Transition appear="horizontal" delay>
        <Circle background="#55AA55" size={20} />
      </Transition>
      <View style={{ width: 20 }} />
      <Transition appear="horizontal" delay>
        <Circle background="#55AA55" size={20} />
      </Transition>
    </View>
  </View>
);

class Screen extends React.Component<any> {
  constructor(props) {
    super(props);
    this._value = 0;
    this._progress = new Animated.Value(this._value);
    this._animate = this._animate.bind(this);
    this._increase = this._increase.bind(this);
    this._decrease = this._decrease.bind(this);
    this._increaseMore = this._increaseMore.bind(this);
    this._decreaseMore = this._decreaseMore.bind(this);
    this._toggled = false;
    this._step = 0.0001;
  }

  _value: number;
  _progress: Animated.Value;
  _toggled: boolean;
  _slider: ?Slider;
  _animation: ?Animated.CompositeAnimation;
  _step: number;

  _increaseMore = () => this._inc(0.01);
  _decreaseMore = () => this._dec(0.01);
  _increase = () => this._inc(this._step);
  _decrease = () => this._dec(this._step);
  _dec(step) {
    if (this._value >= step) {
      this._value -= step;
      this._progress.setValue(this._value);
      console.log(this._value);
    }
  }
  _inc(step) {
    if (this._value <= 1.0 - step) {
      this._value += step;
      this._progress.setValue(this._value);
      console.log(this._value);
    }
  }

  _animate = () => {
    if (this._animation) {
      this._animation.stop();
    }
    const toValue = this._toggled ? 0 : 1;
    this._animation = Animated.timing(this._progress, {
      toValue,
      duration: 1500,
      easing: Easing.inOut(Easing.poly(4)),
      useNativeDriver: true,
    });

    this._animation.start(() => {
      this._animation = null;
      this._toggled = !this._toggled;
      this._value = toValue;
    });
  }

  render() {
    return (
      <TransitionView style={{ flex: 1 }} progress={this._progress}>
        <TransitionRouteView route="screen1" style={{ flex: 1 }}>
          <Screen1 />
        </TransitionRouteView>
        <View style={{ height: 1, backgroundColor: '#AAA' }} />
        <TransitionRouteView route="screen2" style={{ flex: 1 }}>
          <Screen2 />
        </TransitionRouteView>
        <View style={{ justifyContent: 'center',
          padding: 10,
          paddingLeft: 20,
          paddingRight: 20,
          backgroundColor: '#ECECEC' }}
        >
          <Slider
            minimumValue={0}
            maximumValue={100}
            step={1}
            ref={(ref) => this._slider = ref}
            onValueChange={val => {
              this._value = val * 0.01;
              this._progress.setValue(this._value);
            }}
          />
          <View style={{ height: 10 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Button title="< <" onPress={this._decreaseMore} />
            <Button title="<" onPress={this._decrease} />
            <Button title="Animate" onPress={this._animate} />
            <Button title=">" onPress={this._increase} />
            <Button title="> >" onPress={this._increaseMore} />
          </View>
        </View>
      </TransitionView>
    );
  }
}

export default Screen;
