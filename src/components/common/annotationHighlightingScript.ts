export interface AnnotationHighlight {
  id: string;
  data: {
    selected_text: string;
    comment?: string;
    secondary_comment?: string;
    tags?: string[];
  };
}

export interface ProcessedHtmlResult {
  html: string;
  highlightsAdded: number;
}

export const processHtmlWithHighlights = (
  htmlContent: string,
  annotations: AnnotationHighlight[]
): ProcessedHtmlResult => {
  console.log("Processing HTML with", annotations.length, "annotations");
  console.log("HTML content length:", htmlContent.length);
  console.log(
    "Annotations:",
    annotations.map((a) => ({
      id: a.id,
      selected_text: a.data.selected_text,
    }))
  );

  let processedHtml = htmlContent;
  let highlightsAdded = 0;

  // Add selection script to the HTML
  const selectionScript = `
    <script>
      (function() {
        let lastSelection = '';
        
        // Capture selection on mouseup
        document.addEventListener('mouseup', function(e) {
          const selection = window.getSelection();
          if (selection && selection.toString().trim()) {
            lastSelection = selection.toString().trim();
            console.log('Selection captured in iframe:', lastSelection);
          }
        });
        
        // Capture selection on contextmenu
        document.addEventListener('contextmenu', function(e) {
          const selection = window.getSelection();
          if (selection && selection.toString().trim()) {
            lastSelection = selection.toString().trim();
            console.log('Context menu selection in iframe:', lastSelection);
            
            // Send message to parent
            window.parent.postMessage({
              type: 'iframe-selection',
              selection: lastSelection,
              x: e.clientX,
              y: e.clientY
            }, '*');
          }
        });
        
        // Expose function to get last selection
        window.getLastSelection = function() {
          return lastSelection;
        };
      })();
    </script>
  `;

  // Insert the script before the closing </head> tag
  if (processedHtml.includes("</head>")) {
    processedHtml = processedHtml.replace(
      "</head>",
      `${selectionScript}</head>`
    );
  } else {
    // If no head tag, add it after the opening body tag
    processedHtml = processedHtml.replace("<body>", `<body>${selectionScript}`);
  }

  // Add highlighting for annotations
  if (annotations.length > 0) {
    annotations.forEach((annotation) => {
      if (annotation.data && annotation.data.selected_text) {
        const searchText = annotation.data.selected_text;
        const annotationId = annotation.id;

        // Create the highlighted span
        const highlightedSpan = `<span class="annotation-highlight" data-annotation-id="${annotationId}" style="background-color: #ffeb3b; cursor: pointer; border-radius: 2px; padding: 1px 2px; transition: background-color 0.2s ease;" onclick="window.parent.postMessage({type: 'show-annotation', annotationId: '${annotationId}'}, '*')">${searchText}</span>`;

        // Replace the text in the HTML
        const regex = new RegExp(
          searchText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
          "g"
        );
        const matches = processedHtml.match(regex);
        console.log(
          `Searching for "${searchText}" - found ${matches ? matches.length : 0} matches`
        );

        if (matches && matches.length > 0) {
          processedHtml = processedHtml.replace(regex, highlightedSpan);
          highlightsAdded += matches.length;
        }
      }
    });
  }

  console.log("HTML processing complete, highlights added:", highlightsAdded);
  return { html: processedHtml, highlightsAdded };
};
