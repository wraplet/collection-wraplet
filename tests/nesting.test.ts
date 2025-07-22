import "./setup";
import {
  mainAttribute,
  Collection,
  itemAttribute,
  itemHandleSelector,
} from "../src";
import { itemHandleAttribute } from "../src/selectors";

test("Test nesting", () => {
  const topCollectionClass = "top-collection";
  const topItemClass = "top-item";
  const nestedCollectionClass = "nested-collection";
  const nestedItemClass = "nested-item";

  document.body.innerHTML = `
<div ${mainAttribute} class="${topCollectionClass}">
    <div ${itemAttribute} class="${topItemClass}">
        <div ${itemHandleAttribute}/>
        <div ${mainAttribute} class="${nestedCollectionClass}">
            <div ${itemAttribute} class="${nestedItemClass}">
                <div ${itemHandleAttribute}/>
            </div>
        </div>
    </div>
</div>
`;

  const collections = Collection.create(document, { sortable: true });
  for (const collection of collections) {
    // Make sure collections get the correct items.
    expect(collection.getItems()).toHaveLength(1);
    collection.accessNode((element: Element) => {
      if (element.classList.contains(topCollectionClass)) {
        collection.getItems()[0].accessNode((element: Element) => {
          expect(element.classList.contains(topItemClass)).toBe(true);
        });
      } else if (element.classList.contains(nestedCollectionClass)) {
        collection.getItems()[0].accessNode((element: Element) => {
          expect(element.classList.contains(nestedItemClass)).toBe(true);
        });
      }

      // The handle selector matches only the single handle.
      const handles = element.querySelectorAll(itemHandleSelector);
      expect(handles).toHaveLength(1);
    });
  }
});
