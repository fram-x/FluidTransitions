# Transition API

The `Transition` element is used to wrap regular React elements that should be transitioned either as part of a shared element transition or as a transition when it appears or disappeas.

The element accepts only one child, trying to add multiple children will result in an error. 

## Shared Element Transition
A shared element transition happens when two elements in two different screens share the same transition identificator through the `shared` property of the Transition element.

```javascript
<Screen1>
  <Transition shared='common-name'>
    <View>...</View>
  </Transition>
</Screen1>

<Screen2>
  <Transition shared='common-name'>
    <View>...</View>
  </Transition>
</Screen2>
``` 

The `Transition` element must be in a tree of elements where a [`FluidNavigator`](FluidNavigator.md) is the parent view.

## Transition
In addition to taking part in a shared element transition, a `Transition` element can also be used to define how an element should appear and disappear when its screen is navigated to or from.

### Appear
The `appear` property defines either a name of a predefined transition or a function that will be called to create a transition. The predefined transitions are:

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

[More about how to use a custom transition function](CustomTransition.md).

### Disappear
The `disappear` property of the `Transition` element is used (if not set the appear property is used) when the screen for the element is navigated from. You can use the same predefined transitions as for the `appear` property or a custom transition function.

### Delay
The `delay` property of the `Transition` element is used to specify that the element should be delayed when in transition. When one or more elements are delayed, their transition will start sequentially to give the impression that the different elements appear at a different time. The delay property is a true/false property.
