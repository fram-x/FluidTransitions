# Fluid Transitions for React Navigation

<a href="https://www.npmjs.com/package/react-navigation-fluid-transitions">
  <img src="https://img.shields.io/npm/v/react-navigation-fluid-transitions.svg?style=flat-square">
</a>
<a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-blue.svg"></a>

## Introduction
This project aims to implement a simple yet powerful set of constructs for building fluid transitions between elements when navigating with [React Navigation](https://reactnavigation.org). 

The library is JavaScript only - no linking required.

<img src="https://github.com/fram-x/FluidTransitions/raw/develop/docs/final.gif" width="240">|<img src="https://github.com/fram-x/FluidTransitions/raw/develop/docs/final.gif" width="240">



[Snack on Expo](https://snack.expo.io/HJM75VtqG)

The library implements a new navigator component called `FluidNavigator` with the same interface and routing configuration as the `StackNavigator`. The library has a component called `Transition` which can be used to build different types of transitions that will automatically be run when navigating between screens using the regular navigation actions.

> The Navigator's API is identical to the StackNavigator except that it does not support a header component. It can easily be integrated with redux and your existing navigation setups.

## Installation

To install the library into your project, run yarn or npm:

`yarn add react-navigation-fluid-transitions`

or

`npm -i react-navigation-fluid-transitions`

## Examples
Examples are included as a runnable React Native project found in the `Examples`.

To start the example, navigate to the examples folder and run the following commands from the terminal:

`npm i` or `yarn`

To start the project run

`react-native run-ios` or `react-native run-android`

### Shared Element Transitions
This example shows how two elements can be set up to automatically transition between each other when navigating between screens. A more detailed edition of this example can be found in the file [SharedElements.js](./Examples/src/SharedElements.js).

> Note that a shared transition happens between two elements that looks the same. The library animates position and scale between the two hence using different styles and content between the two elements will result in strange transitions.

```javascript
const Screen1 = (props) => (
  <View style={styles.container}>
    <Text>Screen 1</Text>
    <View style={styles.screen1}>
      <Transition shared='circle'>
        <View style={styles.circle}/>
      </Transition>
    </View>
    <Button
      title='Next'
      onPress={() => props.navigation.navigate('screen2')}
    />
  </View>
);

const Screen2 = (props) => (
  <View style={styles.container}>
    <Text>Screen 2</Text>
    <View style={styles.screen2}>
      <Transition shared='circle'>
        <View style={styles.circle2}/>
      </Transition>
    </View>
    <Button
      title='Back'
      onPress={() => props.navigation.goBack()}
    />
  </View>
);

const Navigator = FluidNavigator({
  screen1: { screen: Screen1 },
  screen2: { screen: Screen2 },
});

```

### Transitions
The library also supports transitions for elements wrapped in the `Transition` component. You can provide appear/disappear transitions that will be animated during navigation.

The `Transition` element supports appear and disappear transitions (appear will be used if disappear is not set), and these can either be one of the predefined transitions - or functions where you provide your own transitions.

```javascript
<Transition appear='scale' disappear='bottom'>
  <View style={styles.circle}/>
</Transition>
```

#### Transitions

| Name        | Description | 
| ----------  | ------------- | 
| scale      	| Scales the element in and out | 
| top      	| Translates the element in/out from the top of the screen | 
| bottom | Translates the element in/out from the bottom of the screen | 
| left | Translates the element in/out from the left of the screen | 
| right | Translates the element in/out from the right of the screen | 
| horizontal | Translates the element in/out from the left/right of the screen | 
| vertical | Translates the element in/out from the top/bottom of the screen | 
| flip | Flips the element in/out | 

#### Custom transitions
It is easy to provide custom transitions - just add the transition function to your component's appear or disappear property. The following example creates a transition that will scale in from 88 times the original size of the wrapped component:

```javascript
<Transition appear={myCustomTransitionFunction}>
  <View style={styles.circle}/>
</Transition>

myCustomTransitionFunction = (transitionInfo) => {
  const { progress, start, end } = transitionInfo;
  const scaleInterpolation = progress.interpolate({
    inputRange: [0, start, end, 1],
    outputRange: [88, 80, 1, 1],
  });
  return { transform: [{ scale: scaleInterpolation }] };
}
```

Read more about the parameters and functionality for building [custom transitions](./docs/CustomTransition.md).

#### Delay
Each transition can be delayed by setting the delay property. This will cause the transition to be started a little bit later than the previous one to give the impression that elements appear in sequence.

### Technical
The library uses native animations on both Android and iOS to get full 60 fps performance. Custom transitions trying to animate properties that are not supported by the native animation driver will not work.

The transitions implemented in the shared element transition is currently scaling and position. Rotation is not working due to a (bug)(https://github.com/facebook/react-native/issues/14161) in React Native Android.

> Some of the concepts in the library builds on ideas from [@lintonye](https://github.com/lintonye)'s pull request and suggestion found here: [Shared element transition #941](https://github.com/react-navigation/react-navigation/pull/941).
