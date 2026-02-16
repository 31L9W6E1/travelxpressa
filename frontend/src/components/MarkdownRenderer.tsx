import type { ReactNode } from "react";
import { normalizeImageUrl } from "@/api/upload";
import { handleImageFallback } from "@/lib/imageFallback";
import { cn } from "@/lib/utils";

type Block =
  | { type: "heading"; level: 1 | 2 | 3 | 4 | 5 | 6; text: string }
  | { type: "image"; alt: string; url: string }
  | { type: "hr" }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "quote"; lines: string[] }
  | { type: "code"; language?: string; code: string }
  | { type: "paragraph"; lines: string[] };

const isSafeUrl = (url: string): boolean => {
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("/") || trimmed.startsWith("#")) return true;
  return /^https?:\/\//i.test(trimmed) || /^mailto:/i.test(trimmed) || /^tel:/i.test(trimmed);
};

const extractMarkdownUrl = (rawTarget: string): string => {
  if (!rawTarget) return "";

  let value = rawTarget.trim();

  // Remove optional markdown title: (url "title")
  const titleSeparatorIndex = value.search(/\s+(?=["'(])/);
  if (titleSeparatorIndex > 0) {
    value = value.slice(0, titleSeparatorIndex).trim();
  }

  if (value.startsWith("<") && value.endsWith(">")) {
    value = value.slice(1, -1).trim();
  }

  value = value.replace(/^['"]|['"]$/g, "");
  return value.trim();
};

const parseInline = (text: string): ReactNode[] => {
  // Supports:
  // - **bold**
  // - [label](url)
  // - ![alt](url) (inline image)
  const pattern = /(!\[[^\]]*]\([^)]+\))|(\*\*[^*]+\*\*)|(\[[^\]]+]\([^)]+\))/g;
  const out: ReactNode[] = [];

  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      out.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith("**") && token.endsWith("**")) {
      const boldText = token.slice(2, -2);
      out.push(<strong key={`b-${match.index}`}>{boldText}</strong>);
    } else if (token.startsWith("![") && token.includes("](") && token.endsWith(")")) {
      const alt = token.slice(2, token.indexOf("]("));
      const rawTarget = token.slice(token.indexOf("](") + 2, -1);
      const url = extractMarkdownUrl(rawTarget);
      const safe = isSafeUrl(url);
      out.push(
        safe ? (
          <img
            key={`img-${match.index}`}
            src={normalizeImageUrl(url)}
            alt={alt}
            loading="lazy"
            decoding="async"
            className="inline-block max-w-full rounded-lg border border-border/60"
            onError={(event) => handleImageFallback(event)}
          />
        ) : (
          token
        ),
      );
    } else if (token.startsWith("[") && token.includes("](") && token.endsWith(")")) {
      const label = token.slice(1, token.indexOf("]("));
      const rawTarget = token.slice(token.indexOf("](") + 2, -1);
      const url = extractMarkdownUrl(rawTarget);
      const safe = isSafeUrl(url);
      out.push(
        safe ? (
          <a
            key={`a-${match.index}`}
            href={url}
            className="text-primary underline underline-offset-4 hover:opacity-90"
            target={url.startsWith("http") ? "_blank" : undefined}
            rel={url.startsWith("http") ? "noreferrer" : undefined}
          >
            {label}
          </a>
        ) : (
          label
        ),
      );
    } else {
      out.push(token);
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    out.push(text.slice(lastIndex));
  }

  return out;
};

