import { itemProviderAttribute, mainAttribute } from "./selectors";
import {
  AbstractWraplet,
  Core,
  DefaultCore,
  WrapletChildrenMap,
} from "wraplet";
import Collection, { CollectionMap, CollectionOptions } from "./Collection";

export interface CollectionItemProviderOptions {
  groupAttribute?: string;
}

export default class CollectionItemProvider extends AbstractWraplet<
  {},
  Element
> {
  private prototypeAttribute: string = "data-prototype";
  private options: Required<CollectionItemProviderOptions>;

  private listeners: ((element: Element) => void)[] = [];

  constructor(
    core: Core<{}, Element>,
    options: CollectionItemProviderOptions = {},
  ) {
    super(core);
    const defaultOptions: Required<CollectionItemProviderOptions> = {
      groupAttribute: Collection.defaultGroupAttribute,
    };
    this.options = { ...defaultOptions, ...options };

    this.core.addEventListener(this.node, "click", () => {
      const prototype = this.getPrototype();
      const newElement = this.createItemFromString(prototype);
      for (const listener of this.listeners) {
        listener(newElement);
      }
    });
  }

  /**
   * Adds a listener. It will be executed each time the user clicks on the item provider. The
   * new item's element will be passed as an argument.
   */
  public addListener(listener: (element: Element) => void): void {
    this.listeners.push(listener);
  }

  private getPrototype(): string {
    const prototype = this.node.getAttribute(this.prototypeAttribute);
    if (!prototype) {
      throw new Error(
        `Missing prototype attribute ${this.prototypeAttribute}.`,
      );
    }
    return prototype;
  }

  private createItemFromString(string: string): Element {
    const newElement = document.createElement("div");
    newElement.innerHTML = string;
    const child = newElement.children[0];
    if (!(child instanceof Element)) {
      throw new Error("Couldn't create an item.");
    }
    return child;
  }

  public static createMultiple(
    node: ParentNode,
    options: CollectionOptions = {},
    attribute: string = itemProviderAttribute,
  ): CollectionItemProvider[] {
    return this.createWraplets(node, {}, attribute, [options]);
  }

  public static create(element: HTMLElement): CollectionItemProvider {
    const core = new DefaultCore<{}, Element>(element, {});
    return new CollectionItemProvider(core);
  }
}
