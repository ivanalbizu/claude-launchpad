import { LitElement, html, css, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { estimateTokens } from '@/services/tokenizer.service.ts';

@customElement('cd-token-counter')
export class CdTokenCounter extends LitElement {
  static override styles = css`
    :host {
      display: inline;
      font-size: var(--cd-font-size-sm);
      color: var(--cd-color-text-muted);
      font-variant-numeric: tabular-nums;
    }
  `;

  @property({ type: String })
  text = '';

  override render(): TemplateResult {
    const tokens = estimateTokens(this.text);
    return html`<span title="Tokens estimados (heurística: caracteres/4)">~${tokens} tok</span>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cd-token-counter': CdTokenCounter;
  }
}
