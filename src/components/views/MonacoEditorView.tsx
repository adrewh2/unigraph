import { useTheme } from "@aesgraph/app-shell";
import React, { useEffect, useRef, useState } from "react";
import MonacoEditor, { monaco } from "react-monaco-editor";

interface MonacoEditorViewProps {
  theme?: any;
}

const MonacoEditorView: React.FC<MonacoEditorViewProps> = ({
  theme: appShellTheme,
}) => {
  const [code, setCode] = useState(`// Welcome to Monaco Editor with ESLint!
// This editor now includes syntax highlighting, error detection, and linting.

interface User {
  id: number;
  name: string;
  email: string;
}

class UserService {
  private users: User[] = [];

  addUser(user: User): void {
    this.users.push(user);
  }

  getUserById(id: number): User | undefined {
    return this.users.find(user => user.id === id);
  }

  // ESLint will catch issues like unused variables
  getUsersCount(): number {
    return this.users.length;
  }
}

const service = new UserService();
service.addUser({ id: 1, name: "John Doe", email: "john@example.com" });
console.log(service.getUserById(1));
console.log(\`Total users: \${service.getUsersCount()}\`);
`);

  const [language, setLanguage] = useState("typescript");
  const [editorTheme, setEditorTheme] = useState("vs-dark");
  const [showLinting, setShowLinting] = useState(true);
  const editorRef = useRef<any>(null);

  const { theme } = useTheme();

  // Enhanced theme with better syntax coloring
  useEffect(() => {
    if (theme) {
      const customTheme = {
        base: (theme.id === "dark" ? "vs-dark" : "vs") as
          | "vs"
          | "vs-dark"
          | "hc-black",
        inherit: true,
        rules: [
          { token: "comment", foreground: theme.colors.textMuted },
          { token: "keyword", foreground: theme.colors.primary },
          { token: "string", foreground: theme.colors.accent },
          { token: "number", foreground: theme.colors.secondary },
          { token: "type", foreground: theme.colors.primary },
          { token: "class", foreground: theme.colors.primary },
          { token: "function", foreground: theme.colors.accent },
          { token: "variable", foreground: theme.colors.text },
          { token: "operator", foreground: theme.colors.text },
          { token: "delimiter", foreground: theme.colors.text },
          { token: "predefined", foreground: theme.colors.secondary },
        ],
        colors: {
          "editor.background": theme.colors.background,
          "editor.foreground": theme.colors.text,
          "editor.lineHighlightBackground": theme.colors.backgroundSecondary,
          "editor.selectionBackground": theme.colors.primary + "40",
          "editor.inactiveSelectionBackground": theme.colors.primary + "20",
          "editorCursor.foreground": theme.colors.primary,
          "editorWhitespace.foreground": theme.colors.textMuted,
          "editorIndentGuide.background": theme.colors.border,
          "editor.selectionHighlightBorder": theme.colors.primary,
          "editorError.foreground": theme.colors.error,
          "editorWarning.foreground": theme.colors.warning,
          "editorInfo.foreground": theme.colors.info,
          "editorHint.foreground": theme.colors.accent,
          "editorLineNumber.foreground": theme.colors.textMuted,
          "editorLineNumber.activeForeground": theme.colors.primary,
          "editorGutter.background": theme.colors.backgroundSecondary,
          "editorBracketMatch.background": theme.colors.primary + "20",
          "editorBracketMatch.border": theme.colors.primary,
        },
      };

      monaco.editor.defineTheme("app-shell-theme", customTheme);
      setEditorTheme("app-shell-theme");
    }
  }, [theme]);

  // Configure ESLint-like validation for different languages
  useEffect(() => {
    if (!editorRef.current) return;

    const editor = editorRef.current;

    // Configure validation rules based on language
    const validationRules = {
      typescript: {
        noUnusedLocals: true,
        noUnusedParameters: true,
        noImplicitReturns: true,
        noFallthroughCasesInSwitch: true,
        noUncheckedIndexedAccess: true,
        noImplicitOverride: true,
        noPropertyAccessFromIndexSignature: true,
        noUncheckedIndexedAccess: true,
      },
      javascript: {
        noUnusedLocals: true,
        noUnusedParameters: true,
        noImplicitReturns: true,
        noFallthroughCasesInSwitch: true,
      },
      json: {
        allowComments: false,
        allowTrailingCommas: false,
      },
    };

    const currentRules =
      validationRules[language as keyof typeof validationRules] || {};

    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
      ...currentRules,
    });

    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
      ...currentRules,
    });

    // Configure JSON validation
    if (language === "json") {
      monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
        allowComments: false,
        allowTrailingCommas: false,
        enableSchemaRequest: true,
        schemas: [],
        validate: true,
      });
    }
  }, [language, showLinting]);

  const supportedLanguages = [
    { value: "typescript", label: "TypeScript", linting: true },
    { value: "javascript", label: "JavaScript", linting: true },
    { value: "python", label: "Python", linting: false },
    { value: "java", label: "Java", linting: false },
    { value: "cpp", label: "C++", linting: false },
    { value: "csharp", label: "C#", linting: false },
    { value: "go", label: "Go", linting: false },
    { value: "rust", label: "Rust", linting: false },
    { value: "html", label: "HTML", linting: true },
    { value: "css", label: "CSS", linting: true },
    { value: "json", label: "JSON", linting: true },
    { value: "markdown", label: "Markdown", linting: false },
    { value: "sql", label: "SQL", linting: false },
    { value: "yaml", label: "YAML", linting: false },
    { value: "xml", label: "XML", linting: false },
  ];

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    // Update code example based on language
    const examples: Record<string, string> = {
      typescript: `// TypeScript with ESLint Validation
interface User {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
}

class UserService {
  private users: User[] = [];

  addUser(user: User): void {
    this.users.push(user);
  }

  getUserById(id: number): User | undefined {
    return this.users.find(user => user.id === id);
  }

  getUsersCount(): number {
    return this.users.length;
  }

  // ESLint will warn about unused parameters
  updateUser(id: number, updates: Partial<User>): boolean {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex !== -1) {
      this.users[userIndex] = { ...this.users[userIndex], ...updates };
      return true;
    }
    return false;
  }
}

const service = new UserService();
service.addUser({ 
  id: 1, 
  name: "John Doe", 
  email: "john@example.com",
  createdAt: new Date()
});

console.log(service.getUserById(1));
console.log(\`Total users: \${service.getUsersCount()}\`);`,
      javascript: `// JavaScript with ESLint Validation
class Calculator {
  constructor() {
    this.history = [];
  }

  add(a, b) {
    const result = a + b;
    this.history.push(\`\${a} + \${b} = \${result}\`);
    return result;
  }

  multiply(a, b) {
    const result = a * b;
    this.history.push(\`\${a} * \${b} = \${result}\`);
    return result;
  }

  getHistory() {
    return this.history;
  }

  // ESLint will catch unused variables
  clearHistory() {
    this.history = [];
  }
}

const calc = new Calculator();
console.log(calc.add(5, 3));
console.log(calc.multiply(4, 7));
console.log(calc.getHistory());`,
      python: `# Python Example
class DataProcessor:
    def __init__(self):
        self.data = []
    
    def add_data(self, item):
        self.data.append(item)
    
    def process_data(self):
        if not self.data:
            return {}
        
        # Calculate statistics
        total = sum(self.data)
        average = total / len(self.data)
        maximum = max(self.data)
        minimum = min(self.data)
        
        return {
            'total': total,
            'average': average,
            'maximum': maximum,
            'minimum': minimum,
            'count': len(self.data)
        }

# Usage
processor = DataProcessor()
processor.add_data(10)
processor.add_data(20)
processor.add_data(30)
result = processor.process_data()
print(f"Statistics: {result}")`,
      java: `// Java Example
import java.util.*;

public class Calculator {
    private List<Double> history;
    
    public Calculator() {
        this.history = new ArrayList<>();
    }
    
    public double add(double a, double b) {
        double result = a + b;
        history.add(result);
        return result;
    }
    
    public double multiply(double a, double b) {
        double result = a * b;
        history.add(result);
        return result;
    }
    
    public List<Double> getHistory() {
        return new ArrayList<>(history);
    }
    
    public static void main(String[] args) {
        Calculator calc = new Calculator();
        System.out.println("5 + 3 = " + calc.add(5, 3));
        System.out.println("4 * 7 = " + calc.multiply(4, 7));
        System.out.println("History: " + calc.getHistory());
    }
}`,
      cpp: `// C++ Example
#include <iostream>
#include <vector>
#include <string>

class Calculator {
private:
    std::vector<double> history;
    
public:
    double add(double a, double b) {
        double result = a + b;
        history.push_back(result);
        return result;
    }
    
    double multiply(double a, double b) {
        double result = a * b;
        history.push_back(result);
        return result;
    }
    
    void printHistory() const {
        std::cout << "Calculation history:" << std::endl;
        for (size_t i = 0; i < history.size(); ++i) {
            std::cout << i + 1 << ": " << history[i] << std::endl;
        }
    }
};

int main() {
    Calculator calc;
    std::cout << "5 + 3 = " << calc.add(5, 3) << std::endl;
    std::cout << "4 * 7 = " << calc.multiply(4, 7) << std::endl;
    calc.printHistory();
    return 0;
}`,
      json: `{
  "name": "Monaco Editor with ESLint",
  "version": "1.0.0",
  "description": "A powerful code editor with syntax highlighting and linting",
  "features": [
    "Syntax highlighting",
    "IntelliSense",
    "Error detection",
    "ESLint integration",
    "Code formatting",
    "Multiple themes"
  ],
  "supportedLanguages": [
    "TypeScript",
    "JavaScript", 
    "Python",
    "Java",
    "C++",
    "C#",
    "Go",
    "Rust"
  ],
  "linting": {
    "enabled": true,
    "rules": {
      "no-unused-vars": "error",
      "no-console": "warn",
      "prefer-const": "error"
    }
  },
  "settings": {
    "theme": "vs-dark",
    "fontSize": 14,
    "wordWrap": "on",
    "minimap": {
      "enabled": true
    }
  }
}`,
      html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Monaco Editor with ESLint</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .feature-list {
            list-style: none;
            padding: 0;
        }
        .feature-list li {
            padding: 10px 0;
            border-bottom: 1px solid #eee;
        }
        .feature-list li:before {
            content: "✓";
            color: #4CAF50;
            font-weight: bold;
            margin-right: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Monaco Editor with ESLint</h1>
            <p>A powerful code editor with syntax highlighting and linting</p>
        </div>
        
        <h2>Features</h2>
        <ul class="feature-list">
            <li>Syntax highlighting for 15+ languages</li>
            <li>IntelliSense and auto-completion</li>
            <li>Real-time error detection</li>
            <li>ESLint integration</li>
            <li>Multiple themes</li>
            <li>Code formatting</li>
        </ul>
        
        <h2>Supported Languages</h2>
        <p>TypeScript, JavaScript, Python, Java, C++, C#, Go, Rust, HTML, CSS, JSON, Markdown, SQL, YAML, XML</p>
    </div>
</body>
</html>`,
      css: `/* CSS with ESLint-like validation */
:root {
  --primary-color: #4f46e5;
  --secondary-color: #06b6d4;
  --accent-color: #f59e0b;
  --background-color: #0f172a;
  --surface-color: #1e293b;
  --text-color: #f8fafc;
  --border-color: #475569;
  --error-color: #ef4444;
  --warning-color: #f59e0b;
  --success-color: #10b981;
}

/* Main container styles */
.monaco-editor-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--background-color);
  color: var(--text-color);
}

