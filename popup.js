document.addEventListener("DOMContentLoaded", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const button = document.getElementById("runScript");
  const errorMessage = document.getElementById("errorMessage");

  // Check if we're on a valid URL
  const isValidUrl = tab.url.match(
    /https:\/\/huly\.app\/workbench\/.*\/tracker\/.*/
  );

  if (!isValidUrl) {
    button.disabled = true;
    errorMessage.style.display = "block";
    return;
  }

  button.addEventListener("click", async () => {
    const sleepTime = document.getElementById("sleepTime").value;

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: runOnPage,
      args: [parseInt(sleepTime)],
    });
  });
});

function runOnPage(sleepTime) {
  function sleep() {
    return new Promise((resolve) => {
      setTimeout(resolve, sleepTime);
    });
  }

  async function main() {
    const category = document.querySelectorAll(
      "div.flex-between.categoryHeader.row"
    );
    for (let i = 0; i < category.length; i++) {
      const card = category[i];
      let [current, total] =
        card.children[0].children[2].textContent.split(" / ");
      current = parseInt(current);
      total = parseInt(total);

      if (current != total) {
        const remaining = Math.ceil((total - current) / 20);
        for (let j = 0; j < remaining; j++) {
          const loadMoreIssue = card.children[0].children[3].click();
          await sleep();
        }
      }
      const selectAllIssue = card.children[1].children[1];
      selectAllIssue.click();
    }
  }

  main();
}
