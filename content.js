function extractRelevantData() {
    let data = {
        url: window.location.href,
        backlinks: [],
        checkoutLinks: [],
        affiliateIDs: new Set(),
        productInfo: {},
    };

    document.querySelectorAll("a").forEach((link) => {
        let href = link.href;
        if (
            href.includes("checkout") ||
            href.includes("order") ||
            href.includes("secure")
        ) {
            data.checkoutLinks.push(href);
        } else if (href.startsWith("http") || href.startsWith("https")) {
            data.backlinks.push(href);
        }

        const affMatch = href.match(/aff_id=([^&]+)/);
        if (affMatch) {
            data.affiliateIDs.add(affMatch[1]);
        }
    });

    const pageContent = document.body.innerHTML;
    const affMatches = pageContent.match(/aff_id=([^&"'\s]+)/g);
    if (affMatches) {
        affMatches.forEach((match) => {
            const id = match.split("=")[1];
            data.affiliateIDs.add(id);
        });
    }

    data.affiliateIDs = Array.from(data.affiliateIDs);

    const productNameElement =
        document.querySelector("h1") || document.querySelector("h2");
    if (productNameElement) {
        data.productInfo.name = productNameElement.textContent.trim();
    }

    const priceElement =
        document.querySelector(".price") ||
        document.querySelector('[itemprop="price"]');
    if (priceElement) {
        data.productInfo.price = priceElement.textContent.trim();
    }

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
        data.metaDescription = metaDescription.getAttribute("content");
    }

    return data;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "extractData") {
        const extractedData = extractRelevantData();
        sendResponse({ data: extractedData });
    }
});