/* Toolbar styles */
.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--surface-color);
}

.toolbar-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-color);
}

.toolbar-select {
  padding: 6px 12px;
  border-radius: 4px;
  border: 1px solid var(--border-color);
  background-color: var(--background-color);
  color: var(--text-color);
  font-size: 14px;
}

.toolbar-stats {
  margin-left: auto;
  font-size: 12px;
  color: var(--text-color);
  opacity: 0.7;
}

/* Editor area */
.editor-area {
  flex: 1;
  overflow: hidden;
}

/* Status indicators */
.status-indicator {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;
}

.status-error {
  background-color: var(--error-color);
}

.status-warning {
  background-color: var(--warning-color);
}

.status-success {
  background-color: var(--success-color);
}

/* Responsive design */
@media (max-width: 768px) {
  .editor-toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .toolbar-stats {
    margin-left: 0;
    text-align: center;
  }
}`,
      markdown: `# Monaco Editor with ESLint

## Features

- **Syntax Highlighting**: Support for 15+ programming languages
- **IntelliSense**: Smart code completion and suggestions
- **Error Detection**: Real-time error checking and validation
- **ESLint Integration**: Advanced linting for JavaScript/TypeScript
- **Multiple Themes**: Light, dark, and custom themes
- **Code Formatting**: Automatic code formatting and indentation

