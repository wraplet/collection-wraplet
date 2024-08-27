/**
 * @jest-environment jsdom
 */
import "./setup";

import {
  Collection,
  CollectionItemProvider,
  collectionSelector,
  itemProviderSelector,
  mainAddAttribute,
  itemAttribute,
} from "../src";
import { mainAttribute } from "../src";

export function addItemToCollectionByAddProvider(
  collection: Collection,
): Element {
  const providers = CollectionItemProvider.create(document);
  const provider = providers[0];
  collection.registerCollectionItemProvider(provider);

  const collectionElement = document.querySelector(collectionSelector);
  if (!collectionElement) {
    throw new Error("Collection not found.");
  }
  expect(collectionElement.children).toHaveLength(0);

  const addElement = document.querySelector<HTMLElement>(itemProviderSelector);

  if (!addElement) {
    throw new Error("Add element not found.");
  }
  addElement.click();

  return collectionElement;
}

test("Test adding item to the collection", () => {
  document.body.innerHTML = `
<div ${mainAddAttribute} data-prototype="<div ${itemAttribute} data-position-selector='[data-position]'><input type='number' data-position/></div>"></div>
<div ${mainAttribute}></div>
`;

  const collections = Collection.create(document);
  const collection = collections[0];

  const collectionElement = addItemToCollectionByAddProvider(collection);
  expect(collectionElement.children).toHaveLength(1);
});
