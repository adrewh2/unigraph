---
title: Document Editor
order: 7
---

Unigraph has built-in Markdown and Rich-text editing connected to a database backend.
Users can manage notes and file trees within their profile, and integrate their work into Unigraph's application ecosystem.

Attention: user login is required to use the document editor, and changes are saved to the server automatically.
Personal or sensitive information should not be written into Unigraph at this time.

Access the Document Editor by going to the App Shell, and opening the view called "Document Editor". This will automatically load the files and folders saved to your current project. Click on files in the tree to open their editors. Files and folders can be created, renamed, deleted, and moved.

## Editing Features

- Rich text editor: .txt documents will be opened in a custom Lexical Editor.
- Markdown support: .md documents will be opened in a Monaco Code Editor, and perviews will be rendered using react-markdown library.

## Document Types

- Text documents will be opened in a custom Lexical Editor
- Markdown documents will be opened in a Monaco Editor. Markdown Preview can be toggled.
