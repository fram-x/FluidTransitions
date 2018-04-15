
import { Metrics } from './../Types/Metrics';

import math, { BigNumber } from 'mathjs';

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

  let theta = math.multiply(-1, params.theta);
  const bx = math.bignumber(x);
  const by = math.bignumber(y);
  const bwidth = math.bignumber(width);
  const bheight = math.bignumber(height);

  let cos = math.bignumber(math.cos(theta));
  let sin = math.bignumber(math.sin(theta));

  const isEqual = math.equal(math.abs(cos), math.abs(sin));
  if (isEqual) {
    const small = degToRad(0.00000001);
    theta = math.add(small, theta);
    cos = math.bignumber(math.cos(theta));
    sin = math.bignumber(math.sin(theta));
  }

  // Get rotated height/width
  const quad = getQuadrant(theta.toNumber());
  const a = math.divide(1, math.subtract(math.pow(cos, 2), math.pow(sin, 2)));

  const aw = math.multiply(math.multiply(1, bwidth), cos);
  const bw = math.multiply(bheight, sin);

  let nw: BigNumber;
  if (quad === 0 || quad === 2) {
    nw = math.multiply(a, math.subtract(aw, bw));
  } else {
    nw = math.multiply(a, math.add(aw, bw));
  }

  const ah = math.multiply(math.multiply(-1, bwidth), sin);
  const bh = math.multiply(bheight, cos);

  let nh: BigNumber;
  if (quad === 0 || quad === 2) {
    nh = math.multiply(a, math.add(ah, bh));
  } else {
    nh = math.multiply(a, math.subtract(ah, bh));
  }

  console.log(`COS: ${cos.toNumber()}\n` +
              `SIN: ${sin.toNumber()}\n` +
              `A:   ${a.toNumber()}\n` +
              `w:   ${bwidth.toNumber()}\n` +
              `h:   ${bheight.toNumber()}\n` +
              `aw:  ${aw.toNumber()}\n` +
              `bw:  ${bw.toNumber()}\n` +
              `ah:  ${ah.toNumber()}\n` +
              `bh:  ${bh.toNumber()}\n` +
              `nw:  ${nw.toNumber()}\n` +
              `nh:  ${nh.toNumber()}\n` +
              `qad: ${quad}\n` +
              `is:  ${isEqual}`);

  const retVal = {
    x: math.round(math.add(bx, math.multiply(math.subtract(bwidth, math.abs(nw)), 0.5))),
    y: math.round(math.add(by, math.multiply(math.subtract(bheight, math.abs(nh)), 0.5))),
    width: math.abs(math.round(nw)),
    height: math.abs(math.round(nh)),
  };
  return getNumericRect(retVal);
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

  const cos = math.cos(math.bignumber(theta));
  const sin = math.sin(math.bignumber(theta));

  const nx = math.add(math.add(
    math.multiply(cos, math.subtract(math.bignumber(x), math.bignumber(cx))),
    math.multiply(sin, math.subtract(math.bignumber(y), math.bignumber(cy))),
  ), math.bignumber(cx));

  const ny = math.add(math.subtract(
    math.multiply(cos, math.subtract(math.bignumber(y), math.bignumber(cy))),
    math.multiply(sin, math.subtract(math.bignumber(x), math.bignumber(cx))),
  ), math.bignumber(cy));

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

  const minX = math.min(tl.x, bl.x, tr.x, br.x);
  const maxX = math.max(tl.x, bl.x, tr.x, br.x);
  const minY = math.min(tl.y, bl.y, tr.y, br.y);
  const maxY = math.max(tl.y, bl.y, tr.y, br.y);

  return {
    x: minX,
    y: minY,
    width: math.subtract(maxX, minX),
    height: math.subtract(maxY, minY),
  };
};

export const getQuadrant = (theta: number): number => {
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
};

export const degToRad = (deg: number): number => math.multiply(deg, math.divide(math.PI, 180));
export const radToDeg = (rad: number): number => math.multiply(rad, math.divide(180, math.PI));

export const getNumericRect = (rect): Metrics => ({
  x: rect.x.toNumber(),
  y: rect.y.toNumber(),
  width: rect.width.toNumber(),
  height: rect.height.toNumber(),
});

