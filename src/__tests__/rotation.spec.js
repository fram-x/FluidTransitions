import { getOriginalRect, rotatePoint, getBoundingBox, degToRad } from './../Utils/rotation';
import { Metrics } from './../Types/Metrics';

describe('getRotatedRect', () => {
  it('returns original rect when rotation is 0', () => {
    const boundingBox = { x: 100, y: 100, width: 100, height: 100 };
    const valueToTest = getOriginalRect({ boundingBox, theta: 0 });
    expect(valueToTest).toBe(boundingBox);
  });

  it('returns original rect when rotation is -20', () => {
    const boundingBox: Metrics = {
      x: 85.91436179442114,
      y: 149.91436179442115,
      width: 128.1712764111577,
      height: 128.1712764111577,
    };
    const valueToTest = getOriginalRect({ boundingBox, theta: degToRad(-20) });
    expect(valueToTest).toEqual({ x: 100, y: 164, width: 100, height: 100 });
  });

  it('returns original rect when rotation is -20 for other rect', () => {
    const theta = degToRad(-20);
    const rect = { x: 300, y: 64, width: 40, height: 50 };
    const boundingBox = getBoundingBox({ rect, theta });
    const valueToTest = getOriginalRect({ boundingBox, theta });
    expect(valueToTest).toEqual(rect);
  });

  it('returns original rect when rotation is 0', () => {
    const theta = degToRad(0);
    const rect = { x: 100, y: 164, width: 100, height: 100 };
    const boundingBox = getBoundingBox({ rect, theta });
    const valueToTest = getOriginalRect({ boundingBox, theta });
    expect(valueToTest).toEqual(rect);
  });

  it('returns original rect when rotation is 45', () => {
    const theta = degToRad(45);
    const rect = { x: 10, y: 10, width: 40, height: 40 };
    const boundingBox = getBoundingBox({ rect, theta });
    const valueToTest = getOriginalRect({ boundingBox, theta });
    expect(valueToTest).toEqual(rect);
  });

  it('returns original rect when rotation is 90', () => {
    const theta = degToRad(90);
    const rect = { x: 100, y: 164, width: 100, height: 100 };
    const boundingBox = getBoundingBox({ rect, theta });
    const valueToTest = getOriginalRect({ boundingBox, theta });
    expect(valueToTest).toEqual(rect);
  });

  it('returns original rect when rotation is 135', () => {
    const theta = degToRad(135);
    const rect = { x: 100, y: 164, width: 100, height: 100 };
    const boundingBox = getBoundingBox({ rect, theta });
    const valueToTest = getOriginalRect({ boundingBox, theta });
    expect(valueToTest).toEqual(rect);
  });

  it('returns original rect when rotation is 180', () => {
    const theta = degToRad(180);
    const rect = { x: 100, y: 164, width: 100, height: 100 };
    const boundingBox = getBoundingBox({ rect, theta });
    const valueToTest = getOriginalRect({ boundingBox, theta });
    expect(valueToTest).toEqual(rect);
  });

  it('returns original rect when rotation is 225', () => {
    const theta = degToRad(225);
    const rect = { x: 100, y: 164, width: 100, height: 100 };
    const boundingBox = getBoundingBox({ rect, theta });
    const valueToTest = getOriginalRect({ boundingBox, theta });
    expect(valueToTest).toEqual(rect);
  });

  it('returns original rect when rotation is 270', () => {
    const theta = degToRad(270);
    const rect = { x: 100, y: 164, width: 100, height: 100 };
    const boundingBox = getBoundingBox({ rect, theta });
    const valueToTest = getOriginalRect({ boundingBox, theta });
    expect(valueToTest).toEqual(rect);
  });
});

describe('rotatePoint', () => {
  it('returns rotated point for angle of 20 degrees', () => {
    const rect = { x: 100, y: 164, width: 100, height: 100 };
    const cx = rect.x + (rect.width / 2);
    const cy = rect.y + (rect.height / 2);
    const rotatedPoint = rotatePoint({ x: rect.x, y: rect.y, cx, cy, theta: degToRad(20) });
    expect(rotatedPoint.x).toEqual(85.91436179442114);
    expect(rotatedPoint.y).toEqual(184.116376126988);
  });
});

describe('getBoundingBox', () => {
  it('returns correct bounding box for rect and rotation -20', () => {
    const rect = { x: 100, y: 164, width: 100, height: 100 };
    const bb = getBoundingBox({ rect, theta: degToRad(-20) });
    expect(bb).toEqual({
      x: 85.91436179442114,
      y: 149.91436179442115,
      width: 128.1712764111577,
      height: 128.1712764111577,
    });
  });

  it('returns correct bounding box for rect and rotation 45', () => {
    const rect = { x: 100, y: 164, width: 100, height: 100 };
    const bb = getBoundingBox({ rect, theta: degToRad(45) });
    expect(bb).toEqual({
      x: 79.28932188134524,
      y: 143.28932188134524,
      width: 141.4213562373095,
      height: 141.4213562373095,
    });
  });
});
