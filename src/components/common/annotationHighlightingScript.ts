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
      selected_text_length: a.data.selected_text?.length || 0,
    }))
  );

  // Log the first few characters of each annotation text for debugging
  annotations.forEach((annotation, index) => {
    if (annotation.data.selected_text) {
      console.log(
        `Annotation ${index + 1} text preview: "${annotation.data.selected_text.substring(0, 100)}..."`
      );
    }
  });

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

        // Normalize the search text and HTML content for better matching
        const normalizedSearchText = searchText
          .replace(/\s+/g, " ") // Replace multiple whitespace with single space
          .trim();

        // Create a normalized version of the HTML for searching
        const normalizedHtml = processedHtml
          .replace(/<[^>]*>/g, "") // Remove HTML tags temporarily
          .replace(/\s+/g, " ") // Replace multiple whitespace with single space
          .trim();

        console.log(`Searching for normalized text: "${normalizedSearchText}"`);
        console.log(
          `Normalized HTML preview: "${normalizedHtml.substring(0, 200)}..."`
        );

        // Try exact match first
        let regex = new RegExp(
          normalizedSearchText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
          "g"
        );
        let matches = processedHtml.match(regex);

        // If no exact match, try with flexible whitespace
        if (!matches || matches.length === 0) {
          const flexibleSearchText = normalizedSearchText
            .replace(/[.*+?^${}()|[\]\\]/g, "\\$&") // Escape regex special characters first
            .replace(/\s+/g, "\\s+"); // Then replace whitespace with flexible pattern
          regex = new RegExp(flexibleSearchText, "g");
          matches = processedHtml.match(regex);
        }

        console.log(
          `Found ${matches ? matches.length : 0} matches for "${searchText}"`
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
