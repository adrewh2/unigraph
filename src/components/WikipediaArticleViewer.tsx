import React, { useEffect, useState } from "react";
import { replaceUnigraphUrlsWithLocalhost } from "../utils/urlUtils";

type WikipediaArticleViewerProps = {
  title: string;
  language?: string;
  style?: React.CSSProperties;
  highlightKeywords?: string[];
};

function highlightHtml(html: string, keywords: string[]) {
  if (!keywords?.length) return html;
  keywords.forEach((kw) => {
    const safeKw = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    html = html.replace(
      new RegExp(`(>[^<]*)(${safeKw})([^>]*<)`, "gi"),
      (_, before, match, after) =>
        `${before}<span style="background:yellow; color:#000; border-radius:3px; padding:0 2px;">${match}</span>${after}`
    );
  });
  return html;
}

export const WikipediaArticleViewer: React.FC<WikipediaArticleViewerProps> = ({
  title,
  language = "en",
  style = {},
  highlightKeywords = [],
}) => {
  const [srcDoc, setSrcDoc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSrcDoc(null);
    setError(null);
    const fetchAndInject = async () => {
      try {
        const encodedTitle = encodeURIComponent(title.replace(/ /g, "_"));
        const url = `https://${language}.wikipedia.org/w/api.php?action=parse&page=${encodedTitle}&format=json&origin=*&prop=text|headhtml`;
        const resp = await fetch(url);
        const data = await resp.json();
        if (data.parse && data.parse.text && data.parse.headhtml) {
          let html = data.parse.text["*"];
          html = highlightHtml(html, highlightKeywords);

          // Replace any unigraph.vercel.app links with localhost:3000 when running locally
          html = replaceUnigraphUrlsWithLocalhost(html);

          // Wikipedia CSS (main stylesheet, plus vector skin and content)
          const cssLinks = [
            `https://${language}.wikipedia.org/w/load.php?debug=false&lang=${language}&modules=site.styles&only=styles&skin=vector`,
            `https://${language}.wikipedia.org/w/load.php?debug=false&lang=${language}&modules=mediawiki.legacy.commonPrint,shared|mediawiki.skinning.content.parsoid|mediawiki.skinning.interface|mediawiki.skinning.content&only=styles&skin=vector`,
            `https://${language}.wikipedia.org/w/load.php?debug=false&lang=${language}&modules=ext.cite.styles|ext.pygments&only=styles&skin=vector`,
          ];

          const cssLinksHtml = cssLinks
            .map(
              (href) =>
                `<link rel="stylesheet" type="text/css" href="${href}" />`
            )
            .join("\n");

          const srcDoc = `
            <html>
              <head>
                <base target="_blank" />
                ${cssLinksHtml}
                ${data.parse.headhtml}
                <style>
                  body { background: #fff; margin: 0; padding: 24px; }
                  .mw-parser-output { max-width: 900px; margin: auto; }
                </style>
              </head>
              <body>
                <div class="mw-parser-output">${html}</div>
              </body>
            </html>
          `;
          // Apply URL replacement to the entire srcDoc as well
          setSrcDoc(replaceUnigraphUrlsWithLocalhost(srcDoc));
        } else {
          setError("Article not found or could not be loaded.");
        }
      } catch (e) {
        setError("Failed to fetch Wikipedia article: " + e);
      }
    };
    fetchAndInject();
  }, [title, language, highlightKeywords]);

  if (error) return <div style={style}>Error: {error}</div>;
  if (!srcDoc) return <div style={style}>Loading...</div>;

  return (
    <iframe
      srcDoc={srcDoc}
      title={`Wikipedia: ${title}`}
      style={{
        width: "100%",
        minHeight: 600,
        border: "none",
        borderRadius: 8,
        background: "#fff",
        ...style,
      }}
      sandbox="allow-same-origin allow-popups allow-forms"
      loading="lazy"
    />
  );
};

export default WikipediaArticleViewer;
