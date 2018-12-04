
import TransitionItem from './TransitionItem';

export default class TransitionItems {
  constructor() {
    this._items = [];
  }

  _items: Array<TransitionItem>

  count(): number {
    return this._items.length;
  }

  add(item: TransitionItem): boolean {
    if (this._items.findIndex(e => e.name === item.name && e.route === item.route) >= 0) {
      return false;
    }
    this._items = [...this._items, item];
    return true;
  }

  remove(name: string, route: string): boolean {
    const index = this._items.findIndex(e => e.name === name && e.route === route);
    if (index >= 0) {
      this._items = [...this._items.slice(0, index), ...this._items.slice(index + 1)];
      return true;
    }
    return false;
  }

  getItems() {
    return this._items;
  }

  getRoutes() {
    const routes = [];
    for (let i = 0; i < this._items.length; i++) {
      if (!routes.includes(this._items[i].route)) {
        routes.push(this._items[i].route);
      }
    }
    if (routes.length !== 2) {
      throw new Error(`Number of routes should be 2, was ${routes.length}`);
    }

    return { fromRoute: routes[0], toRoute: routes[1] };
  }

  getItemByNameAndRoute(name: string, route: string): TransitionItem {
    return this._items.find(e => e.name === name && e.route === route);
  }

  getSharedElements(fromRoute: string, toRoute: string): Array<TransitionItem> {
    return this._getItemPairs(fromRoute, toRoute)
      .filter(pair => pair.toItem !== undefined && pair.fromItem !== undefined);
  }

  getTransitionElements(fromRoute: string, toRoute: string): Array<TransitionItem> {
    const itemPairs = this._getItemPairs(fromRoute, toRoute)
      .filter(pair => pair.toItem !== undefined && pair.fromItem !== undefined);

    let items = this._items.filter(e => e.getIsMounted() && (e.appear !== undefined
      || e.disappear !== undefined) && (e.route === fromRoute || e.route === toRoute));


    items = items.filter(e => itemPairs.findIndex(p => (e.name === p.fromItem.name
      && e.route === p.fromItem.route)
      || (e.name === p.toItem.name && e.route === p.toItem.route)) === -1);

    return items;
  }

  _getNamePairMap(fromRoute: string, toRoute: string): Map<TransitionItem, TransitionItem> {
    const nameMap = this._items.filter(p => p.getIsMounted()).reduce((map, item) => {
      let pairByName = map.get(item.name);
      if (!pairByName) {
        pairByName = {};
        map.set(item.name, pairByName);
      }
      if (item.route === fromRoute) pairByName.fromItem = item;
      if (item.route === toRoute) pairByName.toItem = item;
      // delete empty pairs
      if (!pairByName.fromItem && !pairByName.toItem) { map.delete(item.name); }

      return map;
    }, new Map());

    return nameMap;
  }

  _getItemPairs(fromRoute: string, toRoute: string): Array<TransitionItem> {
    const nameMap = this._getNamePairMap(fromRoute, toRoute);
    const pairs = Array.from(nameMap.values());
    const anchorItems = this._items
      .filter(e => (e.route === fromRoute || e.route === toRoute) && e.anchor);

    return pairs.map(p => {
      const { fromItem, toItem } = p;
      if (fromItem) {
        fromItem.anchors = anchorItems.filter(e => e.route === p.fromItem.route
        && e.anchor === p.fromItem.name);
      }
      if (toItem) {
        toItem.anchors = anchorItems.filter(e => e.route === p.toItem.route
        && e.anchor === p.toItem.name);
      }
      return { fromItem, toItem };
    });
  }
}
