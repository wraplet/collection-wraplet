import "./setup";

import {
  Collection,
  collectionSelector,
  itemAttribute,
  itemRemoveButtonSelector,
  itemProviderAttribute,
} from "../src";
import { mainAttribute } from "../src";
import { itemRemoveAttribute } from "../src/selectors";
import { addItemToCollectionByAddProvider } from "./add-item.test";

test("Test removing items from the collection", () => {
  document.body.innerHTML = `
<div ${mainAttribute}>
    <div ${itemAttribute} data-position-selector='[data-position]'>
        <input type='number' data-position/>
        <div ${itemRemoveAttribute}></div>
    </div>
</div>
`;

  Collection.create(document);

  const collectionElement = document.querySelector(collectionSelector);
  if (!collectionElement) {
    throw new Error("Collection not found.");
  }
  expect(collectionElement.children).toHaveLength(1);

  const removeElement = document.querySelector<HTMLElement>(
    itemRemoveButtonSelector,
  );
  if (!removeElement) {
    throw new Error("Remove element has not been found.");
  }
  removeElement.click();
  expect(collectionElement.children).toHaveLength(0);
});

test("Test adding item to the collection and removing it.", () => {
  document.body.innerHTML = `
<div ${itemProviderAttribute} data-prototype="<div ${itemAttribute} data-position-selector='[data-position]'><input type='number' data-position/><div ${itemRemoveAttribute}></div></div>"></div>
<div ${mainAttribute}></div>
`;

  const collections = Collection.create(document);
  const collection = collections[0];

  const collectionElement = addItemToCollectionByAddProvider(collection);
  expect(collectionElement.children).toHaveLength(1);

  const removeElement = document.querySelector<HTMLElement>(
    itemRemoveButtonSelector,
  );
  if (!removeElement) {
    throw new Error("Remove element has not been found.");
  }
  removeElement.click();
  expect(collectionElement.children).toHaveLength(0);
});
