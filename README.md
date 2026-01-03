---
title: Markdown Examples
date: 2024-01-20
tags: [markdown, examples, reference]
excerpt: A reference guide showing all supported Markdown features.
---

This post demonstrates all the Markdown features supported by the blog system.

## Headings

You can use different heading levels to structure your content:

# H1 Heading
## H2 Heading
### H3 Heading

## Text Formatting

**Bold text** and *italic text* work as expected. You can also use ***bold and italic*** together.

## Lists

### Unordered Lists
- Item one
- Item two
  - Nested item
  - Another nested item
- Item three

### Ordered Lists
1. First item
2. Second item
3. Third item

## Code

Inline code like `const example = true;` works seamlessly.

Code blocks with syntax highlighting:

```javascript
function greet(name) {
  return `Hello, ${name}!`;
}

console.log(greet('World'));
```

```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
```

## Links

Here's a [link to Google](https://google.com) and a [relative link](/blog).

## Images

Images can be embedded like this:

![Alt text](/images/icon.ico)

## Blockquotes

> This is a blockquote. It's perfect for highlighting important quotes or excerpts from other sources.

> You can also have
> multi-line blockquotes
> like this one.

## Horizontal Rules

You can separate sections with horizontal rules:

---

## Tables

| Feature | Status | Notes |
|---------|--------|-------|
| Markdown | ✅ | Fully supported |
| Frontmatter | ✅ | Optional metadata |
| Images | ✅ | Native support |
| Code blocks | ✅ | Syntax highlighting |

---

That's it! The blog system supports all standard Markdown features, making it easy to write rich, formatted content.

