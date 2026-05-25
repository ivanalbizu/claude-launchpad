import { LitElement, html, css, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import {
  COVERAGE_TARGETS,
  TEST_STRATEGIES,
  TESTING_FRAMEWORKS,
  type TestType,
} from '@/data/testing-strategies.ts';

export interface TestingSelection {
  readonly frameworks: readonly string[];
  readonly strategies: readonly TestType[];
  readonly coverage: string | null;
}

export type TestingChangeEvent = CustomEvent<TestingSelection>;

@customElement('cd-step-testing')
export class CdStepTesting extends LitElement {
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
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: var(--cd-space-2);
    }

    label.option {
      display: flex;
      align-items: flex-start;
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

    input[type='checkbox'],
    input[type='radio'] {
      flex: 0 0 auto;
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
    }

    .option-description {
      font-size: var(--cd-font-size-sm);
      color: var(--cd-color-text-muted);
      line-height: 1.4;
    }

    .framework-type {
      grid-column: 1 / -1;
      font-size: var(--cd-font-size-sm);
      color: var(--cd-color-text-muted);
      margin: var(--cd-space-2) 0 var(--cd-space-1);
    }
  `;

  @property({ attribute: false })
  selected: TestingSelection = { frameworks: [], strategies: [], coverage: null };

  private emit(next: TestingSelection): void {
    this.dispatchEvent(
      new CustomEvent('testing-change', {
        detail: next,
        bubbles: true,
        composed: true,
      }) satisfies TestingChangeEvent,
    );
  }

  private toggleStrategy(id: TestType, checked: boolean): void {
    const strategies = checked
      ? [...this.selected.strategies, id]
      : this.selected.strategies.filter((s) => s !== id);
    this.emit({ ...this.selected, strategies });
  }

  private toggleFramework(id: string, checked: boolean): void {
    const frameworks = checked
      ? [...this.selected.frameworks, id]
      : this.selected.frameworks.filter((f) => f !== id);
    this.emit({ ...this.selected, frameworks });
  }

  private setCoverage(id: string): void {
    this.emit({ ...this.selected, coverage: id });
  }

  override render(): TemplateResult {
    return html`
      ${this.renderStrategies()} ${this.renderFrameworks()} ${this.renderCoverage()}
    `;
  }

  private renderStrategies(): TemplateResult {
    return html`
      <fieldset>
        <legend>Estrategia</legend>
        <div class="options">
          ${TEST_STRATEGIES.map(
            (strat) => html`
              <label class="option">
                <input
                  type="checkbox"
                  value=${strat.id}
                  .checked=${this.selected.strategies.includes(strat.id)}
                  @change=${(e: Event) =>
                    this.toggleStrategy(strat.id, (e.target as HTMLInputElement).checked)}
                />
                <span class="option-content">
                  <span class="option-label">${strat.label}</span>
                  <span class="option-description">${strat.description}</span>
                </span>
              </label>
            `,
          )}
        </div>
      </fieldset>
    `;
  }

  private renderFrameworks(): TemplateResult {
    const typeLabels: Record<TestType, string> = {
      unit: 'Unit',
      integration: 'Integration',
      component: 'Component',
      e2e: 'End-to-end',
    };
    return html`
      <fieldset>
        <legend>Frameworks</legend>
        <div class="options">
          ${(Object.keys(typeLabels) as TestType[]).flatMap((type) => {
            const items = TESTING_FRAMEWORKS.filter((f) => f.testType === type);
            if (items.length === 0) return [];
            return [
              html`<div class="framework-type">${typeLabels[type]}</div>`,
              ...items.map(
                (item) => html`
                  <label class="option">
                    <input
                      type="checkbox"
                      value=${item.id}
                      .checked=${this.selected.frameworks.includes(item.id)}
                      @change=${(e: Event) =>
                        this.toggleFramework(item.id, (e.target as HTMLInputElement).checked)}
                    />
                    <span>${item.label}</span>
                  </label>
                `,
              ),
            ];
          })}
        </div>
      </fieldset>
    `;
  }

  private renderCoverage(): TemplateResult {
    return html`
      <fieldset>
        <legend>Cobertura objetivo</legend>
        <div class="options">
          ${COVERAGE_TARGETS.map(
            (target) => html`
              <label class="option">
                <input
                  type="radio"
                  name="coverage"
                  value=${target.id}
                  .checked=${this.selected.coverage === target.id}
                  @change=${() => this.setCoverage(target.id)}
                />
                <span>${target.label}</span>
              </label>
            `,
          )}
        </div>
      </fieldset>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cd-step-testing': CdStepTesting;
  }
  interface HTMLElementEventMap {
    'testing-change': TestingChangeEvent;
  }
}
