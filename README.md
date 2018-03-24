# Fluid Transitions for React Navigation

## Introduction
This project aims to implement a simple yet powerful set of constructs for building fluid transitions between screens in [React Navigation](https://reactnavigation.org).

The library implements a new navigator component (`FluidNavigator`) that works just like a `StackNavigator`. In addition it has a new component called `Transition` which can be used to build different types of fluid transitions that will automatically be run when navigating between screens using the regular navigation actions.

> The Navigator's API is identical to the StackNavigator and can easily be integrated with redux and existing navigation setups.

## Examples
Examples are found in the `Examples` folder and is a runnable React Native project.

To start the example, navigate to the examples folder and run the following commands from the terminal:

`npm i`

`react-native run-ios|run-android`

### Shared Element Transitions
This example shows how two elements can be set up to automatically transition between each other when navigating between screens. The example can be found in the file [SharedElements.js](./Examples/src/SharedElements.js).

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
In addition the library supports transitions for elements wrapped in a `Transition` tag. You can provide appear/disappear transitions that will be animated during navigation.

The `Transition` element supports appear and disappear transitions (appear will be used if disappear is not set), and these can either be one of the predefined transitions - or functions where you provide your own transitions.

```javascript
<Transition appear='scale' disappear='bottom'>
  <View style={styles.circle}/>
</Transition>
```

#### The built in transitions are:

| Name        | Description | 
| ----------  | ------------- | 
| scale      	| Scales the element in and out | 
| top      	| Translates the element in/out from the top of the screen | 
| bottom | Translates the element in/out from the bottom of the screen | 
| left | Translates the element in/out from the left of the screen | 
| right | Translates the element in/out from the right of the screen | 
| horizontal | Translates the element in/out from the top/bottom of the screen | 
| vertical | Translates the element in/out from the left/right of the screen | 
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

### Technical
This libraries uses native animations on both Android and iOS to get full performance. Custom transitions trying to animate properties that are not supported by the native animation driver will not work.

> Some of the concepts in the library builds on ideas from [@lintonye](https://github.com/lintonye)'s pull request and suggestion found here: [Shared element transition #941](https://github.com/react-navigation/react-navigation/pull/941).
