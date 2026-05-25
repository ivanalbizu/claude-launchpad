import { LitElement, html, css, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import {
  CONVENTION_CATEGORIES,
  type ConventionCategory,
  type ConventionCategoryId,
} from '@/data/conventions.ts';

export type ConventionsSelection = Partial<Record<ConventionCategoryId, string>>;
export type ConventionsChangeEvent = CustomEvent<ConventionsSelection>;

@customElement('cd-step-conventions')
export class CdStepConventions extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }

    fieldset {
      margin: 0 0 var(--cd-space-5) 0;
      padding: 0;
      border: 0;
    }

    fieldset:last-child {
      margin-bottom: 0;
    }

    legend {
      font-size: var(--cd-font-size-sm);
      font-weight: 600;
      margin-bottom: var(--cd-space-3);
      color: var(--cd-color-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .options {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: var(--cd-space-2);
    }

    label.option {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: var(--cd-space-2) var(--cd-space-3);
      align-items: start;
      padding: var(--cd-space-3);
      border: 1px solid var(--cd-color-border);
      border-radius: var(--cd-radius-md);
      background-color: var(--cd-color-bg-elevated);
      cursor: pointer;
      transition:
        border-color 0.15s ease,
        background-color 0.15s ease;
    }

    label.option:hover {
      border-color: var(--cd-color-accent);
    }

    label.option:has(input:checked) {
      border-color: var(--cd-color-accent);
      background-color: color-mix(in srgb, var(--cd-color-accent) 10%, var(--cd-color-bg));
    }

    label.option:focus-within {
      outline: 2px solid var(--cd-color-accent);
      outline-offset: 2px;
    }

    input[type='radio'] {
      margin-top: 2px;
      accent-color: var(--cd-color-accent);
    }

    .option-content {
      display: flex;
      flex-direction: column;
      gap: var(--cd-space-1);
    }

    .option-label {
      font-weight: 500;
      font-size: var(--cd-font-size-sm);
    }

    .option-description {
      font-size: var(--cd-font-size-sm);
      color: var(--cd-color-text-muted);
      line-height: 1.4;
    }
  `;

  @property({ attribute: false })
  selected: ConventionsSelection = {};

  private setCategoryChoice(category: ConventionCategoryId, optionId: string): void {
    const next: ConventionsSelection = { ...this.selected, [category]: optionId };
    this.dispatchEvent(
      new CustomEvent('conventions-change', {
        detail: next,
        bubbles: true,
        composed: true,
      }) satisfies ConventionsChangeEvent,
    );
  }

  private renderCategory(category: ConventionCategory): TemplateResult {
    return html`
      <fieldset>
        <legend>${category.label}</legend>
        <div class="options">
          ${category.options.map(
            (option) => html`
              <label class="option">
                <input
                  type="radio"
                  name=${category.id}
                  value=${option.id}
                  .checked=${this.selected[category.id] === option.id}
                  @change=${() => this.setCategoryChoice(category.id, option.id)}
                />
                <span class="option-content">
                  <span class="option-label">${option.label}</span>
                  ${option.description
                    ? html`<span class="option-description">${option.description}</span>`
                    : null}
                </span>
              </label>
            `,
          )}
        </div>
      </fieldset>
    `;
  }

  override render(): TemplateResult {
    return html`${CONVENTION_CATEGORIES.map((cat) => this.renderCategory(cat))}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cd-step-conventions': CdStepConventions;
  }
  interface HTMLElementEventMap {
    'conventions-change': ConventionsChangeEvent;
  }
}
