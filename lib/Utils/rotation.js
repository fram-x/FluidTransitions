
import { Metrics } from '../Types/Metrics';

export type GetOriginalRectParameters = {
  boundingBox: Metrics, // Bounding box
  theta: number, // Original rotation in radians
  skipWidth: ?Boolean // Should we perform the Android version of the rotation where
                      // Width/Height is same (no bounding box, just x/y is set?)
}
export const getOriginalRect = (params: GetOriginalRectParameters): Metrics => {
  if (params.theta === 0) {
    return params.boundingBox;
  }

  const { x, y, width, height } = params.boundingBox;

  if (params.skipWidth) {
    const cx = x + ((Math.cos(params.theta) * width - Math.sin(params.theta) * height) / 2);
    const cy = y + ((Math.sin(params.theta) * width + Math.cos(params.theta) * height) / 2);
    const p0 = rotatePoint({ x, y, cx, cy, theta: params.theta });
    return { x: Math.round(p0.x), y: Math.round(p0.y), width, height };
  }

  let theta = -1 * params.theta;
  let cos = Math.cos(theta);
  let sin = Math.sin(theta);

  if (Math.abs(Math.abs(sin) - Math.abs(cos)) <= Number.EPSILON) {
    theta = small + theta;
    cos = Math.cos(theta);
    sin = Math.sin(theta);
  }

  // Get rotated height/width
  const quad = getQuadrant(theta);
  const a = 1 / (Math.pow(cos, 2) - (Math.pow(sin, 2)));

  const aw = (1 * width) * cos;
  const bw = (height * sin);
  const nw = (quad === 0 || quad === 2) ? a * (aw - bw) : a * (aw + bw);

  const ah = (-1 * width) * sin;
  const bh = (height * cos);
  const nh = (quad === 0 || quad === 2) ? a * (ah + bh) : a * (ah - bh);

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

export const getQuadrant = (theta: number) => {
  const angle = theta * 180 / Math.PI;
  let normangle = angle % 360;
  if (normangle < 0) {
    normangle += 360;
  }
  const p = normangle / 360;
  if (p >= 0 && p <= 0.25) return 0;
  if (p > 0.25 && p <= 0.5) return 1;
  if (p > 0.5 && p <= 0.75) return 2;
  if (p > 0.75 && p <= 1) return 3;
  return -1;
};

export const degToRad = (deg: number): number => deg * Math.PI / 180;
export const radToDeg = (rad: number): number => rad * 180 / Math.PI;

const small = degToRad(0.00000001);
