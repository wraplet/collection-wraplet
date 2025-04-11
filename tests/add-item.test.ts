/**
 * @jest-environment jsdom
 */
import "./setup";

import {
  Collection,
  CollectionItemProvider,
  collectionSelector,
  itemProviderSelector,
  itemProviderAttribute,
  itemAttribute,
  CollectionItem,
} from "../src";
import { mainAttribute } from "../src";

export function addItemToCollectionByAddProvider(
  collection: Collection,
  addProvider: boolean = true,
): Element {
  const providers = CollectionItemProvider.create(document);
  const provider = providers[0];

  if (addProvider) {
    collection.registerCollectionItemProvider(provider);
  }

  const collectionElement = document.querySelector(collectionSelector);
  if (!collectionElement) {
    throw new Error("Collection not found.");
  }

  const addElement = document.querySelector<HTMLElement>(itemProviderSelector);

  if (!addElement) {
    throw new Error("Add element not found.");
  }
  addElement.click();

  return collectionElement;
}

test("Test adding item to the collection", () => {
  document.body.innerHTML = `
<div ${itemProviderAttribute} data-prototype="<div ${itemAttribute} data-position-selector='[data-position]'><input type='number' data-position/></div>"></div>
<div ${mainAttribute}></div>
`;

  const collections = Collection.create(document);
  const collection = collections[0];

  const collectionElement = addItemToCollectionByAddProvider(collection);
  expect(collectionElement.children).toHaveLength(1);
});

test("Test position calculation on item add", () => {
  document.body.innerHTML = `
<div ${itemProviderAttribute} data-prototype="<div ${itemAttribute} data-position-selector='[data-position]'><input type='number' data-position/></div>"></div>
<div ${mainAttribute}></div>
`;

  const collections = Collection.create(document, {
    positionsCalculationListeners: [
      (item: CollectionItem, index: number): void => {
        item.setPosition(index + 1);
      },
    ],
  });
  const collection = collections[0];

  addItemToCollectionByAddProvider(collection);
  addItemToCollectionByAddProvider(collection, false);
  const items = collection.getItems();
  const itemsPositions: number[] = [];
  for (const item of items) {
    itemsPositions.push(item.getPosition());
  }

  expect(itemsPositions).toEqual([1, 2]);
});
