import { LitElement, html, css, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import {
  applyTheme,
  cycleTheme,
  loadTheme,
  saveTheme,
  type Theme,
} from '@/services/theme.service.ts';
import '../wizard/project-wizard.ts';
import '../prompts/prompts-view.ts';

type View = 'wizard' | 'prompts';

const THEME_LABELS: Record<Theme, string> = {
  auto: 'Auto',
  light: 'Claro',
  dark: 'Oscuro',
};

@customElement('cd-app-shell')
export class CdAppShell extends LitElement {
  static override styles = css`
    :host {
      display: grid;
      grid-template-rows: auto 1fr;
      min-height: 100svh;
      color: var(--cd-color-text);
      background-color: var(--cd-color-bg);
    }

    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--cd-space-4);
      padding: var(--cd-space-3) var(--cd-space-5);
      border-bottom: 1px solid var(--cd-color-border);
      background-color: var(--cd-color-bg-elevated);
    }

    .brand {
      font-size: var(--cd-font-size-lg);
      font-weight: 600;
      letter-spacing: -0.01em;
    }

    nav {
      display: flex;
      gap: var(--cd-space-2);
    }

    nav button {
      padding: var(--cd-space-2) var(--cd-space-4);
      border: 1px solid var(--cd-color-border);
      border-radius: var(--cd-radius-md);
      background-color: transparent;
      color: var(--cd-color-text);
      font-size: var(--cd-font-size-sm);
      transition: background-color 0.15s ease;
    }

    nav button:hover {
      background-color: var(--cd-color-bg);
    }

    nav button[aria-current='page'] {
      background-color: var(--cd-color-accent);
      color: var(--cd-color-accent-contrast);
      border-color: var(--cd-color-accent);
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: var(--cd-space-3);
    }

    .theme-btn {
      padding: var(--cd-space-1) var(--cd-space-3);
      border: 1px solid var(--cd-color-border);
      border-radius: var(--cd-radius-md);
      background-color: transparent;
      color: var(--cd-color-text-muted);
      font-size: var(--cd-font-size-sm);
      cursor: pointer;
      transition:
        border-color 0.15s ease,
        color 0.15s ease;
    }

    .theme-btn:hover {
      border-color: var(--cd-color-accent);
      color: var(--cd-color-text);
    }

    main {
      padding: var(--cd-space-6) var(--cd-space-5);
    }
  `;

  @state()
  private activeView: View = 'wizard';

  @state()
  private theme: Theme = loadTheme();

  private setView(view: View): void {
    this.activeView = view;
  }

  private toggleTheme(): void {
    const next = cycleTheme(this.theme);
    this.theme = next;
    saveTheme(next);
    applyTheme(next);
  }

  override render(): TemplateResult {
    return html`
      <header>
        <span class="brand">Claude Launchpad</span>
        <div class="header-actions">
          <nav aria-label="Navegación principal">
            <button
              type="button"
              aria-current=${this.activeView === 'wizard' ? 'page' : 'false'}
              @click=${() => this.setView('wizard')}
            >
              Generador
            </button>
            <button
              type="button"
              aria-current=${this.activeView === 'prompts' ? 'page' : 'false'}
              @click=${() => this.setView('prompts')}
            >
              Prompts
            </button>
          </nav>
          <button
            class="theme-btn"
            type="button"
            @click=${this.toggleTheme}
            title="Cambiar tema (Auto → Claro → Oscuro)"
            aria-label="Cambiar tema, actual: ${THEME_LABELS[this.theme]}"
          >
            Tema: ${THEME_LABELS[this.theme]}
          </button>
        </div>
      </header>
      <main>${this.renderActiveView()}</main>
    `;
  }

  private renderActiveView(): TemplateResult {
    switch (this.activeView) {
      case 'wizard':
        return html`<cd-project-wizard></cd-project-wizard>`;
      case 'prompts':
        return html`<cd-prompts-view></cd-prompts-view>`;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cd-app-shell': CdAppShell;
  }
}
