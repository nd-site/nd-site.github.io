import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface LatexRendererProps {
  text: string;
  className?: string;
}

export const LatexRenderer: React.FC<LatexRendererProps> = ({ text, className = '' }) => {
  const html = useMemo(() => {
    if (!text) return '';
    try {
      // 1. Process markdown tables if present
      const withTables = processMarkdownTables(text);
      // 2. Process LaTeX math formulas
      return renderMixed(withTables);
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

function processMarkdownTables(input: string): string {
  const lines = input.split('\n');
  const outLines: string[] = [];
  let tableBuffer: string[] = [];
  let inTable = false;

  const flushTable = () => {
    if (tableBuffer.length >= 2) {
      outLines.push(convertTableBufferToHtml(tableBuffer));
    } else {
      outLines.push(...tableBuffer);
    }
    tableBuffer = [];
    inTable = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.length > 2) {
      inTable = true;
      tableBuffer.push(trimmed);
    } else {
      if (inTable) flushTable();
      outLines.push(lines[i]);
    }
  }
  if (inTable) flushTable();

  return outLines.join('\n');
}

function convertTableBufferToHtml(buffer: string[]): string {
  // Check if line 1 is separator |:---|:---|
  let headerRow: string | null = null;
  let bodyRows: string[] = [];

  const isSeparator = (line: string) => /^\|(\s*:?-+:?\s*\|)+$/.test(line);

  if (buffer.length >= 2 && isSeparator(buffer[1])) {
    headerRow = buffer[0];
    bodyRows = buffer.slice(2);
  } else {
    bodyRows = buffer;
  }

  const parseCells = (row: string) => {
    // Strip leading and trailing |
    const trimmed = row.replace(/^\|/, '').replace(/\|$/, '');
    return trimmed.split('|').map((c) => c.trim());
  };

  let html = '<div class="overflow-x-auto my-3 rounded-xl border border-slate-200 shadow-sm"><table class="min-w-full divide-y divide-slate-200 text-xs">';

  if (headerRow) {
    const headers = parseCells(headerRow);
    html += '<thead class="bg-slate-100 font-extrabold text-slate-700"><tr>';
    headers.forEach((h) => {
      html += `<th class="px-3.5 py-2.5 border-r border-slate-200 last:border-r-0">${h}</th>`;
    });
    html += '</tr></thead>';
  }

  html += '<tbody class="divide-y divide-slate-100 bg-white">';
  bodyRows.forEach((r, idx) => {
    const cells = parseCells(r);
    html += `<tr class="${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}">`;
    cells.forEach((c) => {
      html += `<td class="px-3.5 py-2 border-r border-slate-100 last:border-r-0 text-slate-800">${c}</td>`;
    });
    html += '</tr>';
  });
  html += '</tbody></table></div>';

  return html;
}

function renderMixed(input: string): string {
  const tokens: Array<{ type: 'display' | 'inline' | 'text'; content: string }> = [];
  let i = 0;

  while (i < input.length) {
    // 1. $$...$$
    if (input.startsWith('$$', i)) {
      const end = input.indexOf('$$', i + 2);
      if (end !== -1) {
        tokens.push({ type: 'display', content: input.slice(i + 2, end) });
        i = end + 2;
        continue;
      }
    }

    // 2. \[...\]
    if (input.startsWith('\\[', i)) {
      const end = input.indexOf('\\]', i + 2);
      if (end !== -1) {
        tokens.push({ type: 'display', content: input.slice(i + 2, end) });
        i = end + 2;
        continue;
      }
    }

    // 3. \(...\)
    if (input.startsWith('\\(', i)) {
      const end = input.indexOf('\\)', i + 2);
      if (end !== -1) {
        tokens.push({ type: 'inline', content: input.slice(i + 2, end) });
        i = end + 2;
        continue;
      }
    }

    // 4. $...$ (inline math, not preceded or succeeded by another $)
    if (input[i] === '$' && !input.startsWith('$$', i)) {
      const end = findClosingDollar(input, i + 1);
      if (end !== -1) {
        tokens.push({ type: 'inline', content: input.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }

    // 5. Plain text
    const last = tokens[tokens.length - 1];
    if (last && last.type === 'text') {
      last.content += input[i];
    } else {
      tokens.push({ type: 'text', content: input[i] });
    }
    i++;
  }

  return tokens
    .map((token) => {
      if (token.type === 'text') {
        // If content contains pre-rendered html (such as table markup), preserve it
        if (token.content.includes('<table')) {
          return token.content;
        }
        return escapeHtml(token.content).replace(/\n/g, '<br/>');
      }
      try {
        return katex.renderToString(token.content.trim(), {
          displayMode: token.type === 'display',
          throwOnError: false,
          output: 'htmlAndMathml',
        });
      } catch {
        return escapeHtml(token.content);
      }
    })
    .join('');
}

function findClosingDollar(str: string, startIndex: number): number {
  for (let idx = startIndex; idx < str.length; idx++) {
    if (str[idx] === '$' && str[idx - 1] !== '\\') {
      if (str[idx + 1] === '$') continue;
      return idx;
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
    .replace(/'/g, '&#039;');
}