const parseBlocks = (content: string): Block[] => {
  const normalized = (content || "")
    .replace(/\r\n/g, "\n")
    // Common authoring mistake: break the image/link URL onto the next line.
    // Convert:
    // ![alt]
    // (url)
    // -> ![alt](url)
    .replace(/!\[([^\]]*)]\s*\n\s*\(([^)\s]+[^)]*)\)/g, "![$1]($2)")
    // Convert:
    // [label]
    // (url)
    // -> [label](url)
    .replace(/\[([^\]]+)]\s*\n\s*\(([^)\s]+[^)]*)\)/g, "[$1]($2)");

  const lines = normalized.split("\n");
  const blocks: Block[] = [];

  let paragraph: string[] = [];
  const flushParagraph = () => {
    const trimmed = paragraph.map((l) => l.trimEnd()).filter((l) => l.trim().length > 0);
    if (trimmed.length) blocks.push({ type: "paragraph", lines: trimmed });
    paragraph = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i] ?? "";
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      continue;
    }

    if (trimmed === "---" || trimmed === "***") {
      flushParagraph();
      blocks.push({ type: "hr" });
      continue;
    }

    // Code block
    if (trimmed.startsWith("```")) {
      flushParagraph();
      const language = trimmed.slice(3).trim() || undefined;
      const codeLines: string[] = [];
      i += 1;
      while (i < lines.length) {
        const l = lines[i] ?? "";
        if (l.trim().startsWith("```")) break;
        codeLines.push(l);
        i += 1;
      }
      blocks.push({ type: "code", language, code: codeLines.join("\n") });
      continue;
    }

    // Heading
    const headingMatch = trimmed.match(/^(#{1,6})\s*(.*)$/);
    if (headingMatch) {
      flushParagraph();
      const level = headingMatch[1].length as 1 | 2 | 3 | 4 | 5 | 6;
      blocks.push({ type: "heading", level, text: headingMatch[2] || "" });
      continue;
    }

    // Block image (single line)
    const imageMatch = trimmed.match(/^!\[([^\]]*)]\((.+)\)$/);
    if (imageMatch) {
      flushParagraph();
      blocks.push({
        type: "image",
        alt: imageMatch[1] || "",
        url: extractMarkdownUrl(imageMatch[2] || ""),
      });
      continue;
    }

    // Unordered list
    const ulMatch = trimmed.match(/^[-*•]\s+(.*)$/);
    if (ulMatch) {
      flushParagraph();
      const items: string[] = [ulMatch[1] || ""];
      while (i + 1 < lines.length) {
        const next = (lines[i + 1] ?? "").trim();
        const nextMatch = next.match(/^[-*•]\s+(.*)$/);
        if (!nextMatch) break;
        items.push(nextMatch[1] || "");
        i += 1;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    // Ordered list
    const olMatch = trimmed.match(/^\d+\.\s+(.*)$/);
    if (olMatch) {
      flushParagraph();
      const items: string[] = [olMatch[1] || ""];
      while (i + 1 < lines.length) {
        const next = (lines[i + 1] ?? "").trim();
        const nextMatch = next.match(/^\d+\.\s+(.*)$/);
        if (!nextMatch) break;
        items.push(nextMatch[1] || "");
        i += 1;
      }
      blocks.push({ type: "ol", items });
      continue;
    }

    // Blockquote
    const quoteMatch = trimmed.match(/^>\s?(.*)$/);
    if (quoteMatch) {
      flushParagraph();
      const qLines: string[] = [quoteMatch[1] || ""];
      while (i + 1 < lines.length) {
        const next = (lines[i + 1] ?? "").trim();
        const nextMatch = next.match(/^>\s?(.*)$/);
        if (!nextMatch) break;
        qLines.push(nextMatch[1] || "");
        i += 1;
      }
      blocks.push({ type: "quote", lines: qLines });
      continue;
    }

    paragraph.push(line);
  }

  flushParagraph();
  return blocks;
};

const headingClass = (level: number): string => {
  switch (level) {
    case 1:
      return "text-2xl md:text-3xl font-bold tracking-tight";
    case 2:
      return "text-xl md:text-2xl font-bold tracking-tight";
    case 3:
      return "text-lg md:text-xl font-semibold tracking-tight";
    case 4:
      return "text-base md:text-lg font-semibold";
    case 5:
      return "text-sm md:text-base font-semibold uppercase tracking-wide text-muted-foreground";
    case 6:
      return "text-sm font-semibold text-muted-foreground";
    default:
      return "text-lg font-semibold";
  }
};

export default function MarkdownRenderer({
  content,
  className,
  fallbackImageUrl,
}: {
  content: string;
  className?: string;
  fallbackImageUrl?: string;
}) {
  const blocks = parseBlocks(content || "");

  return (
    <div className={cn("space-y-4", className)}>
      {blocks.map((block, idx) => {
        switch (block.type) {
          case "heading": {
            const Tag = `h${block.level}` as keyof JSX.IntrinsicElements;
            return (
              <Tag
                key={`h-${idx}`}
                className={cn(headingClass(block.level), "mt-8 first:mt-0")}
              >
                {parseInline(block.text)}
              </Tag>
            );
          }
          case "image": {
            const safe = isSafeUrl(block.url);
            if (!safe) return null;
            return (
              <img
                key={`img-${idx}`}
                src={normalizeImageUrl(block.url)}
                alt={block.alt}
                loading="lazy"
                decoding="async"
                className="w-full rounded-xl border border-border/60"
                onError={(event) => handleImageFallback(event, fallbackImageUrl)}
              />
            );
          }
          case "hr":
            return <hr key={`hr-${idx}`} className="border-border/70" />;
          case "ul":
            return (
              <ul key={`ul-${idx}`} className="list-disc pl-5 space-y-2 text-sm md:text-base">
                {block.items.map((item, itemIdx) => (
                  <li key={`ul-${idx}-${itemIdx}`} className="text-foreground leading-relaxed">
                    {parseInline(item)}
                  </li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={`ol-${idx}`} className="list-decimal pl-5 space-y-2 text-sm md:text-base">
                {block.items.map((item, itemIdx) => (
                  <li key={`ol-${idx}-${itemIdx}`} className="text-foreground leading-relaxed">
                    {parseInline(item)}
                  </li>
                ))}
              </ol>
            );
          case "quote":
            return (
              <blockquote
                key={`q-${idx}`}
                className="border-l-2 border-border pl-4 text-muted-foreground italic"
              >
                {block.lines.map((line, lineIdx) => (
                  <p key={`q-${idx}-${lineIdx}`} className="leading-relaxed">
                    {parseInline(line)}
                  </p>
                ))}
              </blockquote>
            );
          case "code":
            return (
              <pre
                key={`code-${idx}`}
                className="overflow-x-auto rounded-xl border border-border bg-secondary/30 p-4 text-xs md:text-sm"
              >
                <code>{block.code}</code>
              </pre>
            );
          case "paragraph":
            return (
              <p key={`p-${idx}`} className="text-sm md:text-base text-foreground leading-relaxed">
                {block.lines.map((line, lineIdx) => (
                  <span key={`p-${idx}-${lineIdx}`}>
                    {parseInline(line)}
                    {lineIdx < block.lines.length - 1 ? <br /> : null}
                  </span>
                ))}
              </p>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
