import { itemProviderAttribute } from "./selectors";
import { AbstractWraplet, WrapletChildrenMap } from "wraplet";
import { Groupable, GroupExtractor } from "./Groupable";
import Collection from "./Collection";

export interface CollectionItemProviderOptions {
  groupAttribute?: string;
}

const childrenMap = {} as const satisfies WrapletChildrenMap;

export default class CollectionItemProvider
  extends AbstractWraplet<typeof childrenMap, Element>
  implements Groupable
{
  private prototypeAttribute: string = "data-prototype";
  private options: Required<CollectionItemProviderOptions>;

  private listeners: ((element: Element) => void)[] = [];

  private groupExtractorCallback: GroupExtractor = (element: Element) =>
    element.getAttribute(this.options.groupAttribute);

  constructor(element: Element, options: CollectionItemProviderOptions = {}) {
    super(element);
    const defaultOptions: Required<CollectionItemProviderOptions> = {
      groupAttribute: Collection.defaultGroupAttribute,
    };
    this.options = { ...defaultOptions, ...options };

    this.childrenManager.addEventListener(this.node, "click", () => {
      const prototype = this.getPrototype();
      const newElement = this.createItemFromString(prototype);
      for (const listener of this.listeners) {
        listener(newElement);
      }
    });
  }

  public setGroupExtractor(callback: GroupExtractor): void {
    this.groupExtractorCallback = callback;
  }

  public getGroup(): string | null {
    return this.groupExtractorCallback(this.node);
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

  protected defineChildrenMap(): typeof childrenMap {
    return childrenMap;
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

  public static create(
    document: Document,
    additional_args: unknown[] = [],
  ): CollectionItemProvider[] {
    return this.createWraplets(
      document,
      itemProviderAttribute,
      additional_args,
    );
  }
}
