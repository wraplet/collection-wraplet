import { itemHandleSelector, itemRemoveButtonSelector } from "./selectors";
import { AbstractWraplet } from "wraplet";

export default class CollectionItem extends AbstractWraplet<any> {
  public static handleSelector = itemHandleSelector;
  public static removeSelector = itemRemoveButtonSelector;

  private removeListeners: ((item: CollectionItem) => void)[] = [];

  constructor(element: Element) {
    super(element);
    const removeElements = element.querySelectorAll(
      CollectionItem.removeSelector,
    );
    for (const removeElement of removeElements) {
      this.registerRemoveButton(removeElement);
    }
  }

  public addRemoveListener(listener: (item: CollectionItem) => void) {
    this.removeListeners.push(listener);
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

  public getElement() {
    return this.element;
  }

  public getDOMPosition(): number {
    const parentNode = this.element.parentNode;
    if (!parentNode) {
      throw new Error(
        "Couldn't get the actual position because parentNode couldn't be found.",
      );
    }
    return Array.from(parentNode.children).indexOf(this.element);
  }

  public remove(): void {
    for (const listener of this.removeListeners) {
      listener(this);
    }
    this.element.remove();
  }

  protected defineChildrenMap(): any {
    return {};
  }

  private registerRemoveButton(element: Element) {
    element.addEventListener("click", () => {
      this.remove();
    });
  }

  private getPositionElement(): Element {
    const positionSelector = this.element.getAttribute(
      "data-position-selector",
    );
    if (!positionSelector) {
      throw new Error(`Unknown position selector.`);
    }

    const positionElement = this.element.querySelector(`${positionSelector}`);
    if (!positionElement) {
      throw new Error(`Missing position element.`);
    }

    return positionElement;
  }
}
