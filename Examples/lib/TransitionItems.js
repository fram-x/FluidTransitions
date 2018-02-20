
import { UIManager } from 'react-native';

export default class TransitionItems {
	constructor(updateStateCallback, getStateCallback) {
		this._items = [];
		this._itemsToMeasure = [];
		this._updateStateCallback = updateStateCallback;
		this._getStateCallback = getStateCallback;
	}
	_items
	_itemsToMeasure
	_updateStateCallback
	_getStateCallback
	updateState() {
		const c = this.getState() ? (this.getState().c ? this.getState().c : 0) : 0;
		const newState = {...this.getState(), c: c + 1 };
		this._updateStateCallback(newState);
	}
	getState() {
		return this._getStateCallback();
	}
	count() {
		return this.getItems().length;
	}
	add(item) {
		if(this.getItems().findIndex(e => e.name === item.name && e.route === item.route) >= 0)
			return false;

		const newItems = [...this.getItems(), item];
		this.setItems(newItems);

		if(item.isShared){
			const matchingItem = this._findMatchByName(item.name, item.route);

			// schedule to measure (on layout) if another view with the same name is mounted
			if (matchingItem) {
				this.setItemsToMeasure([...this.getItemsToMeasure(), item, matchingItem]);
			}		
		}
		else {
			this.setItemsToMeasure([...this.getItemsToMeasure(), item]);
		}

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
		this.updateState();
	}
	getItems() {
		return this._items;
	}
	setItemsToMeasure(newItems) {
		this._itemsToMeasure = newItems;
	}
	getItemsToMeasure() {
		return this._itemsToMeasure;
	}
	getMeasuredItemPairs(fromRoute, toRoute) {
		const itemPairs = this._getItemPairs(fromRoute, toRoute);
		return itemPairs.filter(this._isMeasured);
	}
	updateMetrics(requests) {
		const indexedRequests = requests.map(r => ({
			...r,
			index: this._findIndex(r.name, r.route),
		}));

		if (indexedRequests.every(r => r.index < 0)) {
			return;
		}
		else {
			let newItems = Array.from(this.getItems());
			indexedRequests.forEach(r => {
				if (r.index >= 0) {
					const newItem = newItems[r.index].clone();
					newItem.metrics = r.metrics;
					newItems[r.index] = newItem;
				}
			});
			this.setItemsToMeasure([]);
			this.setItems(newItems);
		}
	}
	_removeAllMetrics() {
		if (this.getItems().some(i => !!i.metrics)) {
			const newItems = this._items.map(item => {
				const newItem = item.clone();
				newItem.metrics = null;
				return newItem;
			});
			this.setItems(newItems);
		}
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