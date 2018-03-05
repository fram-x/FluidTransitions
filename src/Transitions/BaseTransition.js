import { TransitionSpecification } from './../Types';

class BaseTransition {
  getTransitionStyle(transitionSpecification: TransitionSpecification) {
    return { };
  }
  getTransitionConfig(config): any {
    return config;
  }
}

export default BaseTransition;
