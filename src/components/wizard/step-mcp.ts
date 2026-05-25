import { LitElement, html, css, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { MCP_SERVERS, type McpServer } from '@/data/mcp-servers.ts';

export type McpServersChangeEvent = CustomEvent<readonly string[]>;

@customElement('cd-step-mcp')
export class CdStepMcp extends LitElement {
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

    .key {
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

    .badge.env {
      border-color: color-mix(in srgb, var(--cd-color-warning, #c98a00) 60%, var(--cd-color-border));
      color: var(--cd-color-warning, #c98a00);
    }

    .setup-note {
      margin: 0;
      padding: var(--cd-space-2) var(--cd-space-4);
      border-top: 1px solid var(--cd-color-border);
      background-color: color-mix(in srgb, var(--cd-color-accent) 6%, transparent);
      font-size: var(--cd-font-size-sm);
      line-height: 1.4;
      color: var(--cd-color-text);
    }

    .setup-label {
      display: inline-block;
      font-family: var(--cd-font-mono);
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--cd-color-accent);
      margin-right: var(--cd-space-2);
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
      font-size: 0.8rem;
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

  private toggleServer(id: string, checked: boolean): void {
    const next = checked
      ? [...this.selected, id]
      : this.selected.filter((existing) => existing !== id);
    this.dispatchEvent(
      new CustomEvent('mcp-servers-change', {
        detail: next,
        bubbles: true,
        composed: true,
      }) satisfies McpServersChangeEvent,
    );
  }

  override render(): TemplateResult {
    return html`
      <p class="intro">
        Servers MCP que se añadirán al bloque <code>mcpServers</code> de
        <code>.claude/settings.json</code>. Las notas de setup viajan al
        <code>CLAUDE.md</code> generado.
      </p>
      <div class="list">${MCP_SERVERS.map((server) => this.renderServerItem(server))}</div>
    `;
  }

  private renderServerItem(server: McpServer): TemplateResult {
    const checked = this.selected.includes(server.id);
    const envCount = server.config.env ? Object.keys(server.config.env).length : 0;
    return html`
      <article class="item">
        <label class="row">
          <input
            type="checkbox"
            .checked=${checked}
            @change=${(e: Event) =>
              this.toggleServer(server.id, (e.target as HTMLInputElement).checked)}
          />
          <span class="meta">
            <span class="name">${server.label}</span>
            <span class="desc">${server.description}</span>
            <span class="key">mcpServers.${server.key}</span>
          </span>
          <span class="badges">
            ${envCount > 0 ? html`<span class="badge env">env requerido</span>` : null}
            <span class="badge">${server.config.args.length} args</span>
          </span>
        </label>
        ${server.setupNote
          ? html`<p class="setup-note">
              <span class="setup-label">Setup</span>${server.setupNote}
            </p>`
          : null}
        <details class="preview">
          <summary>Ver config JSON</summary>
          <pre>${JSON.stringify(server.config, null, 2)}</pre>
        </details>
      </article>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cd-step-mcp': CdStepMcp;
  }
  interface HTMLElementEventMap {
    'mcp-servers-change': McpServersChangeEvent;
  }
}
