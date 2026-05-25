import { LitElement, html, css, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { ScriptEntry } from '@/data/wizard-state.ts';

export type ScriptsChangeEvent = CustomEvent<readonly ScriptEntry[]>;

@customElement('cd-step-scripts')
export class CdStepScripts extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }

    .intro {
      margin: 0 0 var(--cd-space-4);
      font-size: var(--cd-font-size-sm);
      color: var(--cd-color-text-muted);
    }

    .toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--cd-space-3);
      margin-bottom: var(--cd-space-3);
      flex-wrap: wrap;
    }

    .suggest-btn,
    .add-btn {
      padding: var(--cd-space-2) var(--cd-space-3);
      border: 1px solid var(--cd-color-border);
      border-radius: var(--cd-radius-md);
      background-color: transparent;
      color: var(--cd-color-text);
      font-size: var(--cd-font-size-sm);
      font-weight: 500;
      cursor: pointer;
      transition:
        border-color 0.15s ease,
        background-color 0.15s ease;
    }

    .suggest-btn:hover,
    .add-btn:hover {
      border-color: var(--cd-color-accent);
    }

    .list {
      display: flex;
      flex-direction: column;
      gap: var(--cd-space-2);
    }

    .row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr) auto;
      gap: var(--cd-space-2);
      align-items: stretch;
    }

    input[type='text'] {
      box-sizing: border-box;
      width: 100%;
      padding: var(--cd-space-2) var(--cd-space-3);
      border: 1px solid var(--cd-color-border);
      border-radius: var(--cd-radius-md);
      background-color: var(--cd-color-bg-elevated);
      color: var(--cd-color-text);
      font-size: var(--cd-font-size-sm);
      line-height: 1.5;
      transition: border-color 0.15s ease;
    }

    input[type='text'].cmd {
      font-family: var(--cd-font-mono);
    }

    input[type='text']:focus {
      outline: none;
      border-color: var(--cd-color-accent);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--cd-color-accent) 25%, transparent);
    }

    .delete-btn {
      padding: 0 var(--cd-space-3);
      border: 1px solid color-mix(in srgb, var(--cd-color-danger) 50%, var(--cd-color-border));
      border-radius: var(--cd-radius-md);
      background-color: transparent;
      color: var(--cd-color-danger);
      font-size: var(--cd-font-size-sm);
      cursor: pointer;
      transition: background-color 0.15s ease;
    }

    .delete-btn:hover {
      background-color: color-mix(in srgb, var(--cd-color-danger) 12%, transparent);
    }

    .empty {
      padding: var(--cd-space-5);
      text-align: center;
      color: var(--cd-color-text-muted);
      border: 1px dashed var(--cd-color-border);
      border-radius: var(--cd-radius-md);
      font-size: var(--cd-font-size-sm);
    }
  `;

  @property({ attribute: false })
  scripts: readonly ScriptEntry[] = [];

  @property({ attribute: false })
  suggestions: readonly ScriptEntry[] = [];

  private emit(next: readonly ScriptEntry[]): void {
    this.dispatchEvent(
      new CustomEvent('scripts-change', {
        detail: next,
        bubbles: true,
        composed: true,
      }) satisfies ScriptsChangeEvent,
    );
  }

  private updateAt(index: number, patch: Partial<ScriptEntry>): void {
    const next = this.scripts.map((entry, i) => (i === index ? { ...entry, ...patch } : entry));
    this.emit(next);
  }

  private removeAt(index: number): void {
    this.emit(this.scripts.filter((_, i) => i !== index));
  }

  private addRow(): void {
    this.emit([...this.scripts, { cmd: '', description: '' }]);
  }

  private loadSuggestions(): void {
    if (this.suggestions.length === 0) return;
    const ok =
      this.scripts.length === 0 ||
      confirm('Esto reemplazará los scripts actuales por los sugeridos. ¿Continuar?');
    if (!ok) return;
    this.emit(this.suggestions.map((s) => ({ ...s })));
  }

  override render(): TemplateResult {
    return html`
      <p class="intro">
        Scripts del proyecto. Aparecerán como bullets en la sección
        <code>## Comandos</code> del <code>CLAUDE.md</code> generado.
      </p>
      <div class="toolbar">
        <button
          class="suggest-btn"
          type="button"
          @click=${this.loadSuggestions}
          ?disabled=${this.suggestions.length === 0}
          title="Pre-rellena los scripts típicos según el stack elegido"
        >
          Usar sugeridos por stack
        </button>
        <button class="add-btn" type="button" @click=${this.addRow}>+ Añadir script</button>
      </div>
      ${this.scripts.length === 0
        ? html`<div class="empty">
            Sin scripts. Pulsa <strong>Usar sugeridos por stack</strong> para empezar.
          </div>`
        : html`
            <div class="list">
              ${this.scripts.map(
                (entry, i) => html`
                  <div class="row">
                    <input
                      type="text"
                      class="cmd"
                      placeholder="pnpm dev"
                      aria-label="Comando"
                      .value=${entry.cmd}
                      @input=${(e: Event) =>
                        this.updateAt(i, { cmd: (e.target as HTMLInputElement).value })}
                    />
                    <input
                      type="text"
                      placeholder="Dev server con HMR"
                      aria-label="Descripción"
                      .value=${entry.description}
                      @input=${(e: Event) =>
                        this.updateAt(i, { description: (e.target as HTMLInputElement).value })}
                    />
                    <button
                      class="delete-btn"
                      type="button"
                      aria-label="Eliminar script"
                      @click=${() => this.removeAt(i)}
                    >
                      ×
                    </button>
                  </div>
                `,
              )}
            </div>
          `}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cd-step-scripts': CdStepScripts;
  }
  interface HTMLElementEventMap {
    'scripts-change': ScriptsChangeEvent;
  }
}
