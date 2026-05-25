import { LitElement, html, css, type PropertyValues, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { Prompt, PromptInput } from '@/data/prompt.ts';
import '../ui/token-counter.ts';

export interface PromptSaveDetail {
  readonly id: string | null;
  readonly input: PromptInput;
}

export type PromptSaveEvent = CustomEvent<PromptSaveDetail>;
export type PromptDeleteEvent = CustomEvent<string>;
export type PromptCancelEvent = CustomEvent<void>;

const MAX_TITLE_LENGTH = 80;

@customElement('cd-prompt-editor')
export class CdPromptEditor extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: var(--cd-space-4);
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: var(--cd-space-2);
    }

    label {
      font-size: var(--cd-font-size-sm);
      font-weight: 600;
      color: var(--cd-color-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    input[type='text'],
    textarea {
      box-sizing: border-box;
      width: 100%;
      padding: var(--cd-space-3);
      border: 1px solid var(--cd-color-border);
      border-radius: var(--cd-radius-md);
      background-color: var(--cd-color-bg-elevated);
      color: var(--cd-color-text);
      font-family: var(--cd-font-sans);
      font-size: var(--cd-font-size-base);
      transition: border-color 0.15s ease;
    }

    textarea {
      min-height: 14rem;
      font-family: var(--cd-font-mono);
      font-size: var(--cd-font-size-sm);
      line-height: 1.5;
      resize: vertical;
    }

    input[type='text']:focus,
    textarea:focus {
      outline: none;
      border-color: var(--cd-color-accent);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--cd-color-accent) 25%, transparent);
    }

    .hint {
      font-size: var(--cd-font-size-sm);
      color: var(--cd-color-text-muted);
    }

    .meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: var(--cd-font-size-sm);
      color: var(--cd-color-text-muted);
    }

    .count-warn {
      color: var(--cd-color-danger);
      font-variant-numeric: tabular-nums;
    }

    .actions {
      display: flex;
      gap: var(--cd-space-2);
      align-items: center;
      flex-wrap: wrap;
    }

    button {
      padding: var(--cd-space-2) var(--cd-space-4);
      border-radius: var(--cd-radius-md);
      font-size: var(--cd-font-size-sm);
      font-weight: 500;
      cursor: pointer;
      transition:
        opacity 0.15s ease,
        background-color 0.15s ease,
        border-color 0.15s ease;
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .primary {
      border: 0;
      background-color: var(--cd-color-accent);
      color: var(--cd-color-accent-contrast);
    }

    .primary:hover:not(:disabled) {
      opacity: 0.9;
    }

    .secondary {
      border: 1px solid var(--cd-color-border);
      background-color: transparent;
      color: var(--cd-color-text);
    }

    .secondary:hover {
      border-color: var(--cd-color-accent);
    }

    .danger {
      margin-left: auto;
      border: 1px solid color-mix(in srgb, var(--cd-color-danger) 50%, var(--cd-color-border));
      background-color: transparent;
      color: var(--cd-color-danger);
    }

    .danger:hover {
      background-color: color-mix(in srgb, var(--cd-color-danger) 12%, transparent);
    }
  `;

  @property({ attribute: false })
  prompt: Prompt | null = null;

  @state()
  private titleText = '';

  @state()
  private content = '';

  @state()
  private tagsText = '';

  override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('prompt')) {
      this.titleText = this.prompt?.title ?? '';
      this.content = this.prompt?.content ?? '';
      this.tagsText = this.prompt?.tags.join(', ') ?? '';
    }
  }

  private parseTags(): readonly string[] {
    return this.tagsText
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
  }

  private canSave(): boolean {
    return this.titleText.trim().length > 0;
  }

  private handleSubmit(event: Event): void {
    event.preventDefault();
    if (!this.canSave()) return;
    this.dispatchEvent(
      new CustomEvent('prompt-save', {
        detail: {
          id: this.prompt?.id ?? null,
          input: {
            title: this.titleText.trim(),
            content: this.content,
            tags: this.parseTags(),
          },
        },
        bubbles: true,
        composed: true,
      }) satisfies PromptSaveEvent,
    );
  }

  private handleCancel(): void {
    this.dispatchEvent(
      new CustomEvent('prompt-cancel', {
        bubbles: true,
        composed: true,
      }) satisfies PromptCancelEvent,
    );
  }

  private handleDelete(): void {
    if (!this.prompt) return;
    const ok = confirm(`¿Eliminar "${this.prompt.title || 'Sin título'}"?`);
    if (!ok) return;
    this.dispatchEvent(
      new CustomEvent('prompt-delete', {
        detail: this.prompt.id,
        bubbles: true,
        composed: true,
      }) satisfies PromptDeleteEvent,
    );
  }

  override render(): TemplateResult {
    const isEdit = this.prompt !== null;
    return html`
      <form @submit=${this.handleSubmit} novalidate>
        <div class="field">
          <label for="prompt-title">Título</label>
          <input
            id="prompt-title"
            type="text"
            placeholder="Ej. Code review focused"
            maxlength=${MAX_TITLE_LENGTH}
            .value=${this.titleText}
            @input=${(e: Event) => (this.titleText = (e.target as HTMLInputElement).value)}
            required
          />
          <div class="meta">
            <span class="hint">Aparece como título de la card.</span>
            <span class=${this.titleText.length >= MAX_TITLE_LENGTH - 10 ? 'count-warn' : ''}>
              ${this.titleText.length}/${MAX_TITLE_LENGTH}
            </span>
          </div>
        </div>

        <div class="field">
          <label for="prompt-tags">Tags</label>
          <input
            id="prompt-tags"
            type="text"
            placeholder="frontend, lit, snippet"
            .value=${this.tagsText}
            @input=${(e: Event) => (this.tagsText = (e.target as HTMLInputElement).value)}
          />
          <span class="hint">Separa los tags por comas.</span>
        </div>

        <div class="field">
          <label for="prompt-content">Contenido</label>
          <textarea
            id="prompt-content"
            placeholder="Pega aquí el prompt..."
            .value=${this.content}
            @input=${(e: Event) => (this.content = (e.target as HTMLTextAreaElement).value)}
          ></textarea>
          <div class="meta">
            <span>${this.content.length} caracteres</span>
            <cd-token-counter .text=${this.content}></cd-token-counter>
          </div>
        </div>

        <div class="actions">
          <button type="submit" class="primary" ?disabled=${!this.canSave()}>
            ${isEdit ? 'Guardar cambios' : 'Crear prompt'}
          </button>
          <button type="button" class="secondary" @click=${this.handleCancel}>Cancelar</button>
          ${isEdit
            ? html`<button type="button" class="danger" @click=${this.handleDelete}>
                Eliminar
              </button>`
            : null}
        </div>
      </form>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cd-prompt-editor': CdPromptEditor;
  }
  interface HTMLElementEventMap {
    'prompt-save': PromptSaveEvent;
    'prompt-cancel': PromptCancelEvent;
    'prompt-delete': PromptDeleteEvent;
  }
}
