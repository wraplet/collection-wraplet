import {
  itemAttribute,
  itemHandleSelector,
  itemRemoveButtonSelector,
} from "./selectors";
import {
  AbstractWraplet,
  Core,
  DefaultCore,
  destroyWrapletsRecursively,
  StorageValidators,
} from "wraplet";
import { ElementStorage } from "wraplet/storage";

export type CollectionItemOptions = {
  positionSelector?: string;
};

export default class CollectionItem extends AbstractWraplet<{}, Element> {
  public static handleSelector = itemHandleSelector;
  public static removeSelector = itemRemoveButtonSelector;

  private deleteListeners: ((item: CollectionItem) => void)[] = [];
  private options: Required<CollectionItemOptions>;

  constructor(core: Core<{}, Element>, options: CollectionItemOptions = {}) {
    super(core);
    const defaultOptions: Required<CollectionItemOptions> = {
      positionSelector: "[data-position]",
    };

    const validators: StorageValidators<CollectionItemOptions> = {
      positionSelector: (item) => typeof item === "string",
    };

    const storage = new ElementStorage<Required<CollectionItemOptions>>(
      this.node,
      itemAttribute,
      { ...defaultOptions, ...options },
      validators,
    );

    this.options = storage.getAll();

    const removeElements = this.node.querySelectorAll(
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
    if (!positionElement) {
      throw new Error("Position element not found.");
    }
    positionElement.setAttribute("value", String(index));
  }

  public getPosition(): number {
    const positionElement = this.getPositionElement();
    if (!positionElement) {
      throw new Error("Position element not found.");
    }
    const positionValue = positionElement.getAttribute("value");
    if (!positionValue) {
      throw new Error("No position value.");
    }

    return parseInt(positionValue);
  }

  public hasPosition(): boolean {
    return Boolean(this.getPositionElement());
  }

  public getDOMPosition(): number {
    const parentNode = this.node.parentNode;
    if (!parentNode) {
      throw new Error("ParentNode has not been found.");
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

  private registerRemoveButton(element: Element) {
    element.addEventListener("click", () => {
      this.delete();
    });
  }

  private getPositionElement(): Element | null {
    const positionElement = this.node.querySelector(
      this.options.positionSelector,
    );
    if (!positionElement) {
      return null;
    }

    return positionElement;
  }

  public static create(element: Element): CollectionItem {
    const core = new DefaultCore<{}, Element>(element, {});
    return new CollectionItem(core);
  }
}
