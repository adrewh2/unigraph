import React, { useEffect, useState } from "react";

type WikipediaArticleViewerFactorGraphProps = {
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

export const WikipediaArticleViewer_FactorGraph: React.FC<
  WikipediaArticleViewerFactorGraphProps
> = ({ style = {}, highlightKeywords = [] }) => {
  const [srcDoc, setSrcDoc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSrcDoc(null);
    setError(null);
    const fetchAndInject = async () => {
      try {
        const title = "Factor graph";
        const language = "en";
        const encodedTitle = encodeURIComponent(title.replace(/ /g, "_"));
        const url = `https://${language}.wikipedia.org/w/api.php?action=parse&page=${encodedTitle}&format=json&origin=*&prop=text|headhtml`;
        const resp = await fetch(url);
        const data = await resp.json();
        if (data.parse && data.parse.text && data.parse.headhtml) {
          let html = data.parse.text["*"];
          html = highlightHtml(html, highlightKeywords);

          // Embed UnigraphApplication iframe after the first heading
          const unigraphIframe = `
            <div style="margin: 24px 0; text-align: center;">
              <iframe
                src="https://unigraph.vercel.app/?graph=AcademicsKG"
                title="Unigraph Application"
                style="width:100%;max-width:900px;height:480px;border:1px solid #ccc;border-radius:8px;"
                loading="lazy"
              ></iframe>
              <div style="font-size: 0.95em; color: #555; margin-top: 4px;">
                Embedded Unigraph Application: <a href="https://unigraph.vercel.app/?graph=AcademicsKG" target="_blank" rel="noopener noreferrer">Open in new tab</a>
              </div>
            </div>
          `;
          // Insert after first <h2> or <h1> (or at top if not found)
          html =
            html.replace(/(<h2[^>]*>.*?<\/h2>)/i, `$1${unigraphIframe}`) ||
            unigraphIframe + html;

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
          setSrcDoc(srcDoc);
        } else {
          setError("Article not found or could not be loaded.");
        }
      } catch (e) {
        setError("Failed to fetch Wikipedia article." + e);
      }
    };
    fetchAndInject();
  }, [highlightKeywords]);

  if (error) return <div style={style}>Error: {error}</div>;
  if (!srcDoc) return <div style={style}>Loading...</div>;

  return (
    <iframe
      srcDoc={srcDoc}
      title="Wikipedia: Factor graph (with Unigraph)"
      style={{
        width: "100%",
        minHeight: 800,
        border: "none",
        borderRadius: 8,
        background: "#fff",
        ...style,
      }}
      // Updated: allow-scripts and allow-same-origin for Wikipedia/Unigraph JS & CSS
      sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
      loading="lazy"
    />
  );
};

export default WikipediaArticleViewer_FactorGraph;
