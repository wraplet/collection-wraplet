import {
  itemAttribute,
  itemHandleSelector,
  itemRemoveButtonSelector,
} from "./selectors";
import { AbstractWraplet, destroyWrapletsRecursively } from "wraplet";

export type CollectionItemOptions = {
  positionSelector?: string;
};

export default class CollectionItem extends AbstractWraplet<{}, Element> {
  public static handleSelector = itemHandleSelector;
  public static removeSelector = itemRemoveButtonSelector;

  private deleteListeners: ((item: CollectionItem) => void)[] = [];
  private options: Required<CollectionItemOptions>;

  constructor(element: Element, options: CollectionItemOptions = {}) {
    super(element);
    const defaultOptions: Required<CollectionItemOptions> = {
      positionSelector: "[data-position]",
    };
    const htmlOptionsString = this.node.getAttribute(itemAttribute) || "{}";
    const htmlOptions = this.parseHTMLOptions(htmlOptionsString);

    this.options = { ...defaultOptions, ...options, ...htmlOptions };

    const removeElements = element.querySelectorAll(
      CollectionItem.removeSelector,
    );
    for (const removeElement of removeElements) {
      this.registerRemoveButton(removeElement);
    }
  }

  public addDeleteListener(listener: (item: CollectionItem) => void) {
    this.deleteListeners.push(listener);
  }

  public setPosition(index: number): void {
    const positionElement = this.getPositionElement();
    positionElement.setAttribute("value", String(index));
  }

  public getPosition(): number {
    const positionElement = this.getPositionElement();

    const positionValue = positionElement.getAttribute("value");
    if (!positionValue) {
      throw new Error("Couldn't get the position value.");
    }

    return parseInt(positionValue);
  }

  public getDOMPosition(): number {
    const parentNode = this.node.parentNode;
    if (!parentNode) {
      throw new Error(
        "Couldn't get the actual position because parentNode couldn't be found.",
      );
    }
    return Array.from(parentNode.children).indexOf(this.node);
  }

  public delete(): void {
    for (const listener of this.deleteListeners) {
      listener(this);
    }
    this.node.remove();

    this.destroy();
    destroyWrapletsRecursively(this.node);
  }

  protected defineChildrenMap(): {} {
    return {};
  }

  private registerRemoveButton(element: Element) {
    element.addEventListener("click", () => {
      this.delete();
    });
  }

  private getPositionElement(): Element {
    const positionElement = this.node.querySelector(
      this.options.positionSelector,
    );
    if (!positionElement) {
      throw new Error(`Missing position element.`);
    }

    return positionElement;
  }

  private parseHTMLOptions(htmlOptions: string): CollectionItemOptions {
    // We run this first to check if we deal with a valid JSON.
    const jsonOptions = JSON.parse(htmlOptions);
    // Now we check if JSON was an object.
    if (htmlOptions.charAt(0) !== "{") {
      throw new Error(`JSON options have to be passed as an object.`);
    }

    return jsonOptions;
  }
}
