import React from 'react';
import { View, Text, Button, TouchableOpacity, StyleSheet } from 'react-native';

import { FluidNavigator, Transition } from 'react-navigation-fluid-transitions';

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
//   constructor(props) {
//     super(props);
//     this.state = { count: 1 };
//   }
//   render() {
//     return (
//       <TouchableOpacity
//         style={{
//           justifyContent: 'center',
//           alignItems: 'center',
//           borderColor: this.props.background,
//           borderWidth: 2,
//           width: this.props.size,
//           height: this.props.size,
//         }}
//         onPress={() => { this.setState({ count: this.state.count + 1 }); }}
//       >
//         <Text>{this.state.count}</Text>
//       </TouchableOpacity>
//     );
//   }
// }

const Screen1 = (props) => (
  <View style={styles.container}>
    <Text>Screen 1</Text>
    <View style={styles.screen1}>
      <Transition shared="circle">
        <Circle background="#FF0000" size={20} />
      </Transition>
    </View>
    <Button
      title="Next"
      onPress={() => props.navigation.navigate('screen2')}
    />
  </View>
);

const Screen2 = (props) => (
  <View style={styles.container}>
    <Text>Screen 2</Text>
    <View style={styles.screen2}>
      <Transition shared="circle">
        <Circle background="#FF0000" size={60} />
      </Transition>
    </View>
    <View style={styles.buttons}>
      <Button
        title="Back"
        onPress={() => props.navigation.goBack()}
      />
      <Button
        title="Next"
        onPress={() => props.navigation.navigate('screen3')}
      />
    </View>
  </View>
);

const Screen3 = (props) => (
  <View style={styles.container}>
    <Text>Screen 3</Text>
    <View style={styles.screen3}>
      <Transition shared="circle">
        <Circle background="#FF0000" size={100} />
      </Transition>
    </View>
    <Button
      title="Back"
      onPress={() => props.navigation.goBack()}
    />
  </View>
);

const Navigator = FluidNavigator({
  screen1: { screen: Screen1 },
  screen2: { screen: Screen2 },
  screen3: { screen: Screen3 },
});

export default () => (
  <Navigator />
);
