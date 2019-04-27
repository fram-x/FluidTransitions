import * as React from 'react';
import { NavigationRouteConfigMap, StackNavigatorConfig, NavigationContainer  } from 'react-navigation';

export { RouteDirection, Metrics, TransitionSpecification } from './Types';

export function createFluidNavigator(
  routeConfigMap: NavigationRouteConfigMap,
  stackConfig: StackNavigatorConfig = {}
): NavigationContainer;

export { createFluidNavigator as FluidNavigator };

export type TransitionType = 'scale' | 'top' | 'bottom' | 'left' | 'right' | 'horizontal' | 'vertical' | 'flip';

export interface TransitionProps {
  name?: string;
  shared?: string;
  appear?: TransitionType;
  disappear?: TransitionType;
  inline?: boolean;
  delay?: boolean;
  anchor?: string;
  animated?: string;
  zIndex?: number;
  innerRef?: React.Ref<any>;
}

export class Transition extends React.Component<TransitionProps> {}
