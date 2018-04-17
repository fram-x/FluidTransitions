/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React from 'react';
import { StackNavigator } from 'react-navigation';

import HomeScreen from './src/HomeScreen';
import SharedElements from './src/SharedElements';
import AppearingElements from './src/AppearingElements';
import ImageTransition from './src/ImageTransition';
import LayoutTransition from './src/LayoutTransition';
import Onboarding from './src/Onboarding';
import ShoeShop from './src/ShoeShop';
import Playground from './src/Playground';

const ExampleNavigator = StackNavigator({
  home: { screen: HomeScreen, navigationOptions: { title: 'Fluid Transitions' } },
  shared: { screen: SharedElements },
  appear: { screen: AppearingElements },
  image: { screen: ImageTransition },
  layout: { screen: LayoutTransition },
  onboarding: { screen: Onboarding },
  shoes: { screen: ShoeShop },
});

class MyApp extends React.Component<any> {
  render() {
    return (
      <ExampleNavigator />
    );
  }
}

export default MyApp;
