import { itemProviderSelector, itemProviderAttribute } from "./selectors";
import { AbstractWraplet, WrapletChildrenMap } from "wraplet";
import { Groupable, GroupExtractor } from "./Groupable";

const childrenMap = {} as const satisfies WrapletChildrenMap;

export default class CollectionItemProvider
  extends AbstractWraplet<typeof childrenMap>
  implements Groupable
{
  private prototypeAttribute: string = "data-prototype";

  private groupExtractorCallback: GroupExtractor = (element: Element) =>
    element.getAttribute(itemProviderAttribute);

  constructor(element: Element) {
    super(element);
  }

  public setGroupExtractor(callback: GroupExtractor): void {
    this.groupExtractorCallback = callback;
  }

  public getGroup(): string | null {
    return this.groupExtractorCallback(this.element);
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
