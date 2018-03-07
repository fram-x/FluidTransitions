import { Animated, Easing } from 'react-native';

import TransitionItem from './TransitionItem';

const DelayTransitionTime = 90;
const FadeTransitionTime = 40;

const configureTransitionAnimations =
  (transitionElements: Array<TransitionItem>, config: Object ) => {

  const transitionConfig = { ...config };
  const { timing } = transitionConfig;
  delete transitionConfig.timing;

  let index = 0;

  return transitionElements.map(item => {
    item.progress = new Animated.Value(0);    
    const delay = (item.delay ? index++ * DelayTransitionTime : 0);
    const animation = timing(item.progress, {
      ...transitionConfig,
      toValue: 1.0,
      delay
    });

    return createAnimationDescriptor(
      animation, item.name, item.route, delay, item.progress);
  });
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
