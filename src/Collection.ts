import CollectionItemProvider from "./CollectionItemProvider";
import { itemSelector, mainAttribute } from "./selectors";
import CollectionItem from "./CollectionItem";
import Sortable from "sortablejs";
import {
  AbstractWraplet,
  Core,
  DefaultCore,
  StorageValidators,
  WrapletChildrenMap,
} from "wraplet";
import { ElementStorage } from "wraplet/storage";

type PositionCalculatedListener = (item: CollectionItem, index: number) => void;

export interface CollectionOptions extends Record<string, unknown> {
  calculateInitialPositionOnInit?: boolean;
  positionsCalculatedListeners?: PositionCalculatedListener[];
  sortable?: boolean;
}

export const CollectionMap = {
  itemProviders: {
    // We don't define selector, because we assume that the dependency will be provided
    // externally.
    Class: CollectionItemProvider,
    required: false,
    multiple: true,
  },
  items: {
    selector: itemSelector,
    Class: CollectionItem,
    required: false,
    multiple: true,
  },
} as const satisfies WrapletChildrenMap;

export default class Collection extends AbstractWraplet<
  typeof CollectionMap,
  HTMLElement
> {
  public static defaultGroupAttribute = "data-group";
  private readonly itemAddedListeners: ((item: CollectionItem) => void)[] = [];
  private readonly positionsCalculatedListeners: PositionCalculatedListener[] =
    [];

  private sortable: Sortable | null = null;
  private options: Required<CollectionOptions>;

  constructor(
    core: Core<typeof CollectionMap, HTMLElement>,
    options: CollectionOptions = {},
  ) {
    super(core);

    const defaultOptions: Required<CollectionOptions> = {
      positionsCalculatedListeners: [],
      calculateInitialPositionOnInit: false,
      sortable: false,
    };

    const validators: StorageValidators<typeof defaultOptions> = {
      positionsCalculatedListeners: (item) => Array.isArray(item),
      calculateInitialPositionOnInit: (item) => typeof item === "boolean",
      sortable: (item) => typeof item === "boolean",
    };

    const storage = new ElementStorage<Required<CollectionOptions>>(
      this.node,
      mainAttribute,
      { ...defaultOptions, ...options },
      validators,
    );

    this.options = storage.getAll();

    this.positionsCalculatedListeners =
      this.options.positionsCalculatedListeners;

    for (const item of this.children.items) {
      item.addDeleteListener(() => {
        this.recalculatePositions();
      });
    }

    if (this.options.calculateInitialPositionOnInit) {
      this.recalculatePositions();
    }

    if (this.options.sortable) {
      this.sortable = this.initSortable();
    }
  }

  public addItemAddedListener(listener: (item: CollectionItem) => void) {
    this.itemAddedListeners.push(listener);
  }

  public registerCollectionItemProvider(item: CollectionItemProvider): void {
    item.addListener((element) => {
      const item = this.createItem(element);
      this.addItem(item);
    });

    this.children.itemProviders.add(item);
  }

  public getItems(): CollectionItem[] {
    return this.children.items.getOrdered((item: CollectionItem) => {
      return item.getPosition();
    });
  }

  public addItem(item: CollectionItem) {
    item.accessNode((node: Node) => {
      this.node.append(node);
    });

    this.children.items.add(item);
    this.recalculatePositions();
    for (const listener of this.itemAddedListeners) {
      listener(item);
    }
  }

  public isSortable(): boolean {
    return this.sortable !== null;
  }

  private createItem(element: Element): CollectionItem {
    return CollectionItem.create(element);
  }

  private initSortable(): Sortable {
    // Fixing the text on the elements below getting selected during drag.
    this.node.style.setProperty("user-select", "none");
    // Make the container sortable.
    return new Sortable(this.node, {
      handle: CollectionItem.handleSelector,
      draggable: itemSelector,
      ghostClass: "sortable-ghost",
      dragClass: "sortable-drag",
      // @todo We need to find a way of testing this.
      onUpdate: /* istanbul ignore next */ () => {
        this.recalculatePositions();
      },
    });
  }

  public addPositionsCalculatedListener(
    callback: (item: CollectionItem, index: number) => void,
  ): void {
    this.positionsCalculatedListeners.push(callback);
  }

  private recalculatePositions(): void {
    for (const item of this.children.items.values()) {
      const index: number = item.getDOMPosition();

      if (!item.hasPosition()) {
        continue;
      }

      item.setPosition(index);
      for (const listener of this.positionsCalculatedListeners) {
        listener(item, index);
      }
    }
  }

  public static createMultiple(
    node: ParentNode,
    options: CollectionOptions = {},
    attribute: string = mainAttribute,
  ): Collection[] {
    return this.createWraplets(node, CollectionMap, attribute, [options]);
  }

  public static create(element: HTMLElement): Collection {
    const core = new DefaultCore<typeof CollectionMap, HTMLElement>(
      element,
      CollectionMap,
    );
    return new Collection(core);
  }
}
