import React from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { withNavigation } from 'react-navigation';
import { Transition, FluidNavigator } from 'react-navigation-fluid-transitions';

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
    padding: 20,
  },
  circle1: {
    backgroundColor: '#EE0000',
    width: 50,
    height: 50,
    borderRadius: 4,
  },
  circle2: {
    backgroundColor: '#EE0000',
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  circle3: {
    backgroundColor: '#EE0000',
    width: 140,
    height: 140,
    borderRadius: 4,
  },
});

const Circle = props => (
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
const SCREEN_IDS = ['screen1', 'screen2', 'screen3'];
const ScreensList = ({ navigation }) => {
  const activeScreen = navigation.state.routeName;
  return (
    <View style={{ height: 50, alignSelf: 'stretch', flexDirection: 'row' }}>
      {SCREEN_IDS.map(screenID => (
        <TouchableOpacity
          key={screenID}
          style={{ flex: 1, justifyContent: 'center', borderWidth: 1, borderColor: '#FF0000' }}
          onPress={() => {
            navigation.navigate(screenID);
          }}
        >
          <Transition shared={screenID}>
            <Text
              style={{
                textAlign: 'center',
                color: screenID === activeScreen ? 'blue' : 'black',
                fontSize: screenID === activeScreen ? 32 : 14,
              }}
            >
              {screenID}
            </Text>
          </Transition>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const Screen1 = props => (
  <View style={styles.container}>
    <ScreensList navigation={props.navigation} />
    {/* <View style={styles.screen1}>
      <Transition shared="circle">
        <View style={styles.circle1} />
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
    </View> */}
    <Transition appear="horizontal">
      <View style={styles.buttons}>
        <Button
          title="Next"
          onPress={() => props.navigation.navigate('screen2')}
        />
      </View>
    </Transition>
  </View>
);

const Screen2 = props => (
  <View style={styles.container}>
    <ScreensList navigation={props.navigation} />
    {/* <View style={styles.screen2}>
      <Transition shared="circle">
        <View style={styles.circle2} />
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
    </View> */}
    <Transition appear="horizontal">
      <View style={styles.buttons}>
        <Button title="Back" onPress={() => props.navigation.goBack()} />
        <View style={{ width: 20 }} />
        <Button
          title="Next"
          onPress={() => props.navigation.navigate('screen3')}
        />
      </View>
    </Transition>
  </View>
);

const Screen3 = props => (
  <View style={styles.container}>
    <ScreensList navigation={props.navigation} />
    {/* <View style={styles.screen3}>
      <Transition shared="circle">
        <View style={styles.circle3} />
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
    </View> */}
    <Transition appear="horizontal">
      <View style={styles.buttons}>
        <Button title="Back" onPress={() => props.navigation.goBack()} />
      </View>
    </Transition>
  </View>
);

const SharedElements = FluidNavigator(
  {
    screen1: { screen: Screen1 },
    screen2: { screen: Screen2 },
    screen3: { screen: Screen3 },
  },
  {
    navigationOptions: { gesturesEnabled: true },
  },
);

export default SharedElements;
