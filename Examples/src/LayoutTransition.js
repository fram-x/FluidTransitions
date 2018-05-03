import React from 'react';
import { View, Text, Button, ScrollView, Dimensions, Image, StyleSheet } from 'react-native';

import { FluidNavigator, Transition } from 'react-navigation-fluid-transitions';

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  screen: {
    flex: 1,
    flexDirection: 'row',
    padding: 20,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: '#EDEDED',
    marginBottom: 20,
  },
  buttonRotatedContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    transform: [{ rotate: '180deg' }],
    backgroundColor: '#EDEDED',
    marginBottom: 20,
  },
  textContainer: {

  },
  image: {
    width: Dimensions.get('window').width - 40,
    height: (Dimensions.get('window').width - 40) * 0.5,
  },
  smallImage: {
    width: (Dimensions.get('window').width - 45) * 0.5,
    height: ((Dimensions.get('window').width - 45) * 0.5) * 0.5,
  },
  imageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 14,
    paddingBottom: 14,
  },
  header: {
    fontWeight: 'bold',
    fontSize: 20,
  },
});

const InitialScreen = (props) => (
  <ScrollView contentContainerStyle={styles.container}>
    <Transition shared="buttons">
      <View style={styles.buttonContainer}>
        <Button title="Toggle" onPress={() => props.navigation.navigate('screen')} />
      </View>
    </Transition>
    <Text style={styles.header}>Lorem ipsum</Text>
    <View style={{ height: 15 }} />
    <Transition shared="text1">
      <Text style={styles.textContainer}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus condimentum
        magna ut tortor vehicula tincidunt. Vestibulum nisi libero, lacinia ac consequat id,
        porttitor ac nisi. Praesent luctus ex sem. Integer vel elit eleifend, semper enim ut,
        euismod arcu.
      </Text>
    </Transition>
    <View style={{ height: 15 }} />
    <Transition shared="image1">
      <Image source={{ uri: 'https://picsum.photos/200/100?image=12' }} style={styles.image} />
    </Transition>
    <View style={{ height: 15 }} />
    <Transition shared="text2">
      <Text style={styles.textContainer}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus condimentum
        magna ut tortor vehicula tincidunt. Vestibulum nisi libero, lacinia ac consequat id,
        porttitor ac nisi. Praesent luctus ex sem. Integer vel elit eleifend, semper enim ut,
        euismod arcu.
      </Text>
    </Transition>
    <View style={{ height: 15 }} />
    <Transition shared="image2">
      <Image source={{ uri: 'https://picsum.photos/200/100?image=22' }} style={styles.image} />
    </Transition>
  </ScrollView>
);

const Screen = (props) => (
  <ScrollView contentContainerStyle={styles.container}>
    <Transition shared="buttons">
      <View style={styles.buttonRotatedContainer}>
        <Button title="Toggle" onPress={() => props.navigation.goBack()} />
      </View>
    </Transition>
    <Transition shared="text1">
      <Text style={styles.textContainer}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus condimentum
        magna ut tortor vehicula tincidunt. Vestibulum nisi libero, lacinia ac consequat id,
        porttitor ac nisi. Praesent luctus ex sem. Integer vel elit eleifend, semper enim ut,
        euismod arcu.
      </Text>
    </Transition>
    <View style={styles.imageContainer}>
      <Transition shared="image1">
        <Image source={{ uri: 'https://picsum.photos/200/100?image=12' }} style={styles.smallImage} />
      </Transition>
      <Transition shared="image2">
        <Image source={{ uri: 'https://picsum.photos/200/100?image=22' }} style={styles.smallImage} />
      </Transition>
    </View>
    <Transition shared="text2">
      <Text style={styles.textContainer}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus condimentum
        magna ut tortor vehicula tincidunt. Vestibulum nisi libero, lacinia ac consequat id,
        porttitor ac nisi. Praesent luctus ex sem. Integer vel elit eleifend, semper enim ut,
        euismod arcu.
      </Text>
    </Transition>
  </ScrollView>
);

const Navigator = FluidNavigator({
  home: { screen: InitialScreen },
  screen: { screen: Screen },
});

class LayoutTransitions extends React.Component {
  static router = Navigator.router;
  render() {
    return (
      <Navigator navigation={this.props.navigation} />
    );
  }
}

export default LayoutTransitions;
