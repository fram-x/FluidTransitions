import { Metrics } from './Metrics';

export type InterpolatorSpecification = {
  from: {
    metrics: Metrics,
    style: any,
  },
  to: {
    metrics: Metrics,
    style: any,
  },
  scaleX: number,
  scaleY: number,
  dimensions: any,
  getInterpolation: (useNativeDriver: Boolean) => any,
}
