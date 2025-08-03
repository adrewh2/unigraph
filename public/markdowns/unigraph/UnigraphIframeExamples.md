---
title: "UnigraphIframe Component Examples"
tags: ["documentation", "components", "iframe", "embedding", "examples"]
---

# UnigraphIframe Component Examples

The UnigraphIframe component is designed to embed HTML elements into markdown files, specifically for interactive diagrams and documentation structures. This guide provides comprehensive examples of how to use the component effectively.

## Basic Usage

The simplest way to use the UnigraphIframe component:

```tsx
import { UnigraphIframe } from "../components/common";

<UnigraphIframe
  src="/docs-structure.html"
  title="Documentation Structure"
  width="100%"
  height={500}
/>;
```

## Interactive Documentation Structure

Embed an interactive diagram of Unigraph's documentation structure:

```tsx
<UnigraphIframe
  src="/docs-structure.html"
  title="Unigraph Documentation Structure"
  width="100%"
  height={500}
  showControls={true}
  resizable={true}
  onLoad={() => console.log("Documentation loaded")}
  onError={(error) => console.error("Failed to load:", error)}
  loadingMessage="Loading documentation structure..."
  allowFullscreen={true}
/>
```

## Interactive Diagram with Custom Styling

Create a custom-styled interactive diagram:

```tsx
<UnigraphIframe
  src="/interactive-diagram.html"
  title="Interactive Diagram"
  width={800}
  height={400}
  showControls={true}
  resizable={false}
  style={{
    border: "2px solid #1976d2",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(25, 118, 210, 0.2)",
  }}
  iframeProps={{
    sandbox: "allow-scripts allow-same-origin",
    referrerPolicy: "no-referrer",
  }}
/>
```

## Minimal Configuration

For simple content embedding with minimal controls:

```tsx
<UnigraphIframe
  src="/simple-content.html"
  title="Simple Content"
  width="100%"
  height={300}
  showControls={false}
  showLoading={false}
/>
```

## Custom Styled Example

Advanced styling with custom colors and effects:

```tsx
<UnigraphIframe
  src="/custom-styled-content.html"
  title="Custom Styled Content"
  width="100%"
  height={400}
  showControls={true}
  className="custom-iframe"
  style={{
    border: "3px solid #ff6b6b",
    borderRadius: "16px",
    boxShadow: "0 8px 32px rgba(255, 107, 107, 0.3)",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  }}
  loadingMessage="Loading custom styled content..."
/>
```

## Security-Focused Configuration

For embedding external content with security considerations:

```tsx
<UnigraphIframe
  src="https://external-content.com"
  title="External Content"
  width="100%"
  height={400}
  showControls={true}
  iframeProps={{
    sandbox: "allow-scripts allow-same-origin allow-forms",
    referrerPolicy: "no-referrer",
    loading: "lazy",
  }}
  onLoad={() => console.log("External content loaded safely")}
  onError={(error) => console.error("External content failed to load:", error)}
/>
```

## Event Handling Examples

Handle various iframe events:

```tsx
const handleIframeLoad = () => {
  console.log("Iframe content loaded successfully");
  // You can perform additional actions here
  // such as analytics tracking, content validation, etc.
};

const handleIframeError = (error: Event) => {
  console.error("Iframe failed to load:", error);
  // Handle error gracefully
  // Maybe show a fallback or retry mechanism
};

<UnigraphIframe
  src="/example-content.html"
  title="Event Handling Example"
  width="100%"
  height={400}
  onLoad={handleIframeLoad}
  onError={handleIframeError}
  showControls={true}
/>;
```

## Responsive Design Example

Create a responsive iframe that adapts to different screen sizes:

```tsx
<UnigraphIframe
  src="/responsive-content.html"
  title="Responsive Content"
  width="100%"
  height={window.innerWidth < 768 ? 300 : 500}
  showControls={true}
  resizable={true}
  style={{
    minHeight: "300px",
    maxHeight: "600px",
  }}
/>
```

## Dark Mode Compatible Example

Ensure your iframe works well in both light and dark modes:

```tsx
<UnigraphIframe
  src="/dark-mode-compatible.html"
  title="Dark Mode Compatible Content"
  width="100%"
  height={400}
  showControls={true}
  style={{
    border: "1px solid var(--border-color, #e0e0e0)",
    backgroundColor: "var(--bg-color, #fafafa)",
  }}
  className="dark-mode-compatible"
/>
```

## Fullscreen Interactive Experience

Create an immersive fullscreen experience:

```tsx
<UnigraphIframe
  src="/immersive-experience.html"
  title="Immersive Interactive Experience"
  width="100%"
  height={600}
  showControls={true}
  allowFullscreen={true}
  resizable={true}
  style={{
    border: "none",
    borderRadius: "0",
    boxShadow: "0 0 0 rgba(0, 0, 0, 0)",
  }}
  loadingMessage="Preparing immersive experience..."
/>
```

## Component Props Reference

Here's a complete reference of all available props:

