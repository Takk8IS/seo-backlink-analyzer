document.addEventListener("DOMContentLoaded", function () {
    const extractButton = document.getElementById("extract");
    const resultsContainer = document.getElementById("results");
    const resultsContent = document.getElementById("resultsContent");
    const copyButton = document.getElementById("copyResults");
    const spinner = document.querySelector(".spinner");

    function toggleSpinner(show) {
        spinner.style.display = show ? "block" : "none";
        extractButton.disabled = show;
    }

    extractButton.addEventListener("click", async () => {
        resultsContainer.style.display = "none";
        resultsContent.innerHTML = "";
        toggleSpinner(true);

        try {
            const [tab] = await chrome.tabs.query({
                active: true,
                currentWindow: true,
            });
            chrome.tabs.sendMessage(
                tab.id,
                { action: "extractData" },
                (response) => {
                    toggleSpinner(false);
                    if (chrome.runtime.lastError) {
                        displayError(
                            `Error: ${chrome.runtime.lastError.message}`,
                        );
                    } else if (response && response.data) {
                        displayResults(response.data);
                    } else {
                        displayError("No data found or extraction failed.");
                    }
                },
            );
        } catch (error) {
            toggleSpinner(false);
            displayError("An unexpected error occurred.");
        }
    });

    copyButton.addEventListener("click", async () => {
        const textToCopy = formatResultsForCopy(resultsContent);
        try {
            await navigator.clipboard.writeText(textToCopy);
            const originalText = copyButton.innerHTML;
            copyButton.innerHTML = '<i class="material-icons">check</i>Copied!';
            copyButton.disabled = true;
            setTimeout(() => {
                copyButton.innerHTML = originalText;
                copyButton.disabled = false;
            }, 2000);
        } catch (err) {
            console.error("Failed to copy text: ", err);
        }
    });

    function displayResults(data) {
        const resultsHTML = `
            <p><i class="material-icons">link</i><span class="text-content"><strong>URL:</strong> ${data.url}</span></p>
            <h3><i class="material-icons">shopping_cart</i><span class="text-content">Checkout Links (${data.checkoutLinks.length})</span></h3>
            <ul>
                ${data.checkoutLinks.map((link) => `<li><i class="material-icons">arrow_right</i><span class="text-content">${link}</span></li>`).join("")}
            </ul>
            <h3><i class="material-icons">person</i><span class="text-content">Affiliate IDs (${data.affiliateIDs.length})</span></h3>
            <ul>
                ${data.affiliateIDs.map((id) => `<li><i class="material-icons">vpn_key</i><span class="text-content">${id}</span></li>`).join("")}
            </ul>
            <h3><i class="material-icons">info</i><span class="text-content">Product Info</span></h3>
            <p><i class="material-icons">label</i><span class="text-content"><strong>Name:</strong> ${data.productInfo.name || "N/A"}</span></p>
            <p><i class="material-icons">attach_money</i><span class="text-content"><strong>Price:</strong> ${data.productInfo.price || "N/A"}</span></p>
            <h3><i class="material-icons">description</i><span class="text-content">Meta Description</span></h3>
            <p><i class="material-icons">short_text</i><span class="text-content">${data.metaDescription || "N/A"}</span></p>
            <h3><i class="material-icons">link</i><span class="text-content">Backlinks (${data.backlinks.length})</span></h3>
            <ul>
                ${data.backlinks
                    .slice(0, 10)
                    .map(
                        (link) =>
                            `<li><i class="material-icons">insert_link</i><span class="text-content">${link}</span></li>`,
                    )
                    .join("")}
            </ul>
            ${data.backlinks.length > 10 ? `<p><i class="material-icons">more_horiz</i><span class="text-content">...and ${data.backlinks.length - 10} more</span></p>` : ""}
        `;
        resultsContent.innerHTML = resultsHTML;
        resultsContainer.style.display = "block";
    }

    function displayError(message) {
        resultsContent.innerHTML = `<p style="color: #f5449b;"><i class="material-icons">error</i><span class="text-content">${message}</span></p>`;
        resultsContainer.style.display = "block";
    }

    function formatResultsForCopy(container) {
        let text = "";

        container.querySelectorAll("p, h3, ul").forEach((element) => {
            if (element.tagName === "P") {
                text += element.textContent + "\n";
            } else if (element.tagName === "H3") {
                text += "\n" + element.textContent + "\n";
            } else if (element.tagName === "UL") {
                element.querySelectorAll("li").forEach((li) => {
                    text += "  - " + li.textContent + "\n";
                });
            }
        });

        return text.trim();
    }
});
