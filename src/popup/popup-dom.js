export function createCredentialChip(_websiteId, credential) {
  const chip = document.createElement("button");
  chip.className = "credential-chip";
  chip.type = "button";
  chip.dataset.credentialId = credential.id;

  const label = document.createElement("span");
  label.className = "chip-label";
  label.textContent = credential.label;

  const lock = document.createElement("span");
  lock.className = "chip-icon";
  lock.textContent = "🔐";

  chip.append(label, lock);
  return chip;
}

export function clearElement(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

/**
 * Creates a stylized empty state element.
 */
export function createEmptyState(message, icon = "📭") {
  const wrapper = document.createElement("div");
  wrapper.className = "empty-state";

  const iconEl = document.createElement("span");
  iconEl.className = "empty-state__icon";
  iconEl.textContent = icon;

  const heading = document.createElement("h3");
  heading.textContent = "Nothing here yet";

  const text = document.createElement("p");
  text.textContent = message;

  wrapper.append(iconEl, heading, text);
  return wrapper;
}
