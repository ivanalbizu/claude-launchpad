import { LitElement, html, css, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { SKILL_TEMPLATES, type SkillMetadata } from '@/data/skill-templates.ts';

export type SkillTemplatesChangeEvent = CustomEvent<readonly string[]>;

@customElement('cd-step-skills')
export class CdStepSkills extends LitElement {
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
      grid-template-columns: auto 1fr auto;
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
      min-width: 0;
    }

    .name {
      font-weight: 600;
      font-size: var(--cd-font-size-sm);
    }

    .path {
      font-family: var(--cd-font-mono);
      font-size: 0.75rem;
      color: var(--cd-color-text-muted);
    }

    .desc {
      font-size: var(--cd-font-size-sm);
      color: var(--cd-color-text-muted);
      line-height: 1.4;
    }

    .arg-hint {
      font-family: var(--cd-font-mono);
      font-size: 0.75rem;
      color: var(--cd-color-text-muted);
      padding: 1px 6px;
      border-radius: var(--cd-radius-sm);
      background-color: var(--cd-color-bg);
      border: 1px dashed var(--cd-color-border);
      display: inline-block;
      margin-top: var(--cd-space-1);
      width: fit-content;
    }

    .badges {
      display: flex;
      flex-direction: column;
      gap: var(--cd-space-1);
      align-items: flex-end;
      flex-shrink: 0;
    }

    .badge {
      display: inline-block;
      padding: 1px 8px;
      border-radius: 999px;
      border: 1px solid var(--cd-color-border);
      font-family: var(--cd-font-mono);
      font-size: 0.7rem;
      color: var(--cd-color-text-muted);
      white-space: nowrap;
    }

    .badge.invocation {
      border-color: color-mix(in srgb, var(--cd-color-accent) 60%, var(--cd-color-border));
      color: var(--cd-color-accent);
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
  `;

  @property({ attribute: false })
  selected: readonly string[] = [];

  @state()
  private bodies: ReadonlyMap<string, string> | null = null;

  private bodiesPromise: Promise<void> | null = null;

  private ensureBodiesLoaded(): void {
    if (this.bodies !== null || this.bodiesPromise !== null) return;
    this.bodiesPromise = import('@/data/skill-bodies.ts').then((mod) => {
      const map = new Map<string, string>();
      for (const [id, value] of Object.entries(mod.SKILL_BODIES)) map.set(id, value.body);
      this.bodies = map;
    });
  }

  private handleDetailsToggle(event: Event): void {
    if ((event.target as HTMLDetailsElement).open) this.ensureBodiesLoaded();
  }

  private toggleSkill(id: string, checked: boolean): void {
    const next = checked
      ? [...this.selected, id]
      : this.selected.filter((existing) => existing !== id);
    this.dispatchEvent(
      new CustomEvent('skill-templates-change', {
        detail: next,
        bubbles: true,
        composed: true,
      }) satisfies SkillTemplatesChangeEvent,
    );
  }

  override render(): TemplateResult {
    return html`
      <p class="intro">
        Skills se exportan a <code>.claude/skills/&lt;name&gt;/SKILL.md</code>. Las marcadas como
        <strong>auto</strong> Claude puede invocarlas solo según su <code>description</code>; las
        marcadas como <strong>manual</strong> requieren invocación explícita.
      </p>
      <div class="list">${SKILL_TEMPLATES.map((skill) => this.renderSkillItem(skill))}</div>
    `;
  }

  private renderSkillItem(skill: SkillMetadata): TemplateResult {
    const checked = this.selected.includes(skill.id);
    const invocationLabel = skill.disableModelInvocation ? 'manual' : 'auto';
    const body = this.bodies?.get(skill.id);
    return html`
      <article class="item">
        <label class="row">
          <input
            type="checkbox"
            .checked=${checked}
            @change=${(e: Event) =>
              this.toggleSkill(skill.id, (e.target as HTMLInputElement).checked)}
          />
          <span class="meta">
            <span class="name">${skill.label}</span>
            <span class="desc">${skill.description}</span>
            <span class="path">skills/${skill.name}/SKILL.md</span>
            ${skill.argumentHint
              ? html`<span class="arg-hint">$ARGUMENTS · ${skill.argumentHint}</span>`
              : null}
          </span>
          <span class="badges">
            <span class="badge invocation">${invocationLabel}</span>
            <span class="badge">${skill.allowedTools.length} tools</span>
          </span>
        </label>
        <details class="preview" @toggle=${this.handleDetailsToggle}>
          <summary>Ver contenido del SKILL.md</summary>
          <pre>${body ?? 'Cargando…'}</pre>
        </details>
      </article>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cd-step-skills': CdStepSkills;
  }
  interface HTMLElementEventMap {
    'skill-templates-change': SkillTemplatesChangeEvent;
  }
}
