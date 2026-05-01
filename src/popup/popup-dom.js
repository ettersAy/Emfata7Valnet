export function createCredentialChip(websiteId, credential) {
  const chip = document.createElement("button");
  chip.className = "credential-chip";
  chip.type = "button";
  chip.dataset.websiteId = websiteId;
  chip.dataset.credentialId = credential.id;

  const label = document.createElement("span");
  label.textContent = credential.label;

  const lock = document.createElement("span");
  lock.textContent = "🔐";

  const magic = document.createElement("span");
  magic.textContent = "🪄";

  chip.append(label, lock, magic);
  return chip;
}

export function clearElement(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}
