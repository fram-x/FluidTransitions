/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React from 'react';
import { createStackNavigator } from 'react-navigation';
import { useScreens } from 'react-native-screens';

import HomeScreen from './Examples/HomeScreen';
import SharedElements from './Examples/SharedElements';
import AppearingElements from './Examples/AppearingElements';
import ImageTransition from './Examples/ImageTransition';
import LayoutTransition from './Examples/LayoutTransition';
import Onboarding from './Examples/Onboarding';
import ShoeShop from './Examples/ShoeShop';
import FlatList from './Examples/FlatList';
import AnimatedProperty from './Examples/AnimatedProperty';
import Playground from './Examples/Playground';

useScreens();

const ExampleNavigator = createStackNavigator({
  home: { screen: HomeScreen, navigationOptions: { title: 'Fluid Transitions' } },
  shared: { screen: SharedElements },
  appear: { screen: AppearingElements },
  image: { screen: ImageTransition },
  layout: { screen: LayoutTransition },
  onboarding: { screen: Onboarding },
  shoes: { screen: ShoeShop },
  flatlist: { screen: FlatList },
  animatedProperty: { screen: AnimatedProperty },
});

class MyApp extends React.Component<any> {
  render() {
    return (
      <ExampleNavigator />
    );
  }
}

export default MyApp;
