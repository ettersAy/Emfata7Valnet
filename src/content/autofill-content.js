chrome.runtime.onMessage.addListener((message) => {
  if (message?.type !== "RUN_AUTOFILL") {
    return;
  }

  const { credential, fieldKeywords } = message.payload;
  const userInput = findBestInput(fieldKeywords.user, ["text", "email", ""]);
  const passwordInput = findBestInput(fieldKeywords.password, ["password", "text", ""]);

  if (userInput) {
    fillInput(userInput, credential.username);
  }

  if (passwordInput) {
    fillInput(passwordInput, credential.password);
  }
});

function findBestInput(keywords, acceptedTypes) {
  const inputs = Array.from(document.querySelectorAll("input"));
  const keywordSet = keywords.map((keyword) => keyword.toLowerCase());

  return inputs.find((input) => {
    const type = (input.type || "").toLowerCase();
    if (!acceptedTypes.includes(type)) {
      return false;
    }

    const haystack = [input.name, input.id, input.className, input.placeholder, input.ariaLabel]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return keywordSet.some((keyword) => haystack.includes(keyword));
  });
}

function fillInput(input, value) {
  input.focus();
  input.value = value;
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}
