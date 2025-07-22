export const makeNestableSelectorFromAttribute = (itemAttribute: string, attribute: string) => `:scope [${attribute}]:not(:scope [${itemAttribute}] [${itemAttribute}] [${attribute}])`;

export const mainAttribute = "data-js-wraplet-collection";
export const itemProviderAttribute = `${mainAttribute}-add`;
export const collectionSelector = `[${mainAttribute}]`;
export const itemProviderSelector = `[${itemProviderAttribute}]`;
export const itemAttribute = `${mainAttribute}--item`;
export const itemSelector = `:scope > [${itemAttribute}]`;
export const itemRemoveAttribute = `${mainAttribute}--item--remove`;
export const itemRemoveButtonSelector = `[${itemRemoveAttribute}]`;
export const itemHandleAttribute = `${mainAttribute}--item--handle`;
export const itemHandleSelector = makeNestableSelectorFromAttribute(itemAttribute, itemHandleAttribute);
