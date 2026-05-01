export const popupState = {
  websites: [],
  editWebsiteId: null,
  searchQuery: "",
  collapsed: false,
  _toastTimer: null
};

export function filteredWebsites() {
  if (!popupState.searchQuery) return popupState.websites;
  const q = popupState.searchQuery;
  return popupState.websites.filter(
    (w) =>
      w.label.toLowerCase().includes(q) ||
      w.url.toLowerCase().includes(q)
  );
}
