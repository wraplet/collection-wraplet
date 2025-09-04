import "./setup";

import {
  Collection,
  CollectionItem,
  CollectionItemProvider,
  itemAttribute,
} from "../src";
import { mainAttribute, itemProviderAttribute } from "../src";

test("Test collection initialization", () => {
  document.body.innerHTML = `<div ${mainAttribute}></div>`;

  const collections = Collection.create(document);
  expect(collections).toHaveLength(1);
});

test("Test collection item provider initialization", () => {
  document.body.innerHTML = `<div ${itemProviderAttribute}></div>`;

  const providers = CollectionItemProvider.create(document);
  expect(providers).toHaveLength(1);
});

test("Test initial default position calculation", () => {
  document.body.innerHTML = `
<div ${mainAttribute}>
    <div ${itemAttribute}><input type='number' data-position/></div>
    <div ${itemAttribute}><input type='number' data-position/></div>
</div>
`;

  const collections = Collection.create(document, {
    calculateInitialPositionOnInit: true,
  });
  const collection = collections[0];

  const items = collection.getItems();
  const itemsPositions: number[] = [];
  for (const item of items) {
    itemsPositions.push(item.getPosition());
  }

  expect(itemsPositions).toEqual([0, 1]);
});

test("Test initial position calculation altered", () => {
  document.body.innerHTML = `
<div ${mainAttribute}>
    <div ${itemAttribute}><input type='number' data-position/></div>
    <div ${itemAttribute}><input type='number' data-position/></div>
</div>
`;

  const collections = Collection.create(document, {
    calculateInitialPositionOnInit: true,
    positionsCalculatedListeners: [
      (item: CollectionItem, index: number): void => {
        item.setPosition(index + 1);
      },
    ],
  });
  const collection = collections[0];

  const items = collection.getItems();
  const itemsPositions: number[] = [];
  for (const item of items) {
    itemsPositions.push(item.getPosition());
  }

  expect(itemsPositions).toEqual([1, 2]);
});

test("Test collection options html override", () => {
  document.body.innerHTML = `
<div ${mainAttribute}='{"sortable": false}'></div>
`;

  const collections = Collection.create(document, {
    sortable: true,
  });

  if (!collections[0]) {
    throw new Error("Collections not found.");
  }
  const collection = collections[0];

  expect(collection.isSortable()).toBe(false);
});
