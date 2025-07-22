import CollectionItemProvider from "./CollectionItemProvider";
import { collectionSelector, itemSelector, mainAttribute } from "./selectors";
import CollectionItem from "./CollectionItem";
import Sortable from "sortablejs";
import { AbstractWraplet, WrapletChildrenMap } from "wraplet";
import { Groupable, GroupExtractor } from "./Groupable";

type PositionCalculationListener = (
  item: CollectionItem,
  index: number,
) => void;

export interface CollectionOptions {
  calculateInitialPositionOnInit?: boolean;
  positionsCalculationListeners?: PositionCalculationListener[];
  sortable?: boolean;
  groupAttribute?: string;
}

const childrenMap = {
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

export default class Collection
  extends AbstractWraplet<typeof childrenMap, HTMLElement>
  implements Groupable
{
  public static defaultGroupAttribute = "data-group";
  private readonly itemAddedListeners: ((item: CollectionItem) => void)[] = [];
  private readonly positionsCalculationListeners: PositionCalculationListener[] =
    [];

  private groupExtractorCallback: GroupExtractor = (element: Element) =>
    element.getAttribute(this.options.groupAttribute);

  private sortable: Sortable | null = null;
  private options: Required<CollectionOptions>;

  constructor(element: HTMLElement, constructorOptions: CollectionOptions = {}) {
    super(element);

    const defaultOptions: Required<CollectionOptions> = {
      positionsCalculationListeners: [],
      calculateInitialPositionOnInit: false,
      sortable: false,
      groupAttribute: Collection.defaultGroupAttribute,
    };

    const htmlOptionsString = this.node.getAttribute(mainAttribute) || '{}';
    const htmlOptions = this.parseHTMLOptions(htmlOptionsString);

    this.options = { ...defaultOptions, ...constructorOptions, ...htmlOptions };

    if (this.options.positionsCalculationListeners) {
      this.positionsCalculationListeners =
        this.options.positionsCalculationListeners;
    }

    for (const item of this.children.items) {
      item.addRemoveListener(() => {
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

  public setGroupExtractor(callback: GroupExtractor): void {
    this.groupExtractorCallback = callback;
  }

  public getGroup(): string | null {
    return this.groupExtractorCallback(this.node);
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

  public getItems(): CollectionItem[] {
    return this.children.items;
  }

  public addItem(item: CollectionItem) {
    item.setPosition(this.getHighestPosition() + 1);
    item.accessNode((node: Node) => {
      this.node.append(node);
    })
    this.children.items.push(item);
    for (const listener of this.itemAddedListeners) {
      listener(item);
    }
  }

  public isSortable(): boolean {
    return this.sortable !== null;
  }

  private parseHTMLOptions(htmlOptions: string): CollectionOptions {
    // We run this first to check if we deal with a valid JSON.
    const jsonOptions = JSON.parse(htmlOptions);
    // Now we check if JSON was an object.
    if (htmlOptions.charAt(0) !== "{") {
      throw new Error(`JSON options have to be passed as an object.`);
    }

    return jsonOptions;
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

  private initSortable(): Sortable {
    // Fixing the text on the elements below getting selected during drag.
    this.node.style.setProperty("user-select", "none");
    // Make the container sortable.
    return new Sortable(this.node, {
      handle: CollectionItem.handleSelector,
      draggable: itemSelector,
      ghostClass: "sortable-ghost",
      dragClass: "sortable-drag",
      onUpdate: () => {
        this.recalculatePositions();
      },
    });
  }

  public addPositionsCalculationListener(
    callback: (item: CollectionItem, index: number) => void,
  ): void {
    this.positionsCalculationListeners.push(callback);
  }

  private recalculatePositions(): void {
    this.children.items.sort((a, b) => {
      return a.getDOMPosition() - b.getDOMPosition();
    });
    for (const [index, item] of this.children.items.entries()) {
      item.setPosition(index);
      for (const listener of this.positionsCalculationListeners) {
        listener(item, index);
      }
    }
  }

  public static create(
    node: ParentNode,
    options: CollectionOptions = {},
  ): Collection[] {
    return this.createWraplets(node, collectionSelector, [options]);
  }
}
