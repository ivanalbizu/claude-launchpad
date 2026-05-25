import { LitElement, html, css, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { Prompt } from '@/data/prompt.ts';
import '../ui/token-counter.ts';

export type PromptSelectEvent = CustomEvent<string>;

@customElement('cd-prompt-card')
export class CdPromptCard extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }

    .card {
      position: relative;
      display: block;
      width: 100%;
      text-align: left;
      padding: var(--cd-space-3) var(--cd-space-4);
      border: 1px solid var(--cd-color-border);
      border-radius: var(--cd-radius-md);
      background-color: var(--cd-color-bg-elevated);
      color: var(--cd-color-text);
      font: inherit;
      cursor: pointer;
      transition:
        border-color 0.15s ease,
        background-color 0.15s ease;
    }

    .card:hover {
      border-color: var(--cd-color-accent);
    }

    .card:focus-visible {
      outline: 2px solid var(--cd-color-accent);
      outline-offset: 2px;
    }

    :host([selected]) .card,
    .card[aria-current='true'] {
      border-color: var(--cd-color-accent);
      background-color: color-mix(in srgb, var(--cd-color-accent) 8%, var(--cd-color-bg));
    }

    .title {
      margin: 0 4rem 0 0;
      font-size: var(--cd-font-size-base);
      font-weight: 600;
      line-height: 1.3;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .preview {
      margin: var(--cd-space-2) 0 var(--cd-space-3);
      font-size: var(--cd-font-size-sm);
      color: var(--cd-color-text-muted);
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    footer {
      display: flex;
      align-items: center;
      gap: var(--cd-space-3);
      flex-wrap: wrap;
      font-size: var(--cd-font-size-sm);
      color: var(--cd-color-text-muted);
    }

    .tags {
      display: flex;
      gap: var(--cd-space-1);
      flex-wrap: wrap;
      flex: 1;
      min-width: 0;
    }

    .tag {
      padding: 2px var(--cd-space-2);
      border-radius: 999px;
      background-color: var(--cd-color-bg);
      border: 1px solid var(--cd-color-border);
      font-size: 0.75rem;
    }

    .copy-btn {
      position: absolute;
      top: var(--cd-space-2);
      right: var(--cd-space-2);
      padding: var(--cd-space-1) var(--cd-space-2);
      border: 1px solid var(--cd-color-border);
      border-radius: var(--cd-radius-sm);
      background-color: var(--cd-color-bg);
      color: var(--cd-color-text);
      font-size: 0.75rem;
      cursor: pointer;
      transition:
        background-color 0.15s ease,
        border-color 0.15s ease;
    }

    .copy-btn:hover {
      border-color: var(--cd-color-accent);
    }

    .copy-btn[data-state='copied'] {
      border-color: var(--cd-color-accent);
      color: var(--cd-color-accent);
    }

    .copy-btn[data-state='error'] {
      border-color: var(--cd-color-danger);
      color: var(--cd-color-danger);
      background-color: color-mix(in srgb, var(--cd-color-danger) 8%, transparent);
    }
  `;

  @property({ attribute: false })
  prompt!: Prompt;

  @property({ type: Boolean, reflect: true })
  selected = false;

  @state()
  private copyState: 'idle' | 'copied' | 'error' = 'idle';

  private select(): void {
    this.dispatchEvent(
      new CustomEvent('prompt-select', {
        detail: this.prompt.id,
        bubbles: true,
        composed: true,
      }) satisfies PromptSelectEvent,
    );
  }

  private async copy(event: Event): Promise<void> {
    event.stopPropagation();
    try {
      await navigator.clipboard.writeText(this.prompt.content);
      this.copyState = 'copied';
      setTimeout(() => (this.copyState = 'idle'), 1500);
    } catch {
      this.copyState = 'error';
      setTimeout(() => (this.copyState = 'idle'), 3000);
    }
  }

  override render(): TemplateResult {
    const copyLabel =
      this.copyState === 'copied' ? 'Copiado' : this.copyState === 'error' ? 'No se pudo' : 'Copiar';
    const copyTitle =
      this.copyState === 'error'
        ? 'No se pudo copiar (revisa permisos del navegador)'
        : 'Copiar contenido al portapapeles';
    return html`
      <button
        class="card"
        type="button"
        aria-current=${this.selected ? 'true' : 'false'}
        @click=${this.select}
      >
        <h3 class="title">${this.prompt.title || 'Sin título'}</h3>
        ${this.prompt.content
          ? html`<p class="preview">${this.prompt.content}</p>`
          : null}
        <footer>
          <span class="tags">
            ${this.prompt.tags.map((tag) => html`<span class="tag">${tag}</span>`)}
          </span>
          <cd-token-counter .text=${this.prompt.content}></cd-token-counter>
        </footer>
      </button>
      <button
        class="copy-btn"
        type="button"
        data-state=${this.copyState}
        title=${copyTitle}
        @click=${this.copy}
      >
        ${copyLabel}
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cd-prompt-card': CdPromptCard;
  }
  interface HTMLElementEventMap {
    'prompt-select': PromptSelectEvent;
  }
}
