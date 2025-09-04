import "./setup";
import { CollectionItemProvider } from "../src";
import { getIndirectException } from "./resources/utils";

it("Test CollectionItemProvider missing prototype", async () => {
  const element = document.createElement("div");

  new CollectionItemProvider(element);
  const errorThrown = await getIndirectException(async (user) => {
    await user.click(element);
  });

  expect(errorThrown).toBeDefined();
  expect(errorThrown?.message).toContain(
    "Missing prototype attribute data-prototype",
  );
});

it("Test CollectionItemProvider invalid prototype", async () => {
  const element = document.createElement("div");
  element.setAttribute("data-prototype", "invalid value");

  new CollectionItemProvider(element);
  const errorThrown = await getIndirectException(async (user) => {
    await user.click(element);
  });

  expect(errorThrown).toBeDefined();
  expect(errorThrown?.message).toContain("Couldn't create an item");
});
