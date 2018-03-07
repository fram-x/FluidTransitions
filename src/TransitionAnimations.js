import { Animated, Easing } from 'react-native';

import TransitionItem from './TransitionItem';

const DelayTransitionTime = 90;
const FadeTransitionTime = 15;

const configureTransitionAnimations =
  (transitionElements: Array<TransitionItem>, direction: number, config: Object ) => {

  const transitionConfig = { ...config };
  const { timing } = transitionConfig;
  delete transitionConfig.timing;

  let index = 0;
  const animations = [];
  let elements = [].concat(transitionElements);
  if(direction === -1) 
    elements = elements.reverse();

  for(let i=0; i<elements.length; i++){
    const item = elements[i];
    item.progress = new Animated.Value(0);
    const delay = (item.delay ? index++ * DelayTransitionTime : 0);
    animations.push(createAnimationDescriptor(timing(item.progress, {
      ...transitionConfig,
      toValue: 1.0,
      delay
    }), item.name, item.route, delay, item.progress));
  }

  return animations;
}

const configureSharedElementAnimation =
  (sharedElements: Array<any>, progress: Animated.Value, config: any) => {

  const transitionConfig = { ...config };
  const { timing } = transitionConfig;
  delete transitionConfig.timing;

  const configureAnimation = (item: TransitionItem) => item.progress = progress;

  sharedElements.forEach(pair => {
    // Share progress between to/from item
    configureAnimation(pair.fromItem);
    configureAnimation(pair.toItem);
  });

  const animation = timing(progress, {
    ...transitionConfig,
    toValue: 1.0,
  });

  return createAnimationDescriptor(animation, 'shared elements', '', 0, progress);
}

const createVisibilityAnimations = (toValue: number, sharedElements: Array<any>,
  transitionElements: Array<TransitionItem>) => {
  const elements = [];
  if(sharedElements){
    sharedElements.forEach(pair => {
      elements.push(pair.fromItem);
      elements.push(pair.toItem);
    });
  }

  if(transitionElements){
    transitionElements.forEach(item => elements.push(item));
  }

  if(elements.length === 0)
    return [];

  // Hide/show by changing the progress value
  return elements.map(item => {
      return Animated.timing(item.visibility, {
        toValue,
        duration: FadeTransitionTime,
        easing: Easing.linear,
        useNativeDriver: true,
      });
    });
}

const createOverlayVisibilityAnimation = (toValue: number, progress: Animated.value) => {
  return Animated.timing(progress, {
    toValue,
    duration: FadeTransitionTime,
    easing: Easing.linear,
    useNativeDriver: true,
  })
}

const createAnimationDescriptor =
  (animation: any, name: string, route: string, delay: number, progress: Animated.Value) => {
  return { animation, name, route, delay, progress }
}

export  {
  configureTransitionAnimations,
  configureSharedElementAnimation,
  createVisibilityAnimations,
  createOverlayVisibilityAnimation
};
