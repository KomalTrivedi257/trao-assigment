const axios = require("axios");
const cheerio = require("cheerio");


// Fetch and clean a company page
const fetchCompanyPage = async (url) => {
    try {
        const response = await axios.get(url, {
            timeout: 10000,
            maxContentLength: 2 * 1024 * 1024,
            headers: {
                "User-Agent": "TraoInterviewPrep/1.0"
            }
        });

        const contentType = response.headers["content-type"] || "";

        if (!contentType.includes("text/html")) {
            throw new Error("URL does not contain an HTML page");
        }

        const $ = cheerio.load(response.data);

        $("script, style, noscript").remove();

        const title = String($("title").text() || "")
            .trim();

        const text = String($("body").text() || "")
            .replace(/\s+/g, " ")
            .trim();

        const links = [];

        $("a[href]").each((index, element) => {
            const href = $(element).attr("href");

            const linkText = String($(element).text() || "")
                .replace(/\s+/g, " ")
                .trim();

            if (href) {
                links.push({
                    text: linkText,
                    href
                });
            }
        });

        return {
            url,
            title,
            text,
            links
        };

    } catch (error) {
        console.error("Company page fetch error:", error.message);

        throw new Error("Unable to access company website");
    }
};


// Rank useful company links
const rankCompanyLinks = (links) => {

    const keywords = {
        careers: 10,
        career: 10,
        jobs: 10,
        hiring: 10,
        "work with us": 10,
        company: 8,
        about: 8,
        culture: 7,
        engineering: 7,
        team: 6,
        product: 5,
        products: 5
    };

    const rankedLinks = links.map((link) => {

        const text = `${link.text} ${link.href}`.toLowerCase();

        let score = 0;

        for (const keyword in keywords) {
            if (text.includes(keyword)) {
                score += keywords[keyword];
            }
        }

        return {
            ...link,
            score
        };
    });

    return rankedLinks
        .filter((link) => link.score > 0)
        .sort((a, b) => b.score - a.score);
};


// Research company website
const researchCompany = async (url) => {

    const homepage = await fetchCompanyPage(url);

    const rankedLinks = rankCompanyLinks(homepage.links);

    const pages = [
        {
            url: homepage.url,
            title: homepage.title,
            text: homepage.text
        }
    ];

    // Select top 5 relevant pages
    const selectedLinks = rankedLinks.slice(0, 5);

    for (const link of selectedLinks) {

        try {
            let pageUrl = link.href;

            // Convert relative URL to absolute URL
            if (pageUrl.startsWith("/")) {
                pageUrl = new URL(pageUrl, url).href;
            }

            // Skip unsupported links
            if (!pageUrl.startsWith("http")) {
                continue;
            }

            const page = await fetchCompanyPage(pageUrl);

            pages.push({
                url: page.url,
                title: page.title,
                text: page.text
            });

        } catch (error) {

            console.log(
                `Skipping inaccessible page: ${link.href}`
            );
        }
    }

    return {
        pages,
        rankedLinks
    };
};


module.exports = {
    fetchCompanyPage,
    rankCompanyLinks,
    researchCompany
};