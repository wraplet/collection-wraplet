/**
 * @jest-environment jsdom
 */
import "./setup";

import { Collection, CollectionItemProvider } from "../src";
import { mainAttribute, mainAddAttribute } from "../src";

test("Test collection initialization.", () => {
  document.body.innerHTML = `<div ${mainAttribute}></div>`;

  const collections = Collection.create(document);
  expect(collections).toHaveLength(1);
});

test("Test collection intem provider initialization.", () => {
  document.body.innerHTML = `<div ${mainAddAttribute}></div>`;

  const providers = CollectionItemProvider.create(document);
  expect(providers).toHaveLength(1);
});
