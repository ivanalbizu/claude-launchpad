import { LitElement, html, css, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { PROJECT_TYPES, type ProjectTypeId } from '@/data/project-types.ts';

export type ProjectTypeChangeEvent = CustomEvent<ProjectTypeId>;

@customElement('cd-step-project-type')
export class CdStepProjectType extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }

    fieldset {
      margin: 0;
      padding: 0;
      border: 0;
    }

    legend {
      margin-bottom: var(--cd-space-4);
      font-size: var(--cd-font-size-lg);
      font-weight: 600;
    }

    .options {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: var(--cd-space-3);
    }

    label.option {
      display: block;
      padding: var(--cd-space-4);
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
      background-color: color-mix(in srgb, var(--cd-color-accent) 8%, var(--cd-color-bg));
    }

    label.option:focus-within {
      outline: 2px solid var(--cd-color-accent);
      outline-offset: 2px;
    }

    .option input {
      position: absolute;
      width: 1px;
      height: 1px;
      margin: -1px;
      padding: 0;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    .option-label {
      display: block;
      font-weight: 600;
      margin-bottom: var(--cd-space-1);
    }

    .option-description {
      display: block;
      font-size: var(--cd-font-size-sm);
      color: var(--cd-color-text-muted);
      line-height: 1.4;
    }
  `;

  @property({ attribute: false })
  selected: ProjectTypeId | null = null;

  private handleChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value as ProjectTypeId;
    this.dispatchEvent(
      new CustomEvent('project-type-change', {
        detail: value,
        bubbles: true,
        composed: true,
      }) satisfies ProjectTypeChangeEvent,
    );
  }

  override render(): TemplateResult {
    return html`
      <fieldset>
        <legend>¿Qué tipo de proyecto vas a crear?</legend>
        <div class="options" role="radiogroup">
          ${PROJECT_TYPES.map(
            (type) => html`
              <label class="option">
                <input
                  type="radio"
                  name="project-type"
                  value=${type.id}
                  .checked=${this.selected === type.id}
                  @change=${this.handleChange}
                />
                <span class="option-label">${type.label}</span>
                <span class="option-description">${type.description}</span>
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
    'cd-step-project-type': CdStepProjectType;
  }
  interface HTMLElementEventMap {
    'project-type-change': ProjectTypeChangeEvent;
  }
}
