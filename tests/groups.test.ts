import "./setup";
import {
  mainAttribute,
  Collection,
  itemProviderAttribute,
  CollectionItemProvider,
  itemProviderSelector,
} from "../src";

function createSingleCollection(document: Document): Collection {
  const collections = Collection.create(document);
  if (!collections[0]) {
    throw new Error("Collections not found.");
  }
  return collections[0];
}

function createSingleItemProvider(): CollectionItemProvider {
  const addElement = document.querySelector(itemProviderSelector) as Element;
  if (!addElement) {
    throw new Error("Add element not found.");
  }
  return new CollectionItemProvider(addElement);
}

test("Test the default group extractor callback", () => {
  document.body.innerHTML = `
<div ${itemProviderAttribute}="1"></div>
<div ${mainAttribute}="1"></div>
`;

  const collection = createSingleCollection(document);
  expect(collection.getGroup()).toBe("1");

  const itemProvider = createSingleItemProvider();
  expect(itemProvider.getGroup()).toBe("1");
});

test("Test the custom group extractor callback", () => {
  document.body.innerHTML = `
<div ${itemProviderAttribute} data-group="1"></div>
<div ${mainAttribute} data-group="1"></div>
`;

  const customGroupExtractor = (element: Element) => {
    return element.getAttribute("data-group");
  };

  const collection = createSingleCollection(document);
  collection.setGroupExtractor(customGroupExtractor);
  expect(collection.getGroup()).toBe("1");

  const itemProvider = createSingleItemProvider();
  itemProvider.setGroupExtractor(customGroupExtractor);
  expect(itemProvider.getGroup()).toBe("1");
});
