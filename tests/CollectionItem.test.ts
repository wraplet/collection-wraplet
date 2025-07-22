import "./setup";
import { Collection, itemAttribute, mainAttribute } from "../src";

test("Test delete listeners", () => {
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
