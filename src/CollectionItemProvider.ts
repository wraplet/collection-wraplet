import { itemProviderSelector } from "./selectors";
import { AbstractWraplet, WrapletChildrenMap } from "wraplet";

const childrenMap = {} as const satisfies WrapletChildrenMap;

export default class CollectionItemProvider extends AbstractWraplet<
  typeof childrenMap
> {
  private prototypeAttribute: string = "data-prototype";

  constructor(element: Element) {
    super(element);
  }

  public addListener(listener: (element: Element) => void): void {
    this.element.addEventListener("click", () => {
      const prototype = this.getPrototype();
      const newElement = this.createItemFromString(prototype);
      listener(newElement);
    });
  }

  private getPrototype(): string {
    const prototype = this.element.getAttribute(this.prototypeAttribute);
    if (!prototype) {
      throw new Error(`Missing attribute ${this.prototypeAttribute}.`);
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
      throw Error("Could't create an item.");
    }
    return child;
  }

  public static create(
    document: Document,
    additional_args: unknown[] = [],
  ): CollectionItemProvider[] {
    return this.createWraplets(document, additional_args, itemProviderSelector);
  }
}
