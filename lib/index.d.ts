import * as React from 'react';
import { NavigationRouteConfigMap, StackNavigatorConfig } from 'react-navigation';

export { RouteDirection, Metrics, TransitionSpecification } from './Types';

export function createFluidNavigator(
	routeConfigMap: NavigationRouteConfigMap,
	stackConfig: StackNavigatorConfig = {}
): any;

export { createFluidNavigator as FluidNavigator };

export type TransitionType = 'scale' | 'top' | 'bottom' | 'left' | 'right' | 'horizontal' | 'vertical' | 'flip';

export interface TransitionProps {
	appear?: TransitionType;
	disappear?: TransitionType;
	inline?: boolean;
	delay?: boolean;
	anchor?: string;
	animated?: string;
}

export class Transition extends React.Component<TransitionProps> {}