| Prop              | Type                                            | Default                            | Description                            |
| ----------------- | ----------------------------------------------- | ---------------------------------- | -------------------------------------- |
| `src`             | `string`                                        | -                                  | The URL to embed in the iframe         |
| `title`           | `string`                                        | -                                  | Title for accessibility and display    |
| `width`           | `string \| number`                              | `"100%"`                           | Width of the iframe                    |
| `height`          | `string \| number`                              | `"400px"`                          | Height of the iframe                   |
| `resizable`       | `boolean`                                       | `false`                            | Whether the iframe should be resizable |
| `showControls`    | `boolean`                                       | `true`                             | Whether to show control buttons        |
| `className`       | `string`                                        | `""`                               | Custom CSS class name                  |
| `style`           | `React.CSSProperties`                           | `{}`                               | Custom styles                          |
| `onLoad`          | `() => void`                                    | -                                  | Callback when iframe loads             |
| `onError`         | `(error: Event) => void`                        | -                                  | Callback when iframe fails to load     |
| `showLoading`     | `boolean`                                       | `true`                             | Whether to show loading state          |
| `loadingMessage`  | `string`                                        | `"Loading interactive content..."` | Custom loading message                 |
| `allowFullscreen` | `boolean`                                       | `true`                             | Whether to allow fullscreen mode       |
| `iframeProps`     | `React.IframeHTMLAttributes<HTMLIFrameElement>` | `{}`                               | Additional iframe attributes           |

## Best Practices

### 1. Always Provide a Title

```tsx
// Good
<UnigraphIframe src="/content.html" title="Descriptive Title" />

// Avoid
<UnigraphIframe src="/content.html" />
```

### 2. Handle Loading States

```tsx
<UnigraphIframe
  src="/content.html"
  title="Content"
  showLoading={true}
  loadingMessage="Loading your interactive content..."
  onLoad={() => console.log("Content ready")}
  onError={(error) => console.error("Failed to load:", error)}
/>
```

### 3. Use Appropriate Security Settings

```tsx
<UnigraphIframe
  src="https://external-site.com"
  title="External Content"
  iframeProps={{
    sandbox: "allow-scripts allow-same-origin",
    referrerPolicy: "no-referrer",
  }}
/>
```

### 4. Make Content Responsive

```tsx
<UnigraphIframe
  src="/content.html"
  title="Responsive Content"
  width="100%"
  height={window.innerWidth < 768 ? 300 : 500}
  style={{ minHeight: "300px" }}
/>
```

## Common Use Cases

### Live Unigraph App Embedding

Here's an example of embedding the actual Unigraph application:

```tsx
<UnigraphIframe
  src="http://localhost:3001"
  title="Live Unigraph Application"
  width="100%"
  height={700}
  showControls={true}
  resizable={true}
  allowFullscreen={true}
  loadingMessage="Loading Unigraph application..."
  style={{
    border: "2px solid #e0e0e0",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  }}
  iframeProps={{
    sandbox: "allow-scripts allow-same-origin allow-forms allow-popups",
    referrerPolicy: "no-referrer",
  }}
/>
```

**Live Demo:**

<UnigraphIframe
src="http://localhost:3001"
title="Live Unigraph Application"
width="100%"
height={700}
showControls={true}
resizable={true}
allowFullscreen={true}
loadingMessage="Loading Unigraph application..."
style={{
    border: "2px solid #e0e0e0",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  }}
iframeProps={{
    sandbox: "allow-scripts allow-same-origin allow-forms allow-popups",
    referrerPolicy: "no-referrer",
  }}
/>

### Documentation Structure Visualization

```tsx
<UnigraphIframe
  src="/docs-structure.html"
  title="Unigraph Documentation Structure"
  width="100%"
  height={600}
  showControls={true}
  resizable={true}
  allowFullscreen={true}
  loadingMessage="Loading documentation structure..."
/>
```

### Interactive Diagrams

```tsx
<UnigraphIframe
  src="/interactive-diagram.html"
  title="Interactive System Diagram"
  width="100%"
  height={500}
  showControls={true}
  resizable={true}
  style={{
    border: "2px solid #1976d2",
    borderRadius: "8px",
  }}
/>
```

### Embedded Applications

```tsx
<UnigraphIframe
  src="/embedded-app.html"
  title="Embedded Application"
  width="100%"
  height={700}
  showControls={true}
  allowFullscreen={true}
  iframeProps={{
    sandbox: "allow-scripts allow-same-origin allow-forms",
  }}
/>
```

## Troubleshooting

### Content Not Loading

- Check the `src` URL is correct and accessible
- Verify CORS settings if loading external content
- Check browser console for error messages

### Controls Not Appearing

- Ensure `showControls={true}` is set
- Check if the component is properly imported
- Verify CSS is loaded correctly

### Fullscreen Not Working

- Ensure `allowFullscreen={true}` is set
- Check browser support for Fullscreen API
- Verify the iframe content allows fullscreen

### Styling Issues

- Use the `style` prop for custom styling
- Check CSS specificity if styles aren't applying
- Ensure responsive design considerations

## Integration with Markdown

When using this component in markdown files, you can import and use it like any other React component:

```tsx
import { UnigraphIframe } from "../components/common";

// Your markdown content here...

<UnigraphIframe
  src="/your-content.html"
  title="Your Content"
  width="100%"
  height={400}
/>;

// More markdown content...
```

This component provides a powerful and flexible way to embed interactive content into your documentation while maintaining a professional appearance and excellent user experience.
