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
