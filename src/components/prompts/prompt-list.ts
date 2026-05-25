import { LitElement, html, css, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { Prompt } from '@/data/prompt.ts';
import './prompt-card.ts';

@customElement('cd-prompt-list')
export class CdPromptList extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }

    .list {
      display: flex;
      flex-direction: column;
      gap: var(--cd-space-2);
    }
  `;

  @property({ attribute: false })
  prompts: readonly Prompt[] = [];

  @property({ type: String })
  selectedId: string | null = null;

  override render(): TemplateResult {
    return html`
      <div class="list" role="list">
        ${this.prompts.map(
          (prompt) => html`
            <cd-prompt-card
              role="listitem"
              .prompt=${prompt}
              ?selected=${this.selectedId === prompt.id}
            ></cd-prompt-card>
          `,
        )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cd-prompt-list': CdPromptList;
  }
}