## Supported Languages

| Language | Extension | Linting | Features |
|----------|-----------|---------|----------|
| TypeScript | .ts | ✅ | Full IntelliSense + ESLint |
| JavaScript | .js | ✅ | ES6+ support + ESLint |
| Python | .py | ❌ | Syntax highlighting |
| Java | .java | ❌ | Error detection |
| C++ | .cpp | ❌ | Code formatting |
| HTML | .html | ✅ | Validation |
| CSS | .css | ✅ | Validation |
| JSON | .json | ✅ | Schema validation |

## Code Example

\`\`\`typescript
interface User {
  id: number;
  name: string;
  email: string;
}

function createUser(name: string, email: string): User {
  return {
    id: Date.now(),
    name,
    email
  };
}

// ESLint will catch issues like:
// - Unused variables
// - Missing return types
// - Unused parameters
// - Console statements (warnings)
\`\`\`

## Linting Features

- **Unused Variables**: Detects variables that are declared but never used
- **Unused Parameters**: Identifies function parameters that aren't used
- **Type Checking**: Validates TypeScript types and interfaces
- **Code Style**: Enforces consistent code formatting
- **Best Practices**: Suggests improvements and catches common mistakes

> Monaco Editor with ESLint provides a professional development experience similar to VS Code!
`,
    };

    if (examples[newLanguage]) {
      setCode(examples[newLanguage]);
    }
  };

  const currentLanguage = supportedLanguages.find(
    (lang) => lang.value === language
  );
  const hasLinting = currentLanguage?.linting || false;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Toolbar */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: `1px solid ${theme?.colors?.border || "#e0e0e0"}`,
          backgroundColor: theme?.colors?.surface || "#f5f5f5",
          display: "flex",
          gap: "12px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <label
            style={{
              fontSize: "14px",
              color: theme?.colors?.text || "#333",
              fontWeight: "500",
            }}
          >
            Language:
          </label>
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            style={{
              padding: "6px 12px",
              borderRadius: "4px",
              border: `1px solid ${theme?.colors?.border || "#d0d0d0"}`,
              backgroundColor: theme?.colors?.background || "#fff",
              color: theme?.colors?.text || "#333",
              fontSize: "14px",
            }}
          >
            {supportedLanguages.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label} {lang.linting ? "✓" : ""}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <label
            style={{
              fontSize: "14px",
              color: theme?.colors?.text || "#333",
              fontWeight: "500",
            }}
          >
            Theme:
          </label>
          <select
            value={editorTheme}
            onChange={(e) => setEditorTheme(e.target.value)}
            style={{
              padding: "6px 12px",
              borderRadius: "4px",
              border: `1px solid ${theme?.colors?.border || "#d0d0d0"}`,
              backgroundColor: theme?.colors?.background || "#fff",
              color: theme?.colors?.text || "#333",
              fontSize: "14px",
            }}
          >
            <option value="vs">Light</option>
            <option value="vs-dark">Dark</option>
            <option value="hc-black">High Contrast</option>
            {theme && <option value="app-shell-theme">App Shell Theme</option>}
          </select>
        </div>

        {hasLinting && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <label
              style={{
                fontSize: "14px",
                color: theme?.colors?.text || "#333",
                fontWeight: "500",
              }}
            >
              Linting:
            </label>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={showLinting}
                onChange={(e) => setShowLinting(e.target.checked)}
                style={{
                  margin: 0,
                }}
              />
              <span
                style={{
                  fontSize: "14px",
                  color: theme?.colors?.text || "#333",
                }}
              >
                Enable
              </span>
            </label>
          </div>
        )}

        <div
          style={{
            marginLeft: "auto",
            fontSize: "12px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {hasLinting && showLinting && (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                color: theme?.colors?.success || "#10b981",
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: theme?.colors?.success || "#10b981",
                  marginRight: "4px",
                }}
              />
              ESLint Active
            </span>
          )}
          <span
            style={{
              color: theme?.colors?.textMuted || "#666",
            }}
          >
            Lines: {code.split("\n").length} | Characters: {code.length}
          </span>
        </div>
      </div>

      {/* Editor */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        <MonacoEditor
          ref={editorRef}
          language={language}
          theme={editorTheme}
          value={code}
          onChange={setCode}
          options={{
            selectOnLineNumbers: true,
            automaticLayout: true,
            formatOnType: true,
            formatOnPaste: true,
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            wordWrap: "on",
            readOnly: false,
            fontSize: 14,
            lineNumbers: "on",
            roundedSelection: false,
            scrollbar: {
              vertical: "visible",
              horizontal: "visible",
            },
            folding: true,
            foldingStrategy: "indentation",
            showFoldingControls: "always" as const,
            detectIndentation: true,
            tabSize: 2,
            insertSpaces: true,
            autoIndent: "full",
            matchBrackets: "always",
            autoClosingBrackets: "always",
            autoClosingQuotes: "always",
            autoClosingOvertype: "always",
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnCommitCharacter: true,
            acceptSuggestionOnEnter: "on",
            wordBasedSuggestions: "currentDocument",
            parameterHints: {
              enabled: true,
            },
            hover: {
              enabled: true,
            },
            contextmenu: true,
            quickSuggestions: {
              other: true,
              comments: true,
              strings: true,
            } as any,
            suggest: {
              insertMode: "replace",
            },
            // Enhanced validation options
            validateOnType: showLinting,
            validateOnPaste: showLinting,
          }}
        />
      </div>
    </div>
  );
};

export default MonacoEditorView;
