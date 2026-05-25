import { LitElement, html, css, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { TECH_CATEGORIES, TECH_STACKS, type TechCategory } from '@/data/tech-stacks.ts';

export type TechStackChangeEvent = CustomEvent<readonly string[]>;

@customElement('cd-step-stack')
export class CdStepStack extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }

    .category {
      margin-bottom: var(--cd-space-5);
    }

    .category:last-child {
      margin-bottom: 0;
    }

    .category-title {
      font-size: var(--cd-font-size-sm);
      font-weight: 600;
      margin-bottom: var(--cd-space-3);
      color: var(--cd-color-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .options {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: var(--cd-space-2);
    }

    label.option {
      position: relative;
      display: flex;
      align-items: center;
      gap: var(--cd-space-2);
      padding: var(--cd-space-2) var(--cd-space-3);
      border: 1px solid var(--cd-color-border);
      border-radius: var(--cd-radius-md);
      background-color: var(--cd-color-bg-elevated);
      cursor: pointer;
      font-size: var(--cd-font-size-sm);
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

    input[type='checkbox'] {
      flex: 0 0 auto;
      accent-color: var(--cd-color-accent);
    }
  `;

  @property({ attribute: false })
  selected: readonly string[] = [];

  private toggle(id: string, checked: boolean): void {
    const next = checked
      ? [...this.selected, id]
      : this.selected.filter((existing) => existing !== id);
    this.dispatchEvent(
      new CustomEvent('tech-stack-change', {
        detail: next,
        bubbles: true,
        composed: true,
      }) satisfies TechStackChangeEvent,
    );
  }

  private renderCategory(category: TechCategory, label: string): TemplateResult | null {
    const items = TECH_STACKS.filter((item) => item.category === category);
    if (items.length === 0) return null;
    return html`
      <section class="category" aria-labelledby="cat-${category}">
        <h3 id="cat-${category}" class="category-title">${label}</h3>
        <div class="options">
          ${items.map(
            (item) => html`
              <label class="option">
                <input
                  type="checkbox"
                  value=${item.id}
                  .checked=${this.selected.includes(item.id)}
                  @change=${(e: Event) => this.toggle(item.id, (e.target as HTMLInputElement).checked)}
                />
                <span>${item.label}</span>
              </label>
            `,
          )}
        </div>
      </section>
    `;
  }

  override render(): TemplateResult {
    return html`
      ${TECH_CATEGORIES.map((cat) => this.renderCategory(cat.id, cat.label))}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cd-step-stack': CdStepStack;
  }
  interface HTMLElementEventMap {
    'tech-stack-change': TechStackChangeEvent;
  }
}
