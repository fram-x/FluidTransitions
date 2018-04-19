## Custom Transitions

It is possible to customize transitions for individual elements by providing custom transition functions instead of transition names:

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

### Return Value
A transition function should return a valid style element.

### Parameters
The `transitionInfo` parameter is an object with the following members:

| Name        | Description | 
| ----------  | ------------- | 
| progress: Animated.Value 	| An animated value that interpolates between 0 and 1 that will drive the animation. | 
| metrics: Metrics 	| The transition element's position and size (`x`, `y`, `width`, `height`). | 
| boundingbox: Metrics 	| The transition element's bounding box position and size including rotation (`x`, `y`, `width`, `height`). | 
| name: string 	| The name of the element as declared in the transition component (if any) | 
| route: string 	| The name of the route where the element is located | 
| start: number 	| A value indicating where between 0..1 your animation should start (see notes below) | 
| end: number 	| A value indicating where between 0..1 your animation should end (see notes below) | 
| dimensions: ScaledSize 	| The dimensions of the current screen | 

#### Notes on start/end: 
When animating a transition each element will get a slot of time where it should appear. This is done so that 
the screen transitioning out animates its transitions before the transitions in the screen animating in will be played. 
These parameters can be used to build the inputRange for interpolations:

```javascript
inputRange: [0, start, end, 1],
```

It is also possible to interpolate between 0 and 1, but this will change the appearance of the navigation transition.

#### Notes on progress
The progress value will animated from 0..1 or 1..0 depending on wether the animation is playing a navigation action going forward or backwards.
