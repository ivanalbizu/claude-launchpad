import { LitElement, html, css, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

@customElement('cd-md-preview')
export class CdMdPreview extends LitElement {
  static override styles = css`
    :host {
      display: block;
      height: 100%;
    }

    .preview {
      height: 100%;
      padding: var(--cd-space-5);
      overflow-y: auto;
      font-size: var(--cd-font-size-sm);
      line-height: 1.55;
    }

    .preview > :first-child {
      margin-top: 0;
    }

    .preview h1,
    .preview h2,
    .preview h3,
    .preview h4 {
      margin-top: var(--cd-space-5);
      margin-bottom: var(--cd-space-2);
      line-height: 1.25;
    }

    .preview h1 {
      font-size: var(--cd-font-size-xl);
    }
    .preview h2 {
      font-size: var(--cd-font-size-lg);
      padding-bottom: var(--cd-space-2);
      border-bottom: 1px solid var(--cd-color-border);
    }

    .preview p,
    .preview ul,
    .preview ol,
    .preview blockquote {
      margin-bottom: var(--cd-space-3);
    }

    .preview ul,
    .preview ol {
      padding-left: var(--cd-space-5);
    }

    .preview blockquote {
      margin-left: 0;
      padding: var(--cd-space-2) var(--cd-space-3);
      border-left: 3px solid var(--cd-color-accent);
      color: var(--cd-color-text-muted);
      background-color: var(--cd-color-bg-elevated);
      border-radius: var(--cd-radius-sm);
    }

    .preview code {
      font-family: var(--cd-font-mono);
      font-size: 0.9em;
      padding: 1px 5px;
      border-radius: var(--cd-radius-sm);
      background-color: var(--cd-color-bg-elevated);
    }

    .preview pre {
      padding: var(--cd-space-3);
      background-color: var(--cd-color-bg-elevated);
      border-radius: var(--cd-radius-md);
      overflow-x: auto;
    }

    .preview pre code {
      padding: 0;
      background: none;
    }

    .empty {
      color: var(--cd-color-text-muted);
      font-style: italic;
    }
  `;

  @property({ type: String })
  value = '';

  override render(): TemplateResult {
    const trimmed = this.value.trim();
    if (!trimmed) {
      return html`<div class="preview empty">No hay contenido todavía.</div>`;
    }
    const rendered = marked.parse(this.value, { async: false }) as string;
    const safe = DOMPurify.sanitize(rendered);
    return html`<div class="preview">${unsafeHTML(safe)}</div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cd-md-preview': CdMdPreview;
  }
}
