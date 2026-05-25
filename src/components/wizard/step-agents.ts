import { LitElement, html, css, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { AGENT_TEMPLATES, type AgentMetadata } from '@/data/agent-templates.ts';

export type AgentTemplatesChangeEvent = CustomEvent<readonly string[]>;

@customElement('cd-step-agents')
export class CdStepAgents extends LitElement {
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

    .slug {
      font-family: var(--cd-font-mono);
      font-size: 0.75rem;
      color: var(--cd-color-text-muted);
    }

    .desc {
      font-size: var(--cd-font-size-sm);
      color: var(--cd-color-text-muted);
      line-height: 1.4;
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

    .badge.model {
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
    this.bodiesPromise = import('@/data/agent-bodies.ts').then((mod) => {
      const map = new Map<string, string>();
      for (const [id, value] of Object.entries(mod.AGENT_BODIES)) map.set(id, value.body);
      this.bodies = map;
    });
  }

  private handleDetailsToggle(event: Event): void {
    if ((event.target as HTMLDetailsElement).open) this.ensureBodiesLoaded();
  }

  private toggleAgent(id: string, checked: boolean): void {
    const next = checked
      ? [...this.selected, id]
      : this.selected.filter((existing) => existing !== id);
    this.dispatchEvent(
      new CustomEvent('agent-templates-change', {
        detail: next,
        bubbles: true,
        composed: true,
      }) satisfies AgentTemplatesChangeEvent,
    );
  }

  override render(): TemplateResult {
    return html`
      <p class="intro">
        Sub-agentes que viajarán como <code>.claude/agents/*.md</code> en el bundle. Claude los
        delega automáticamente según la <code>description</code> del frontmatter.
      </p>
      <div class="list">${AGENT_TEMPLATES.map((agent) => this.renderAgentItem(agent))}</div>
    `;
  }

  private renderAgentItem(agent: AgentMetadata): TemplateResult {
    const checked = this.selected.includes(agent.id);
    const body = this.bodies?.get(agent.id);
    return html`
      <article class="item">
        <label class="row">
          <input
            type="checkbox"
            .checked=${checked}
            @change=${(e: Event) =>
              this.toggleAgent(agent.id, (e.target as HTMLInputElement).checked)}
          />
          <span class="meta">
            <span class="name">${agent.label}</span>
            <span class="desc">${agent.description}</span>
            <span class="slug">${agent.name}.md</span>
          </span>
          <span class="badges">
            ${agent.model ? html`<span class="badge model">${agent.model}</span>` : null}
            ${agent.tools && agent.tools.length > 0
              ? html`<span class="badge">${agent.tools.length} tools</span>`
              : null}
          </span>
        </label>
        <details class="preview" @toggle=${this.handleDetailsToggle}>
          <summary>Ver system prompt</summary>
          <pre>${body ?? 'Cargando…'}</pre>
        </details>
      </article>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cd-step-agents': CdStepAgents;
  }
  interface HTMLElementEventMap {
    'agent-templates-change': AgentTemplatesChangeEvent;
  }
}
