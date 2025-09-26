import "./setup";
import { Collection, CollectionItem, mainAttribute } from "../src";

it("Test Collection item added listeners", () => {
  const fn = jest.fn();
  const collectionElement = document.createElement("div");
  const itemElement = document.createElement("div");

  collectionElement.appendChild(itemElement);

  const collection = Collection.create(collectionElement);

  collection.addItemAddedListener((item) => {
    expect(item).toBeInstanceOf(CollectionItem);
    fn();
  });

  const item = CollectionItem.create(itemElement);

  collection.addItem(item);

  expect(fn).toHaveBeenCalledTimes(1);
});

it("Test Collection options validation", () => {
  const invalidOptions = [
    '{"positionsCalculatedListeners": true}',
    '{"calculateInitialPositionOnInit": 1}',
    '{"sortable": 1}',
  ];

  const collectionElement = document.createElement("div");

  const createCollection = () => {
    Collection.create(collectionElement);
  };

  for (const invalidOption of invalidOptions) {
    collectionElement.setAttribute(mainAttribute, invalidOption);
    expect(createCollection).toThrow("Invalid storage value");
  }

  const validOptions = [
    '{"positionsCalculatedListeners": []}',
    '{"calculateInitialPositionOnInit": true}',
    '{"sortable": true}',
  ];

  for (const validOption of validOptions) {
    collectionElement.setAttribute(mainAttribute, validOption);
    expect(createCollection).not.toThrow();
  }
});

it("Test Collection positions calculated listeners", () => {
  const collectionElement = document.createElement("div");

  const itemElement = document.createElement("div");
  const positionElement = document.createElement("input");
  positionElement.setAttribute("data-position", "");
  positionElement.setAttribute("value", "0");
  itemElement.appendChild(positionElement);

  collectionElement.appendChild(itemElement);

  const collection = Collection.create(collectionElement);
  const item = CollectionItem.create(itemElement);

  const fn = jest.fn();

  collection.addPositionsCalculatedListener((item, index) => {
    expect(item).toBeInstanceOf(CollectionItem);
    expect(index).toBe(0);
    fn();
  });

  collection.addItem(item);

  expect(fn).toHaveBeenCalledTimes(1);
});
