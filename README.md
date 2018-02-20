# Fluid Transitions for React Navigation

## Introduction
This project aims to implement a simple yet powerful set of constructs for building fluid transitions between screens in [React Navigation](https://reactnavigation.org). The library builds on ideas from [@lintonye](https://github.com/lintonye)'s pull request and suggestion found here: [Shared element transition #941](https://github.com/react-navigation/react-navigation/pull/941).

The library implements a new navigator component that works just like the StackNavigator. In addition it has a new component called <Transition> which can be used to build different types of fluid transitions that will automatically be run when navigating between screens using the regular navigation actions.

> The Navigator's API is identical to the StackNavigator and can easily be integrated with redux and existing navigation setups.

## Examples
Examples are found in the `Examples` folder and is a runnable React Native project. 

To start the example, navigate to the examples folder and run the following commands from the terminal:

`npm i`
`react-native run-ios|run-android`

### Shared Element Transitions
This example shows how to elements can be set up to automatically transition between each other when navigating between screens:

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
                <View style={styles.circle}/>
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
