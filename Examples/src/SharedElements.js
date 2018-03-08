import React from 'react';
import { View, Text, Button, Slider, Animated, Easing, StyleSheet } from 'react-native';

import { Transition, TransitionView, TransitionRouteView } from 'react-navigation-fluid-transitions';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 80,
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
//       <TouchableOpacity
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
      <Text>Screen 1</Text>
    </Transition>
    <View style={styles.screen1}>
      <Transition shared="circle">
        <Circle background="#FF0000" size={20} />
      </Transition>
    </View>
    <View style={{ flexDirection: 'row' }}>
      <Transition appear="horizontal">
        <Circle background="#55AA55" size={20} />
      </Transition>
      <View style={{ width: 20 }} />
      <Transition appear="horizontal">
        <Circle background="#55AA55" size={20} />
      </Transition>
      <View style={{ width: 20 }} />
      <Transition appear="horizontal">
        <Circle background="#55AA55" size={20} />
      </Transition>
    </View>
  </View>
);

const Screen2 = () => (
  <View style={styles.container}>
    <Transition appear="scale">
      <Text>Screen 2</Text>
    </Transition>
    <View style={styles.screen2}>
      <Transition shared="circle">
        <Circle background="#FF0000" size={60} />
      </Transition>
    </View>
    <View style={{ flexDirection: 'row' }}>
      <Transition appear="horizontal">
        <Circle background="#55AA55" size={20} />
      </Transition>
      <View style={{ width: 20 }} />
      <Transition appear="horizontal">
        <Circle background="#55AA55" size={20} />
      </Transition>
      <View style={{ width: 20 }} />
      <Transition appear="horizontal">
        <Circle background="#55AA55" size={20} />
      </Transition>
    </View>
  </View>
);

class Screen extends React.Component<any> {
  constructor(props) {
    super(props);
    this._progress = new Animated.Value(0);
    this._animate = this._animate.bind(this);
    this._toggled = false;
  }
  _progress: Animated.Value;
  _toggled: boolean;
  _animation: ?Animated.CompositeAnimation;
  _animate = () => {
    if (this._animation) {
      this._animation.stop();
    }

    this._animation = Animated.timing(this._progress, {
      toValue: this._toggled ? 0 : 1,
      duration: 1000,
      easing: Easing.out(Easing.poly(4)),
      useNativeDriver: true,
    });
    this._animation.start(() => {
      this._animation = null;
      this._toggled = !this._toggled;
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
        <View style={{ justifyContent: 'center', padding: 10, paddingLeft: 20, paddingRight: 20, backgroundColor: '#ECECEC' }} >
          <Slider
            minimumValue={0}
            maximumValue={100}
            step={1}
            onValueChange={val => this._progress.setValue(val * 0.01)}
            // value={this._progress}
          />
          <Button title="Animate" onPress={this._animate} />
        </View>
      </TransitionView>
    );
  }
}

export default Screen;
