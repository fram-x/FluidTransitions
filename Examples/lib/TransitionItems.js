
import { UIManager } from 'react-native';

export default class TransitionItems {
	constructor() {
		this._items = [];		
	}

	_items	
	
	getState() {
		return this._getStateCallback();
	}

	count() {
		return this.getItems().length;
	}

	add(item) {
		if(this.getItems().findIndex(e => e.name === item.name && e.route === item.route) >= 0)
			return false;

		console.log("TransitionItems add " + item.name + ", " + item.route);

		const newItems = [...this.getItems(), item];
		this.setItems(newItems);
		return true;
	}

	remove(name, route) {
		const index = this.getItems().findIndex(e => e.name === name && e.route === route)
		if (index >= 0) {
			const newItems = [...this.getItems().slice(0, index), ...this.getItems().slice(index + 1)];
			this.setItems(newItems);
			return true;
		}
		return false;
	}

	setItems(newItems) {
		this._items = newItems;		
	}

	getItems() {
		return this._items;
	}

	getItemByNameAndRoute(name, route) {
		return this.getItems().find(e => e.name === name && e.route === route);
	}

	getSharedElements(fromRoute, toRoute) {
		return this._getItemPairs(fromRoute, toRoute)
			.filter(pair => pair.toItem !== undefined && pair.fromItem !== undefined);
	}

	getTransitionElements(fromRoute, toRoute) {
		const itemPairs = this._getItemPairs(fromRoute, toRoute)
			.filter(pair => pair.toItem !== undefined && pair.fromItem !== undefined);

		let items = this._items.filter(e => e.appear === true && (e.route === fromRoute || e.route === toRoute));
		items = items.filter(e => itemPairs.findIndex(p =>
			(e.name === p.fromItem.name && e.route === p.fromItem.route) ||
			(e.name === p.toItem.name && e.route === p.toItem.route)) === -1);

		return items;
	}

	getMeasuredItemPairs(fromRoute, toRoute) {
		const itemPairs = this._getItemPairs(fromRoute, toRoute);
		return itemPairs.filter(this._isMeasured);
	}
	resetSharedTransitions(fromRoute, toRoute){
		const itemsInNextTransition = this.getMeasuredItemPairs(fromRoute, toRoute);
		let itemsToReset = this._items.filter(item => (item.route === fromRoute || item.route === toRoute))
			.filter(item => item.shared)
			.filter(item =>
				itemsInNextTransition.findIndex((el) => item.name === el.fromItem.name &&
					item.route === el.fromItem.route) === -1)
			.filter(item =>
				itemsInNextTransition.findIndex((el) => item.name === el.toItem.name &&
					item.route === el.toItem.route) === -1);

		itemsToReset.forEach(item => item.reactElement.setTransitionSpec(null));
	}
	_findIndex(name, route){
		return this.getItems().findIndex(i => {
			return i.name === name && i.route === route;
		});
	}
	_getNamePairMap(fromRoute, toRoute) {
		const items = this.getItems();
		const nameMap = items.reduce((map, item) => {
			let pairByName = map.get(item.name);
			if (!pairByName) {
				pairByName = {};
				map.set(item.name, pairByName);
			}
			if (item.route === fromRoute) pairByName.fromItem = item;
			if (item.route === toRoute) pairByName.toItem = item;

			// delete empty pairs
			if (!pairByName.fromItem && !pairByName.toItem)
				map.delete(item.name);

			return map;
		}, new Map());
		return nameMap;
	}
	_isMeasured(p) {
		const isNumber = n => typeof n === 'number';
		const metricsValid = (m) => m && [m.x, m.y, m.width, m.height].every(isNumber);
		const { fromItem, toItem } = p;
		return fromItem && toItem
			&& metricsValid(fromItem.metrics) && metricsValid(toItem.metrics);
	}
	_getItemPairs(fromRoute, toRoute){
		const nameMap = this._getNamePairMap(fromRoute, toRoute);
		return Array.from(nameMap.values());
	}
	_findMatchByName(name, routeToExclude) {
		return this.getItems().find(i => i.name === name && i.route !== routeToExclude);
	}
}