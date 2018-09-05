export const compareTransitionElements = (e1:Array<any>, e2:Array<any>): boolean => {
  if (!e1 && !e2) return true;
  if ((!e1 && e2) || (e1 && !e2)) return false;
  if (e1.length !== e2.length) return false;
  for (let i = 0; i < e1.length; i++) {
    const i1 = e1[i];
    const i2 = e2[i];
    if (i1.name !== i2.name || i1.route !== i2.route) {
      return false;
    }
  }
  return true;
};

export const compareSharedElements = (e1: Array<any>, e2: Array<any>): boolean => {
  if (!e1 && !e2) return true;
  if ((!e1 && e2) || (e1 && !e2)) return false;
  if (e1.length !== e2.length) return false;
  for (let i = 0; i < e1.length; i++) {
    const p1 = e1[i];
    const p2 = e2[i];
    if (p1.fromItem.name !== p2.fromItem.name || p1.fromItem.route !== p2.fromItem.route
      || p1.toItem.name !== p2.toItem.name || p1.toItem.route !== p2.toItem.route) {
      return false;
    }
  }
  return true;
};
