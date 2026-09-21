import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface LatexRendererProps {
  text: string;
  className?: string;
}

/**
 * Render văn bản có hỗ trợ LaTeX math:
 * - $...$ hoặc \(...\)  => inline math
 * - $$...$$ hoặc \[...\] => display math (block, căn giữa)
 * - Phần văn bản bình thường giữ nguyên với xuống dòng
 */
export const LatexRenderer: React.FC<LatexRendererProps> = ({ text, className = '' }) => {
  const html = useMemo(() => {
    if (!text) return '';
    try {
      return renderMixed(text);
    } catch {
      return escapeHtml(text);
    }
  }, [text]);

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
      style={{ wordBreak: 'break-word' }}
    />
  );
};

// ─── Core renderer ───────────────────────────────────────────────────────────

function renderMixed(input: string): string {
  // Tokenize: tách chuỗi thành mảng token theo thứ tự ưu tiên
  const tokens: Array<{ type: 'display' | 'inline' | 'text'; content: string }> = [];
  let i = 0;

  while (i < input.length) {
    // 1. $$...$$ — display block (phải check trước $)
    if (input.startsWith('$$', i)) {
      const end = input.indexOf('$$', i + 2);
      if (end !== -1) {
        tokens.push({ type: 'display', content: input.slice(i + 2, end) });
        i = end + 2;
        continue;
      }
    }

    // 2. \[...\] — display block
    if (input.startsWith('\\[', i)) {
      const end = input.indexOf('\\]', i + 2);
      if (end !== -1) {
        tokens.push({ type: 'display', content: input.slice(i + 2, end) });
        i = end + 2;
        continue;
      }
    }

    // 3. \(...\) — inline
    if (input.startsWith('\\(', i)) {
      const end = input.indexOf('\\)', i + 2);
      if (end !== -1) {
        tokens.push({ type: 'inline', content: input.slice(i + 2, end) });
        i = end + 2;
        continue;
      }
    }

    // 4. $...$ — inline (not $$)
    if (input[i] === '$' && !input.startsWith('$$', i)) {
      const end = findClosingDollar(input, i + 1);
      if (end !== -1) {
        tokens.push({ type: 'inline', content: input.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }

    // 5. Plain text — gom liên tiếp
    const last = tokens[tokens.length - 1];
    if (last && last.type === 'text') {
      last.content += input[i];
    } else {
      tokens.push({ type: 'text', content: input[i] });
    }
    i++;
  }

  // Render từng token thành HTML
  return tokens.map(token => {
    if (token.type === 'text') {
      return escapeHtml(token.content).replace(/\n/g, '<br/>');
    }
    try {
      return katex.renderToString(token.content.trim(), {
        displayMode: token.type === 'display',
        throwOnError: false,
        output: 'html',
        trust: false,
      });
    } catch {
      // fallback: hiển thị nguyên bản nếu lỗi parse
      const raw = token.type === 'display'
        ? `$$${token.content}$$`
        : `$${token.content}$`;
      return `<code style="color:#e53e3e;font-size:0.85em">${escapeHtml(raw)}</code>`;
    }
  }).join('');
}

/** Tìm dấu $ đóng, bỏ qua \$ (escaped) */
function findClosingDollar(text: string, from: number): number {
  for (let j = from; j < text.length; j++) {
    if (text[j] === '$' && text[j - 1] !== '\\') {
      if (!text.startsWith('$$', j)) return j;
    }
  }
  return -1;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ─── Kiểm tra nhanh: text có chứa LaTeX math không ───────────────────────────
export function containsLatex(text: string): boolean {
  return /\$|\\\(|\\\[/.test(text);
}
