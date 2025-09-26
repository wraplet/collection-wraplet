import "./setup";
import { mainAttribute, Collection, itemAttribute } from "../src";
import { itemHandleAttribute } from "../src/selectors";

test("Test sortable can be enabled with html options", () => {
  document.body.innerHTML = `
<div ${mainAttribute}='{"sortable":true}'>
    <div ${itemAttribute}>
        <div ${itemHandleAttribute}></div>
    </div>
    <div ${itemAttribute}>
        <div ${itemHandleAttribute}></div>
    </div>
</div>
`;
  const collection = Collection.createMultiple(document)[0];

  expect(collection.isSortable()).toBe(true);
});
