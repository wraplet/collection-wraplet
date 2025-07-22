import "./setup";
import {
  mainAttribute,
  Collection,
  itemProviderAttribute,
  CollectionItemProvider,
  itemProviderSelector,
  CollectionOptions,
  CollectionItemProviderOptions,
} from "../src";

function createSingleCollection(
  document: Document,
  options: CollectionOptions = {},
): Collection {
  const collections = Collection.create(document, options);
  if (!collections[0]) {
    throw new Error("Collections not found.");
  }
  return collections[0];
}

function createSingleItemProvider(
  options: CollectionItemProviderOptions = {},
): CollectionItemProvider {
  const addElement = document.querySelector(itemProviderSelector) as Element;
  if (!addElement) {
    throw new Error("Add element not found.");
  }
  return new CollectionItemProvider(addElement, options);
}

test("Test the default group extractor callback", () => {
  document.body.innerHTML = `
<div ${itemProviderAttribute} data-group="1"></div>
<div ${mainAttribute} data-group="1"></div>
`;

  const collection = createSingleCollection(document);
  expect(collection.getGroup()).toBe("1");

  const itemProvider = createSingleItemProvider();
  expect(itemProvider.getGroup()).toBe("1");
});

test("Test the custom group extractor callback", () => {
  document.body.innerHTML = `
<div ${itemProviderAttribute} data-group-custom="1"></div>
<div ${mainAttribute} data-group-custom="1"></div>
`;

  const customGroupExtractor = (element: Element) => {
    return element.getAttribute("data-group-custom");
  };

  const collection = createSingleCollection(document);
  collection.setGroupExtractor(customGroupExtractor);
  expect(collection.getGroup()).toBe("1");

  const itemProvider = createSingleItemProvider();
  itemProvider.setGroupExtractor(customGroupExtractor);
  expect(itemProvider.getGroup()).toBe("1");
});

test("Test the custom group attribute", () => {
  const customGroupAttribute = "data-group-custom";
  document.body.innerHTML = `
<div ${itemProviderAttribute} ${customGroupAttribute}="1"></div>
<div ${mainAttribute} ${customGroupAttribute}="1"></div>
`;

  const collections = Collection.create(document, {
    groupAttribute: customGroupAttribute,
  });
  if (!collections[0]) {
    throw new Error("Collections not found.");
  }
  const collection = collections[0];

  expect(collection.getGroup()).toBe("1");

  const itemProvider = createSingleItemProvider({
    groupAttribute: customGroupAttribute,
  });
  expect(itemProvider.getGroup()).toBe("1");
});
