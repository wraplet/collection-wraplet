import CollectionItemProvider from "./CollectionItemProvider";
import { collectionSelector, itemSelector } from "./selectors";
import CollectionItem from "./CollectionItem";
import Sortable from "sortablejs";
import { AbstractWraplet, WrapletChildrenMap } from "wraplet";

const childrenMap = {
  itemProviders: {
    // We don't define selector, because we assume that the dependency will be provided
    // externally.
    Class: CollectionItemProvider,
    required: false,
    multiple: true,
  },
  items: {
    selector: `:scope > ${itemSelector}`,
    Class: CollectionItem,
    required: false,
    multiple: true,
  },
} as const satisfies WrapletChildrenMap;

export default class Collection extends AbstractWraplet<
  typeof childrenMap,
  HTMLElement
> {
  private itemAddedListeners: ((item: CollectionItem) => void)[] = [];

  constructor(element: HTMLElement) {
    super(element);

    for (const item of this.children.items) {
      item.addRemoveListener(() => {
        this.syncChildren();
      });
    }

    this.enableSortable();
  }

  public addListenerItemAdded(listener: (item: CollectionItem) => void) {
    this.itemAddedListeners.push(listener);
  }

  public registerCollectionItemProvider(item: CollectionItemProvider): void {
    item.addListener((element) => {
      const item = this.createItem(element);
      this.addItem(item);
    });

    this.children.itemProviders.push(item);
  }

  public addItem(item: CollectionItem) {
    item.setPosition(this.getHighestPosition() + 1);
    this.element.append(item.getElement());
    this.children.items.push(item);
    for (const listener of this.itemAddedListeners) {
      listener(item);
    }
  }

  private createItem(element: Element): CollectionItem {
    return new CollectionItem(element);
  }

  private getHighestPosition(): number {
    const items = this.children.items;
    let highestPosition = 0;
    for (const item of items) {
      if (item.getPosition() > highestPosition) {
        highestPosition = item.getPosition();
      }
    }

    return highestPosition;
  }

  protected defineChildrenMap(): typeof childrenMap {
    return childrenMap;
  }

  private enableSortable(): void {
    // Fixing the text on the elements below getting selected during drag.
    this.element.style.setProperty("user-select", "none");
    // Make the container sortable.
    new Sortable(this.element, {
      handle: CollectionItem.handleSelector,
      draggable: itemSelector,
      ghostClass: "sortable-ghost",
      dragClass: "sortable-drag",
      onUpdate: () => {
        this.syncChildren();
      },
    });
  }

  private syncChildren() {
    const selector = `:scope > ${itemSelector}`;
    const elements = this.element.querySelectorAll(selector);
    // Empty an items array.
    this.children.items.length = 0;
    for (const element of elements) {
      const wraplets = element.wraplets;
      let collectionItem: CollectionItem | undefined = undefined;
      if (
        !Array.isArray(wraplets) ||
        !(collectionItem = wraplets.find(
          (element) => element instanceof CollectionItem,
        ))
      ) {
        throw new Error(
          `${this.constructor.name}: Unknown element has been added to the collection.`,
        );
      }
      this.children.items.push(collectionItem);
    }
    this.recalculatePositions();
  }

  private recalculatePositions(): void {
    this.children.items.sort((a, b) => {
      return a.getDOMPosition() - b.getDOMPosition();
    });
    for (const [index, item] of this.children.items.entries()) {
      item.setPosition(index);
    }
  }

  public static create(
    document: Document,
    additional_args: unknown[] = [],
  ): Collection[] {
    return this.createWraplets(document, additional_args, collectionSelector);
  }
}
