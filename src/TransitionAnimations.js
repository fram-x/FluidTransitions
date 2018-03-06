import { Animated } from 'react-native';

import TransitionItem from './TransitionItem';

const DelayTransitionTime = 90;

const configureTransitionAnimations = 
  (transitionElements: Array<TransitionItem>, config: Object ) => {

  const transitionConfig = { ...config };
  const { timing } = transitionConfig;
  delete transitionConfig.timing;
  let index = 0;
  const animations = [];

  transitionElements.forEach(item => {
    item.progress = new Animated.Value(0);
    const delay = (item.delay ? index++ * DelayTransitionTime : 0);
    const animation = timing(item.progress, {
      ...transitionConfig,
      toValue: 1.0,
      delay
    });

    animations.push(createAnimationDescriptor(
      animation, item.name, item.route, delay, item.progress));
  });

  return animations;
}

const configureSharedElementAnimations = 
  (sharedElements: Array<any>, progress: Animated.Value, config: any) => {
  
  const transitionConfig = { ...config };
  const { timing } = transitionConfig;
  delete transitionConfig.timing;
  const animations = [];

  const configureAnimation = (item: TransitionItem) => {
    item.progress = progress;
    const animation = timing(item.progress, {
      ...transitionConfig,
      toValue: 1.0,
    });

    return createAnimationDescriptor(
      animation, item.name, item.route, 0, item.progress);
  }

  sharedElements.forEach(pair => {
    // Share progress between to/from item
    animations.push(configureAnimation(pair.fromItem));
    animations.push(configureAnimation(pair.toItem));
  });

  return animations;
}

const createAnimationDescriptor = 
  (animation: any, name: string, route: string, delay: number, progress: Animated.Value) => {
  return { animation, name, route, delay, progress }
}

export  { configureTransitionAnimations, configureSharedElementAnimations };
