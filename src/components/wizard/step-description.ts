import { LitElement, html, css, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { SECURITY_POLICIES, type SecurityPolicy } from '@/data/security-policies.ts';

export interface DescriptionValues {
  readonly projectName: string;
  readonly description: string;
  readonly restrictions: string;
  readonly hardenedPermissions: boolean;
}

export type DescriptionChangeEvent = CustomEvent<DescriptionValues>;

type FreeTextField = 'projectName' | 'description' | 'restrictions';

@customElement('cd-step-description')
export class CdStepDescription extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }

    .field {
      margin-bottom: var(--cd-space-5);
    }

    .field:last-child {
      margin-bottom: 0;
    }

    label {
      display: block;
      font-size: var(--cd-font-size-sm);
      font-weight: 600;
      margin-bottom: var(--cd-space-2);
      color: var(--cd-color-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .hint {
      display: block;
      margin-top: var(--cd-space-1);
      font-size: var(--cd-font-size-sm);
      color: var(--cd-color-text-muted);
    }

    textarea,
    input[type='text'] {
      box-sizing: border-box;
      width: 100%;
      padding: var(--cd-space-3);
      border: 1px solid var(--cd-color-border);
      border-radius: var(--cd-radius-md);
      background-color: var(--cd-color-bg-elevated);
      color: var(--cd-color-text);
      font-family: var(--cd-font-mono);
      font-size: var(--cd-font-size-sm);
      line-height: 1.5;
      transition: border-color 0.15s ease;
    }

    textarea {
      min-height: 6.5rem;
      resize: vertical;
    }

    textarea:focus,
    input[type='text']:focus {
      outline: none;
      border-color: var(--cd-color-accent);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--cd-color-accent) 25%, transparent);
    }

    input[type='text'],
    textarea#description {
      font-family: var(--cd-font-sans);
    }

    textarea#description {
      min-height: 5rem;
    }

    .policy-chips {
      display: flex;
      flex-wrap: wrap;
      gap: var(--cd-space-2);
      margin-top: var(--cd-space-3);
    }

    .policy-chip {
      display: inline-flex;
      align-items: center;
      gap: var(--cd-space-1);
      padding: var(--cd-space-1) var(--cd-space-3);
      border: 1px solid var(--cd-color-border);
      border-radius: 999px;
      background-color: var(--cd-color-bg-elevated);
      color: var(--cd-color-text);
      font-family: var(--cd-font-sans);
      font-size: var(--cd-font-size-sm);
      cursor: pointer;
      transition:
        border-color 0.15s ease,
        background-color 0.15s ease,
        color 0.15s ease;
    }

    .policy-chip:hover {
      border-color: var(--cd-color-accent);
    }

    .policy-chip[data-applied='true'] {
      border-color: var(--cd-color-accent);
      background-color: color-mix(in srgb, var(--cd-color-accent) 14%, var(--cd-color-bg-elevated));
      color: var(--cd-color-text);
    }

    .policy-chip .glyph {
      font-weight: 700;
      color: var(--cd-color-text-muted);
    }

    .policy-chip[data-applied='true'] .glyph {
      color: var(--cd-color-accent);
    }

    .security-panel {
      margin-top: var(--cd-space-3);
      padding: var(--cd-space-4);
      border: 1px solid var(--cd-color-border);
      border-radius: var(--cd-radius-md);
      background-color: var(--cd-color-bg);
    }

    .security-panel header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--cd-space-3);
      margin-bottom: var(--cd-space-2);
    }

    .security-panel h4 {
      margin: 0;
      font-size: var(--cd-font-size-sm);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--cd-color-text-muted);
    }

    .security-panel p {
      margin: 0;
      font-size: var(--cd-font-size-sm);
      color: var(--cd-color-text-muted);
      line-height: 1.4;
    }

    .hardened-toggle {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: var(--cd-space-3);
      align-items: start;
      margin-top: var(--cd-space-4);
      padding-top: var(--cd-space-3);
      border-top: 1px dashed var(--cd-color-border);
      cursor: pointer;
    }

    .hardened-toggle input[type='checkbox'] {
      margin-top: 4px;
      accent-color: var(--cd-color-accent);
    }

    .hardened-toggle .toggle-meta {
      display: flex;
      flex-direction: column;
      gap: var(--cd-space-1);
    }

    .hardened-toggle .toggle-title {
      font-weight: 600;
      font-size: var(--cd-font-size-sm);
    }

    .hardened-toggle .toggle-desc {
      font-size: var(--cd-font-size-sm);
      color: var(--cd-color-text-muted);
      line-height: 1.4;
    }
  `;

  @property({ attribute: false })
  values: DescriptionValues = {
    projectName: '',
    description: '',
    restrictions: '',
    hardenedPermissions: false,
  };

  private emit(next: DescriptionValues): void {
    this.dispatchEvent(
      new CustomEvent('description-change', {
        detail: next,
        bubbles: true,
        composed: true,
      }) satisfies DescriptionChangeEvent,
    );
  }

  private setField(field: FreeTextField, value: string): void {
    this.emit({ ...this.values, [field]: value });
  }

  private toggleHardened(checked: boolean): void {
    this.emit({ ...this.values, hardenedPermissions: checked });
  }

  private isPolicyApplied(policy: SecurityPolicy): boolean {
    const existing = new Set(this.values.restrictions.split('\n').map((l) => l.trim()));
    return policy.bullets.every((b) => existing.has(b.trim()));
  }

  private applyPolicy(policy: SecurityPolicy): void {
    const existingLines = this.values.restrictions.split('\n').map((l) => l.trim());
    const existing = new Set(existingLines);
    const missing = policy.bullets.filter((b) => !existing.has(b.trim()));
    if (missing.length === 0) return;

    const current = this.values.restrictions.trimEnd();
    const separator = current.length === 0 ? '' : '\n\n';
    const next = `${current}${separator}${missing.join('\n')}\n`;
    this.setField('restrictions', next);
  }

  private renderPolicyChips(): TemplateResult {
    return html`
      <div class="policy-chips" role="list" aria-label="Políticas de seguridad sugeridas">
        ${SECURITY_POLICIES.map((policy) => {
          const applied = this.isPolicyApplied(policy);
          return html`
            <button
              class="policy-chip"
              type="button"
              role="listitem"
              data-applied=${applied}
              title=${policy.description}
              @click=${() => this.applyPolicy(policy)}
            >
              <span class="glyph" aria-hidden="true">${applied ? '✓' : '+'}</span>
              ${policy.label}
            </button>
          `;
        })}
      </div>
    `;
  }

  override render(): TemplateResult {
    return html`
      <div class="field">
        <label for="projectName">Nombre del proyecto</label>
        <input
          type="text"
          id="projectName"
          placeholder="ej. mi-app-cool"
          .value=${this.values.projectName}
          @input=${(e: Event) =>
            this.setField('projectName', (e.target as HTMLInputElement).value)}
        />
        <span class="hint">Aparecerá como el H1 del CLAUDE.md.</span>
      </div>

      <div class="field">
        <label for="description">Descripción</label>
        <textarea
          id="description"
          placeholder="Qué hace este proyecto, para quién, y por qué existe."
          .value=${this.values.description}
          @input=${(e: Event) => this.setField('description', (e.target as HTMLTextAreaElement).value)}
        ></textarea>
        <span class="hint"
          >Aparecerá como blockquote justo debajo del título del CLAUDE.md.</span
        >
      </div>

      <div class="field">
        <label for="restrictions">Restricciones</label>
        <textarea
          id="restrictions"
          placeholder="- No introducir frameworks adicionales&#10;- No commitear sin que los tests pasen&#10;- No instalar dependencias sin preguntar"
          .value=${this.values.restrictions}
          @input=${(e: Event) =>
            this.setField('restrictions', (e.target as HTMLTextAreaElement).value)}
        ></textarea>
        <span class="hint">Cosas que Claude NO debe hacer en este proyecto.</span>

        <div class="security-panel">
          <header>
            <h4>Políticas de seguridad sugeridas</h4>
          </header>
          <p>
            Bloques curados que se añaden al final del campo de restricciones. Pulsa de nuevo
            para reaplicar si algún bullet falta.
          </p>
          ${this.renderPolicyChips()}

          <label class="hardened-toggle">
            <input
              type="checkbox"
              .checked=${this.values.hardenedPermissions}
              @change=${(e: Event) =>
                this.toggleHardened((e.target as HTMLInputElement).checked)}
            />
            <span class="toggle-meta">
              <span class="toggle-title">Permisos endurecidos en <code>settings.json</code></span>
              <span class="toggle-desc">
                Añade reglas <code>deny</code> extra al bundle <code>.claude/</code>: bloquea
                <code>curl</code>/<code>wget</code>, <code>eval</code>, lectura de
                <code>.env</code> y rutas sensibles del HOME, y escrituras en
                <code>.github/workflows/</code>. Pensado como defensa anti prompt injection.
              </span>
            </span>
          </label>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cd-step-description': CdStepDescription;
  }
  interface HTMLElementEventMap {
    'description-change': DescriptionChangeEvent;
  }
}
