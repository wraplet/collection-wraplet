import { itemHandleSelector, itemRemoveButtonSelector } from "./selectors";
import { AbstractWraplet, destroyWrapletsRecursively } from "wraplet";

export default class CollectionItem extends AbstractWraplet<{}, Element> {
  public static handleSelector = itemHandleSelector;
  public static removeSelector = itemRemoveButtonSelector;

  private deleteListeners: ((item: CollectionItem) => void)[] = [];

  constructor(element: Element) {
    super(element);
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
    const positionSelector = this.node.getAttribute("data-position-selector");
    if (!positionSelector) {
      throw new Error(`Unknown position selector.`);
    }

    const positionElement = this.node.querySelector(`${positionSelector}`);
    if (!positionElement) {
      throw new Error(`Missing position element.`);
    }

    return positionElement;
  }
}
