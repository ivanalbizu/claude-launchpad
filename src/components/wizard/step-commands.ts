import { LitElement, html, css, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { COMMAND_TEMPLATES, type CommandTemplate } from '@/data/command-templates.ts';
import type { Prompt } from '@/data/prompt.ts';
import { promptToSlashCommand } from '@/services/prompt-to-command.service.ts';

export type CommandTemplatesChangeEvent = CustomEvent<readonly string[]>;
export type CustomPromptCommandsChangeEvent = CustomEvent<readonly string[]>;

@customElement('cd-step-commands')
export class CdStepCommands extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }

    .intro {
      margin: 0 0 var(--cd-space-4);
      font-size: var(--cd-font-size-sm);
      color: var(--cd-color-text-muted);
    }

    .list {
      display: flex;
      flex-direction: column;
      gap: var(--cd-space-3);
    }

    .item {
      border: 1px solid var(--cd-color-border);
      border-radius: var(--cd-radius-md);
      background-color: var(--cd-color-bg-elevated);
      overflow: hidden;
      transition:
        border-color 0.15s ease,
        background-color 0.15s ease;
    }

    .item:has(input:checked) {
      border-color: var(--cd-color-accent);
      background-color: color-mix(in srgb, var(--cd-color-accent) 8%, var(--cd-color-bg));
    }

    .row {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: var(--cd-space-3);
      align-items: start;
      padding: var(--cd-space-3) var(--cd-space-4);
      cursor: pointer;
    }

    .row:focus-within {
      outline: 2px solid var(--cd-color-accent);
      outline-offset: -2px;
    }

    input[type='checkbox'] {
      margin-top: 4px;
      accent-color: var(--cd-color-accent);
    }

    .meta {
      display: flex;
      flex-direction: column;
      gap: var(--cd-space-1);
    }

    .name {
      font-family: var(--cd-font-mono);
      font-weight: 600;
      font-size: var(--cd-font-size-sm);
    }

    .desc {
      font-size: var(--cd-font-size-sm);
      color: var(--cd-color-text-muted);
      line-height: 1.4;
    }

    details.preview {
      border-top: 1px solid var(--cd-color-border);
    }

    details.preview summary {
      list-style: none;
      cursor: pointer;
      padding: var(--cd-space-2) var(--cd-space-4);
      font-size: var(--cd-font-size-sm);
      color: var(--cd-color-text-muted);
      display: flex;
      align-items: center;
      gap: var(--cd-space-2);
    }

    details.preview summary::-webkit-details-marker {
      display: none;
    }

    details.preview summary::before {
      content: '';
      width: 0.5em;
      height: 0.5em;
      border-right: 2px solid currentColor;
      border-bottom: 2px solid currentColor;
      transform: rotate(-45deg);
      transition: transform 0.15s ease;
    }

    details.preview[open] summary::before {
      transform: rotate(45deg);
    }

    pre {
      margin: 0;
      padding: var(--cd-space-3) var(--cd-space-4);
      background-color: var(--cd-color-bg);
      font-family: var(--cd-font-mono);
      font-size: 0.85rem;
      line-height: 1.5;
      overflow-x: auto;
      white-space: pre-wrap;
      word-wrap: break-word;
      color: var(--cd-color-text);
      border-top: 1px solid var(--cd-color-border);
    }

    .section-title {
      margin: var(--cd-space-5) 0 var(--cd-space-3);
      font-size: var(--cd-font-size-sm);
      font-weight: 600;
      color: var(--cd-color-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .section-title:first-of-type {
      margin-top: 0;
    }

    .empty {
      padding: var(--cd-space-4);
      text-align: center;
      color: var(--cd-color-text-muted);
      border: 1px dashed var(--cd-color-border);
      border-radius: var(--cd-radius-md);
      font-size: var(--cd-font-size-sm);
    }

    .slug {
      font-family: var(--cd-font-mono);
      font-size: 0.75rem;
      color: var(--cd-color-text-muted);
    }
  `;

  @property({ attribute: false })
  selected: readonly string[] = [];

  @property({ attribute: false })
  selectedPrompts: readonly string[] = [];

  @property({ attribute: false })
  availablePrompts: readonly Prompt[] = [];

  private toggleTemplate(id: string, checked: boolean): void {
    const next = checked
      ? [...this.selected, id]
      : this.selected.filter((existing) => existing !== id);
    this.dispatchEvent(
      new CustomEvent('command-templates-change', {
        detail: next,
        bubbles: true,
        composed: true,
      }) satisfies CommandTemplatesChangeEvent,
    );
  }

  private togglePrompt(id: string, checked: boolean): void {
    const next = checked
      ? [...this.selectedPrompts, id]
      : this.selectedPrompts.filter((existing) => existing !== id);
    this.dispatchEvent(
      new CustomEvent('custom-prompt-commands-change', {
        detail: next,
        bubbles: true,
        composed: true,
      }) satisfies CustomPromptCommandsChangeEvent,
    );
  }

  override render(): TemplateResult {
    return html`
      <p class="intro">
        Slash commands que viajarán como <code>.claude/commands/*.md</code> en el bundle.
      </p>

      <h3 class="section-title">Plantillas curadas</h3>
      <div class="list">${COMMAND_TEMPLATES.map((tpl) => this.renderTemplateItem(tpl))}</div>

      <h3 class="section-title">Tus prompts</h3>
      ${this.renderPromptsList()}
    `;
  }

  private renderTemplateItem(tpl: CommandTemplate): TemplateResult {
    const checked = this.selected.includes(tpl.id);
    return html`
      <article class="item">
        <label class="row">
          <input
            type="checkbox"
            .checked=${checked}
            @change=${(e: Event) =>
              this.toggleTemplate(tpl.id, (e.target as HTMLInputElement).checked)}
          />
          <span class="meta">
            <span class="name">${tpl.label}</span>
            <span class="desc">${tpl.description}</span>
          </span>
        </label>
        <details class="preview">
          <summary>Ver contenido de la plantilla</summary>
          <pre>${tpl.content}</pre>
        </details>
      </article>
    `;
  }

  private renderPromptsList(): TemplateResult {
    if (this.availablePrompts.length === 0) {
      return html`<div class="empty">
        Aún no tienes prompts guardados. Crea alguno en la vista "Prompts" y vuelve aquí para
        bundlearlo como slash command.
      </div>`;
    }
    return html`
      <div class="list">
        ${this.availablePrompts.map((prompt) => this.renderPromptItem(prompt))}
      </div>
    `;
  }

  private renderPromptItem(prompt: Prompt): TemplateResult {
    const checked = this.selectedPrompts.includes(prompt.id);
    const converted = promptToSlashCommand(prompt);
    return html`
      <article class="item">
        <label class="row">
          <input
            type="checkbox"
            .checked=${checked}
            @change=${(e: Event) =>
              this.togglePrompt(prompt.id, (e.target as HTMLInputElement).checked)}
          />
          <span class="meta">
            <span class="name">${converted.label}</span>
            <span class="desc">
              ${prompt.title}
              <span class="slug">(${converted.slug}.md)</span>
            </span>
          </span>
        </label>
        <details class="preview">
          <summary>Ver contenido del prompt</summary>
          <pre>${prompt.content}</pre>
        </details>
      </article>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cd-step-commands': CdStepCommands;
  }
  interface HTMLElementEventMap {
    'command-templates-change': CommandTemplatesChangeEvent;
    'custom-prompt-commands-change': CustomPromptCommandsChangeEvent;
  }
}
