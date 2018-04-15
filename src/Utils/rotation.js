
import { Metrics } from './../Types/Metrics';

const math = require('mathjs');

math.config({ number: 'BigNumber' });

export type GetOriginalRectParameters = {
  boundingBox: Metrics, // Bounding box
  theta: number, // Original rotation in radians
}
export const getOriginalRect = (params: GetOriginalRectParameters): Metrics => {
  if (params.theta === 0) {
    return params.boundingBox;
  }

  const { x, y, width, height } = params.boundingBox;

  const theta = (-1 * params.theta) % degToRad(360);
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);

  const cos2 = math.bignumber(math.cos(theta));
  const sin2 = math.bignumber(math.sin(theta));

  // Get rotated height/width - use mathjs to get precision
  const a = math.divide(1, math.subtract(
    math.pow(cos2, 2),
    math.pow(sin2, 2),
  )).toNumber();

  // Get rotated height/width
  const nw = a * (width * cos - height * sin);
  const nh = a * (-width * sin + height * cos);

  const retVal = {
    x: Math.round(x + (width - Math.abs(nw)) * 0.5),
    y: Math.round(y + (height - Math.abs(nh)) * 0.5),
    width: Math.abs(Math.round(nw)),
    height: Math.abs(Math.round(nh)),
  };

  return retVal;
};

export type RotatePointParameters = {
  x: number,
  y: number,
  cx: number,
  cy: number,
  theta: number,
}
export const rotatePoint = (params: RotatePointParameters) => {
  const { x, y, cx, cy, theta } = params;

  const cos = Math.cos(theta);
  const sin = Math.sin(theta);

  const nx = (cos * (x - cx)) + (sin * (y - cy)) + cx;
  const ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;

  return { x: nx, y: ny };
};

export type GetBoundingBoxParameters = {
  rect: Metrics,
  theta: number,
};
export const getBoundingBox = (params: GetBoundingBoxParameters) => {
  const { x, y, width, height } = params.rect;
  const { theta } = params;

  const cx = x + (width / 2);
  const cy = y + (height / 2);

  const tl = rotatePoint({ x, y, cx, cy, theta });
  const bl = rotatePoint({ x, y: y + height, cx, cy, theta });
  const tr = rotatePoint({ x: x + width, y, cx, cy, theta });
  const br = rotatePoint({ x: x + width, y: y + height, cx, cy, theta });

  const minX = Math.min(tl.x, bl.x, tr.x, br.x);
  const maxX = Math.max(tl.x, bl.x, tr.x, br.x);
  const minY = Math.min(tl.y, bl.y, tr.y, br.y);
  const maxY = Math.max(tl.y, bl.y, tr.y, br.y);

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

export const degToRad = (deg: number): number => deg * Math.PI / 180;
export const radToDeg = (rad: number): number => rad * 180 / Math.PI;
