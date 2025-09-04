import "./setup";
import {
  Collection,
  CollectionItem,
  itemAttribute,
  mainAttribute,
} from "../src";

it("Test delete listeners", () => {
  document.body.innerHTML = `
<div ${mainAttribute}>
    <div ${itemAttribute} data-position-selector="[data-position]"><input data-position/></div>
</div>
`;

  const func = jest.fn();

  const collections = Collection.create(document);
  if (!collections[0]) {
    throw new Error("Collections not found.");
  }
  const collection = collections[0];

  collection.getItems()[0].addDeleteListener(func);
  collection.getItems()[0].delete();
  expect(func).toHaveBeenCalledTimes(1);
});

test("Test collection item options html override", () => {
  document.body.innerHTML = `
<div ${mainAttribute}>
    <div ${itemAttribute}='{"positionSelector": "[data-position-test]"}'>
        <input data-position-test value="1"/>
    </div>
</div>
`;

  const collections = Collection.create(document, {
    sortable: true,
  });

  if (!collections[0]) {
    throw new Error("Collections not found.");
  }
  const collection = collections[0];
  const items = collection.getItems();
  if (!items[0]) {
    throw new Error("Item not found.");
  }

  const item = items[0];
  expect(item.getPosition()).toEqual(1);
});

it("Test CollectionItem no position element", () => {
  const element = document.createElement("div");
  const item = new CollectionItem(element);

  const fnGet = () => {
    item.getPosition();
  };

  expect(fnGet).toThrow("Position element not found.");

  const fnSet = () => {
    item.setPosition(0);
  };
  expect(fnSet).toThrow("Position element not found.");
});

it("Test CollectionItem no position value", () => {
  const element = document.createElement("div");
  const positionElement = document.createElement("input");
  positionElement.setAttribute("data-position", "");
  element.appendChild(positionElement);

  const item = new CollectionItem(element);

  const fnGet = () => {
    item.getPosition();
  };

  expect(fnGet).toThrow("No position value.");
});

it("Test CollectionItem no parent node", () => {
  const element = document.createElement("div");
  const positionElement = document.createElement("input");
  positionElement.setAttribute("data-position", "");
  element.appendChild(positionElement);

  const item = new CollectionItem(element);

  const fnGet = () => {
    item.getDOMPosition();
  };

  expect(fnGet).toThrow("ParentNode has not been found.");
});

it("Test CollectionItem options validators", () => {
  const invalidOptions = ['{"positionSelector": true}'];

  const itemElement = document.createElement("div");

  const createItem = () => {
    new CollectionItem(itemElement);
  };

  for (const invalidOption of invalidOptions) {
    itemElement.setAttribute(itemAttribute, invalidOption);
    expect(createItem).toThrow("Invalid storage value");
  }

  const validOptions = ['{"positionSelector": "data-position-test"}'];

  for (const validOption of validOptions) {
    itemElement.setAttribute(itemAttribute, validOption);
    expect(createItem).not.toThrow();
  }
});
