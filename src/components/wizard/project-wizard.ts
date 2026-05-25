import { LitElement, html, css, type PropertyValues, type TemplateResult } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { INITIAL_WIZARD_STATE, type WizardState } from '@/data/wizard-state.ts';
import { STARTER_PACKS, type StarterPack } from '@/data/starter-packs.ts';
import { suggestScripts } from '@/data/script-defaults.ts';
import type { Prompt } from '@/data/prompt.ts';
import { generateClaudeMd } from '@/services/md-generator.service.ts';
import { exportClaudeBundle, generateSettings } from '@/services/export.service.ts';
import {
  buildShareUrl,
  clearShareLinkHash,
  decodeShareLink,
  encodeShareLink,
  readShareLinkFromHash,
} from '@/services/share-link.service.ts';
import { loadWizardState, saveWizardState } from '@/services/wizard-state.service.ts';
import { listPrompts } from '@/services/prompts.service.ts';
import {
  deletePreset,
  listPresets,
  savePreset,
  type WizardPreset,
} from '@/services/presets.service.ts';
import '../ui/token-counter.ts';
import './step-project-type.ts';
import type { ProjectTypeChangeEvent } from './step-project-type.ts';
import './step-stack.ts';
import type { TechStackChangeEvent } from './step-stack.ts';
import './step-conventions.ts';
import type { ConventionsChangeEvent } from './step-conventions.ts';
import './step-testing.ts';
import type { TestingChangeEvent } from './step-testing.ts';
import './step-description.ts';
import type { DescriptionChangeEvent } from './step-description.ts';
import './step-scripts.ts';
import type { ScriptsChangeEvent } from './step-scripts.ts';
import './step-commands.ts';
import type {
  CommandTemplatesChangeEvent,
  CustomPromptCommandsChangeEvent,
} from './step-commands.ts';
import './step-agents.ts';
import type { AgentTemplatesChangeEvent } from './step-agents.ts';
import './step-skills.ts';
import type { SkillTemplatesChangeEvent } from './step-skills.ts';
import './step-mcp.ts';
import type { McpServersChangeEvent } from './step-mcp.ts';
import '../ui/md-preview.ts';

@customElement('cd-project-wizard')
export class CdProjectWizard extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }

    .wizard-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--cd-space-3);
      margin-bottom: var(--cd-space-5);
      flex-wrap: wrap;
    }

    h1 {
      font-size: var(--cd-font-size-xl);
      font-weight: 600;
      margin: 0;
    }

    .toolbar-actions {
      display: flex;
      gap: var(--cd-space-2);
      flex-wrap: wrap;
    }

    .reset-btn {
      padding: var(--cd-space-2) var(--cd-space-4);
      border: 1px solid var(--cd-color-border);
      border-radius: var(--cd-radius-md);
      background-color: transparent;
      color: var(--cd-color-text-muted);
      font-size: var(--cd-font-size-sm);
      font-weight: 500;
      cursor: pointer;
      transition:
        border-color 0.15s ease,
        color 0.15s ease;
    }

    .reset-btn:hover {
      border-color: var(--cd-color-accent);
      color: var(--cd-color-text);
    }

    dialog.presets-dialog {
      max-width: 32rem;
      width: 100%;
      padding: var(--cd-space-5);
      border: 1px solid var(--cd-color-border);
      border-radius: var(--cd-radius-md);
      background-color: var(--cd-color-bg);
      color: var(--cd-color-text);
    }

    dialog.presets-dialog::backdrop {
      background-color: rgba(0, 0, 0, 0.5);
    }

    .presets-dialog h3 {
      margin: 0 0 var(--cd-space-4);
      font-size: var(--cd-font-size-lg);
    }

    .presets-list {
      display: flex;
      flex-direction: column;
      gap: var(--cd-space-2);
      max-height: 16rem;
      overflow-y: auto;
      margin-bottom: var(--cd-space-4);
    }

    .preset-item {
      display: grid;
      grid-template-columns: 1fr auto auto;
      gap: var(--cd-space-2);
      align-items: center;
      padding: var(--cd-space-2) var(--cd-space-3);
      border: 1px solid var(--cd-color-border);
      border-radius: var(--cd-radius-md);
      background-color: var(--cd-color-bg-elevated);
    }

    .preset-meta {
      min-width: 0;
    }

    .preset-name {
      font-weight: 600;
      font-size: var(--cd-font-size-sm);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .preset-date {
      font-size: 0.75rem;
      color: var(--cd-color-text-muted);
    }

    .preset-btn {
      padding: var(--cd-space-1) var(--cd-space-3);
      border-radius: var(--cd-radius-sm);
      font-size: var(--cd-font-size-sm);
      cursor: pointer;
      transition:
        border-color 0.15s ease,
        background-color 0.15s ease,
        color 0.15s ease;
    }

    .preset-btn.load {
      border: 1px solid var(--cd-color-border);
      background-color: transparent;
      color: var(--cd-color-text);
    }

    .preset-btn.load:hover {
      border-color: var(--cd-color-accent);
    }

    .preset-btn.delete {
      border: 1px solid color-mix(in srgb, var(--cd-color-danger) 50%, var(--cd-color-border));
      background-color: transparent;
      color: var(--cd-color-danger);
    }

    .preset-btn.delete:hover {
      background-color: color-mix(in srgb, var(--cd-color-danger) 12%, transparent);
    }

    .presets-empty {
      padding: var(--cd-space-5);
      text-align: center;
      color: var(--cd-color-text-muted);
      border: 1px dashed var(--cd-color-border);
      border-radius: var(--cd-radius-md);
      margin-bottom: var(--cd-space-4);
      font-size: var(--cd-font-size-sm);
    }

    .save-form {
      display: flex;
      gap: var(--cd-space-2);
      padding-top: var(--cd-space-4);
      border-top: 1px solid var(--cd-color-border);
    }

    .save-form input {
      box-sizing: border-box;
      flex: 1;
      min-width: 0;
      padding: var(--cd-space-2) var(--cd-space-3);
      border: 1px solid var(--cd-color-border);
      border-radius: var(--cd-radius-md);
      background-color: var(--cd-color-bg-elevated);
      color: var(--cd-color-text);
      font-family: var(--cd-font-sans);
      font-size: var(--cd-font-size-sm);
    }

    .save-form input:focus {
      outline: none;
      border-color: var(--cd-color-accent);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--cd-color-accent) 25%, transparent);
    }

    .save-form button {
      padding: var(--cd-space-2) var(--cd-space-4);
      border: 0;
      border-radius: var(--cd-radius-md);
      background-color: var(--cd-color-accent);
      color: var(--cd-color-accent-contrast);
      font-size: var(--cd-font-size-sm);
      font-weight: 500;
      cursor: pointer;
      transition: opacity 0.15s ease;
    }

    .save-form button:hover:not(:disabled) {
      opacity: 0.9;
    }

    .save-form button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .dialog-close {
      margin-top: var(--cd-space-4);
      width: 100%;
      padding: var(--cd-space-2) var(--cd-space-4);
      border: 1px solid var(--cd-color-border);
      border-radius: var(--cd-radius-md);
      background-color: transparent;
      color: var(--cd-color-text-muted);
      font-size: var(--cd-font-size-sm);
      cursor: pointer;
    }

    .dialog-close:hover {
      border-color: var(--cd-color-accent);
      color: var(--cd-color-text);
    }

    dialog.packs-dialog {
      max-width: 36rem;
      width: 100%;
      padding: var(--cd-space-5);
      border: 1px solid var(--cd-color-border);
      border-radius: var(--cd-radius-md);
      background-color: var(--cd-color-bg);
      color: var(--cd-color-text);
    }

    dialog.packs-dialog::backdrop {
      background-color: rgba(0, 0, 0, 0.5);
    }

    .packs-dialog h3 {
      margin: 0 0 var(--cd-space-2);
      font-size: var(--cd-font-size-lg);
    }

    .packs-dialog .lead {
      margin: 0 0 var(--cd-space-4);
      font-size: var(--cd-font-size-sm);
      color: var(--cd-color-text-muted);
    }

    .pack-list {
      display: grid;
      gap: var(--cd-space-3);
      max-height: 24rem;
      overflow-y: auto;
    }

    .pack-card {
      text-align: left;
      width: 100%;
      padding: var(--cd-space-3) var(--cd-space-4);
      border: 1px solid var(--cd-color-border);
      border-radius: var(--cd-radius-md);
      background-color: var(--cd-color-bg-elevated);
      color: var(--cd-color-text);
      cursor: pointer;
      transition:
        border-color 0.15s ease,
        background-color 0.15s ease;
    }

    .pack-card:hover {
      border-color: var(--cd-color-accent);
      background-color: color-mix(in srgb, var(--cd-color-accent) 6%, var(--cd-color-bg-elevated));
    }

    .pack-name {
      font-weight: 600;
      font-size: var(--cd-font-size-sm);
      margin-bottom: var(--cd-space-1);
    }

    .pack-desc {
      font-size: var(--cd-font-size-sm);
      color: var(--cd-color-text-muted);
      line-height: 1.4;
    }

    .layout {
      display: grid;
      gap: var(--cd-space-5);
    }

    @media (min-width: 960px) {
      .layout {
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      }
    }

    .accordion {
      display: flex;
      flex-direction: column;
      gap: var(--cd-space-3);
    }

    details {
      border: 1px solid var(--cd-color-border);
      border-radius: var(--cd-radius-md);
      background-color: var(--cd-color-bg-elevated);
      overflow: hidden;
    }

    summary {
      list-style: none;
      cursor: pointer;
      padding: var(--cd-space-3) var(--cd-space-4);
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: var(--cd-space-3);
    }

    summary::-webkit-details-marker {
      display: none;
    }

    summary::before {
      content: '';
      width: 0.6em;
      height: 0.6em;
      border-right: 2px solid currentColor;
      border-bottom: 2px solid currentColor;
      transform: rotate(-45deg);
      transition: transform 0.15s ease;
    }

    details[open] summary::before {
      transform: rotate(45deg);
    }

    .step-number {
      flex: 0 0 auto;
      width: 1.6em;
      height: 1.6em;
      display: inline-grid;
      place-items: center;
      border-radius: 999px;
      background-color: var(--cd-color-bg);
      border: 1px solid var(--cd-color-border);
      font-size: var(--cd-font-size-sm);
      font-weight: 600;
      color: var(--cd-color-text-muted);
    }

    .step-title {
      flex: 1;
    }

    .step-status {
      font-size: var(--cd-font-size-sm);
      font-weight: 400;
      color: var(--cd-color-text-muted);
    }

    .step-body {
      padding: var(--cd-space-4);
      border-top: 1px solid var(--cd-color-border);
      background-color: var(--cd-color-bg);
    }

    .preview-pane {
      display: flex;
      flex-direction: column;
      border: 1px solid var(--cd-color-border);
      border-radius: var(--cd-radius-md);
      background-color: var(--cd-color-bg-elevated);
      overflow: hidden;
      min-height: 24rem;
    }

    @media (min-width: 960px) {
      .preview-pane {
        position: sticky;
        top: var(--cd-space-3);
        align-self: start;
        max-height: calc(100svh - var(--cd-space-7));
      }
    }

    .preview-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--cd-space-3) var(--cd-space-4);
      border-bottom: 1px solid var(--cd-color-border);
    }

    .preview-header h2 {
      font-size: var(--cd-font-size-base);
      font-weight: 600;
    }

    .preview-title {
      display: flex;
      align-items: baseline;
      gap: var(--cd-space-2);
    }

    .download-actions {
      display: flex;
      gap: var(--cd-space-2);
      flex-wrap: wrap;
    }

    .download-btn {
      padding: var(--cd-space-2) var(--cd-space-4);
      border-radius: var(--cd-radius-md);
      font-size: var(--cd-font-size-sm);
      font-weight: 500;
      cursor: pointer;
      transition:
        opacity 0.15s ease,
        background-color 0.15s ease,
        border-color 0.15s ease;
    }

    .download-btn.primary {
      border: 0;
      background-color: var(--cd-color-accent);
      color: var(--cd-color-accent-contrast);
    }

    .download-btn.primary:hover {
      opacity: 0.9;
    }

    .download-btn.secondary {
      border: 1px solid var(--cd-color-border);
      background-color: transparent;
      color: var(--cd-color-text);
    }

    .download-btn.secondary:hover {
      border-color: var(--cd-color-accent);
    }

    .download-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .preview-tabs {
      display: inline-flex;
      gap: 0;
      padding: 2px;
      border: 1px solid var(--cd-color-border);
      border-radius: var(--cd-radius-md);
      background-color: var(--cd-color-bg);
    }

    .preview-tab {
      padding: var(--cd-space-1) var(--cd-space-3);
      border: 0;
      border-radius: calc(var(--cd-radius-md) - 2px);
      background-color: transparent;
      color: var(--cd-color-text-muted);
      font-family: var(--cd-font-mono);
      font-size: 0.75rem;
      cursor: pointer;
      transition:
        background-color 0.15s ease,
        color 0.15s ease;
    }

    .preview-tab[aria-selected='true'] {
      background-color: var(--cd-color-accent);
      color: var(--cd-color-accent-contrast);
    }

    .preview-tab:not([aria-selected='true']):hover {
      color: var(--cd-color-text);
    }

    .json-preview {
      flex: 1;
      margin: 0;
      padding: var(--cd-space-4);
      overflow: auto;
      font-family: var(--cd-font-mono);
      font-size: var(--cd-font-size-sm);
      line-height: 1.5;
      color: var(--cd-color-text);
      background-color: var(--cd-color-bg);
      white-space: pre;
      tab-size: 2;
    }
  `;

  @state()
  private wizardState: WizardState = loadWizardState();

  @state()
  private presets: readonly WizardPreset[] = [];

  @state()
  private presetsDialogOpen = false;

  @state()
  private newPresetName = '';

  @state()
  private packsDialogOpen = false;

  @state()
  private availablePrompts: readonly Prompt[] = [];

  @state()
  private previewMode: 'markdown' | 'settings' = 'markdown';

  @state()
  private shareButtonState: 'idle' | 'copied' | 'error' = 'idle';

  private shareResetTimer?: ReturnType<typeof setTimeout>;

  @query('dialog.presets-dialog')
  private presetsDialog?: HTMLDialogElement;

  @query('dialog.packs-dialog')
  private packsDialog?: HTMLDialogElement;

  override connectedCallback(): void {
    super.connectedCallback();
    this.availablePrompts = listPrompts();
    this.tryLoadFromHash();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this.shareResetTimer !== undefined) {
      clearTimeout(this.shareResetTimer);
      this.shareResetTimer = undefined;
    }
  }

  private async tryLoadFromHash(): Promise<void> {
    const encoded = readShareLinkFromHash();
    if (!encoded) return;
    const shared = await decodeShareLink(encoded);
    if (!shared) {
      clearShareLinkHash();
      return;
    }
    if (this.wizardHasContent()) {
      const ok = confirm(
        'Esta URL trae una configuración compartida del wizard. ¿Cargarla? Se sobreescribirá tu wizard actual.',
      );
      if (!ok) {
        clearShareLinkHash();
        return;
      }
    }
    this.wizardState = shared;
    clearShareLinkHash();
  }

  private wizardHasContent(): boolean {
    const s = this.wizardState;
    return (
      s.projectName.trim() !== '' ||
      s.techStack.length > 0 ||
      s.commands.length > 0 ||
      s.description.trim() !== '' ||
      s.restrictions.trim() !== '' ||
      s.commandTemplates.length > 0 ||
      s.customPromptCommands.length > 0 ||
      s.agentTemplates.length > 0 ||
      s.skillTemplates.length > 0 ||
      s.mcpServers.length > 0 ||
      Object.values(s.conventions).some((v) => v) ||
      s.testing.frameworks.length > 0 ||
      s.testing.strategies.length > 0
    );
  }

  override updated(changed: PropertyValues): void {
    if (changed.has('wizardState')) {
      saveWizardState(this.wizardState);
    }
    if (changed.has('presetsDialogOpen')) {
      if (this.presetsDialogOpen && this.presetsDialog && !this.presetsDialog.open) {
        this.presetsDialog.showModal();
      } else if (!this.presetsDialogOpen && this.presetsDialog?.open) {
        this.presetsDialog.close();
      }
    }
    if (changed.has('packsDialogOpen')) {
      if (this.packsDialogOpen && this.packsDialog && !this.packsDialog.open) {
        this.packsDialog.showModal();
      } else if (!this.packsDialogOpen && this.packsDialog?.open) {
        this.packsDialog.close();
      }
    }
  }

  private get markdown(): string {
    return generateClaudeMd(this.wizardState);
  }

  private get settingsJson(): string {
    return JSON.stringify(generateSettings(this.wizardState), null, 2);
  }

  private handleProjectTypeChange(event: ProjectTypeChangeEvent): void {
    this.wizardState = { ...this.wizardState, projectType: event.detail };
  }

  private handleTechStackChange(event: TechStackChangeEvent): void {
    this.wizardState = { ...this.wizardState, techStack: event.detail };
  }

  private handleConventionsChange(event: ConventionsChangeEvent): void {
    this.wizardState = { ...this.wizardState, conventions: event.detail };
  }

  private handleTestingChange(event: TestingChangeEvent): void {
    this.wizardState = { ...this.wizardState, testing: event.detail };
  }

  private handleDescriptionChange(event: DescriptionChangeEvent): void {
    const { projectName, description, restrictions, hardenedPermissions } = event.detail;
    this.wizardState = {
      ...this.wizardState,
      projectName,
      description,
      restrictions,
      hardenedPermissions,
    };
  }

  private handleScriptsChange(event: ScriptsChangeEvent): void {
    this.wizardState = { ...this.wizardState, commands: event.detail };
  }

  private handleCommandTemplatesChange(event: CommandTemplatesChangeEvent): void {
    this.wizardState = { ...this.wizardState, commandTemplates: event.detail };
  }

  private handleCustomPromptCommandsChange(event: CustomPromptCommandsChangeEvent): void {
    this.wizardState = { ...this.wizardState, customPromptCommands: event.detail };
  }

  private handleAgentTemplatesChange(event: AgentTemplatesChangeEvent): void {
    this.wizardState = { ...this.wizardState, agentTemplates: event.detail };
  }

  private handleSkillTemplatesChange(event: SkillTemplatesChangeEvent): void {
    this.wizardState = { ...this.wizardState, skillTemplates: event.detail };
  }

  private handleMcpServersChange(event: McpServersChangeEvent): void {
    this.wizardState = { ...this.wizardState, mcpServers: event.detail };
  }

  private handleReset(): void {
    const ok = confirm('¿Empezar de cero? Se perderá todo lo que tienes en el wizard.');
    if (!ok) return;
    this.wizardState = INITIAL_WIZARD_STATE;
  }

  private openPacksDialog(): void {
    this.packsDialogOpen = true;
  }

  private closePacksDialog(): void {
    this.packsDialogOpen = false;
  }

  private handleLoadPack(pack: StarterPack): void {
    if (this.wizardHasContent()) {
      const ok = confirm(
        `Cargar la plantilla "${pack.name}" sobrescribirá el contenido actual del wizard. ¿Continuar?`,
      );
      if (!ok) return;
    }
    this.wizardState = { ...INITIAL_WIZARD_STATE, ...pack.state };
    this.packsDialogOpen = false;
  }

  private openPresetsDialog(): void {
    this.presets = listPresets();
    this.newPresetName = '';
    this.presetsDialogOpen = true;
  }

  private closePresetsDialog(): void {
    this.presetsDialogOpen = false;
  }

  private handleLoadPreset(preset: WizardPreset): void {
    this.wizardState = { ...INITIAL_WIZARD_STATE, ...preset.state };
    this.presetsDialogOpen = false;
  }

  private handleDeletePreset(preset: WizardPreset): void {
    const ok = confirm(`¿Eliminar el preset "${preset.name}"?`);
    if (!ok) return;
    deletePreset(preset.id);
    this.presets = listPresets();
  }

  private handleSavePreset(event: Event): void {
    event.preventDefault();
    const name = this.newPresetName.trim();
    if (!name) return;
    const existing = this.presets.find((p) => p.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      const ok = confirm(`Ya existe un preset llamado "${existing.name}". ¿Sobrescribirlo?`);
      if (!ok) return;
    }
    savePreset(name, this.wizardState);
    this.presets = listPresets();
    this.newPresetName = '';
  }

  private formatDate(timestamp: number): string {
    const d = new Date(timestamp);
    return d.toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  private renderPresetsList(): TemplateResult {
    if (this.presets.length === 0) {
      return html`
        <div class="presets-empty">
          Todavía no tienes presets. Configura el wizard y guárdalo abajo.
        </div>
      `;
    }
    return html`
      <div class="presets-list" role="list">
        ${this.presets.map(
          (preset) => html`
            <div class="preset-item" role="listitem">
              <div class="preset-meta">
                <div class="preset-name">${preset.name}</div>
                <div class="preset-date">${this.formatDate(preset.updatedAt)}</div>
              </div>
              <button
                class="preset-btn load"
                type="button"
                @click=${() => this.handleLoadPreset(preset)}
              >
                Cargar
              </button>
              <button
                class="preset-btn delete"
                type="button"
                @click=${() => this.handleDeletePreset(preset)}
              >
                Eliminar
              </button>
            </div>
          `,
        )}
      </div>
    `;
  }

  private handleDownload(): void {
    this.triggerDownload(
      new Blob([this.markdown], { type: 'text/markdown;charset=utf-8' }),
      'CLAUDE.md',
    );
  }

  private async handleDownloadBundle(): Promise<void> {
    const blob = await exportClaudeBundle(this.wizardState);
    this.triggerDownload(blob, 'claude-bundle.zip');
  }

  private async handleShare(): Promise<void> {
    try {
      const encoded = await encodeShareLink(this.wizardState);
      const url = buildShareUrl(encoded);
      await navigator.clipboard.writeText(url);
      this.setShareState('copied');
    } catch {
      this.setShareState('error');
    }
  }

  private setShareState(next: 'copied' | 'error'): void {
    this.shareButtonState = next;
    if (this.shareResetTimer !== undefined) clearTimeout(this.shareResetTimer);
    this.shareResetTimer = setTimeout(() => {
      this.shareButtonState = 'idle';
      this.shareResetTimer = undefined;
    }, 2000);
  }

  private triggerDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  override render(): TemplateResult {
    return html`
      <header class="wizard-toolbar">
        <h1>Generador de CLAUDE.md</h1>
        <div class="toolbar-actions">
          <button class="reset-btn" type="button" @click=${this.openPacksDialog}>
            Plantillas
          </button>
          <button class="reset-btn" type="button" @click=${this.openPresetsDialog}>
            Presets
          </button>
          <button
            class="reset-btn"
            type="button"
            @click=${this.handleShare}
            title="Copia una URL con el wizard codificado en el hash"
          >
            ${this.shareButtonState === 'copied'
              ? '✓ URL copiada'
              : this.shareButtonState === 'error'
                ? 'Error al copiar'
                : 'Compartir URL'}
          </button>
          <button class="reset-btn" type="button" @click=${this.handleReset}>
            Empezar de cero
          </button>
        </div>
      </header>

      <dialog
        class="packs-dialog"
        @cancel=${this.closePacksDialog}
        @close=${() => (this.packsDialogOpen = false)}
      >
        <h3>Plantillas de proyecto</h3>
        <p class="lead">
          Rellena el wizard con valores típicos para un tipo de proyecto concreto. Después podrás
          ajustarlo.
        </p>
        <div class="pack-list" role="list">
          ${STARTER_PACKS.map(
            (pack) => html`
              <button
                class="pack-card"
                type="button"
                role="listitem"
                @click=${() => this.handleLoadPack(pack)}
              >
                <div class="pack-name">${pack.name}</div>
                <div class="pack-desc">${pack.description}</div>
              </button>
            `,
          )}
        </div>
        <button class="dialog-close" type="button" @click=${this.closePacksDialog}>
          Cerrar
        </button>
      </dialog>

      <dialog
        class="presets-dialog"
        @cancel=${this.closePresetsDialog}
        @close=${() => (this.presetsDialogOpen = false)}
      >
        <h3>Presets del wizard</h3>
        ${this.renderPresetsList()}
        <form class="save-form" @submit=${this.handleSavePreset}>
          <input
            type="text"
            placeholder="Nombre del preset (ej. React + Vite)"
            aria-label="Nombre del preset"
            .value=${this.newPresetName}
            @input=${(e: Event) => (this.newPresetName = (e.target as HTMLInputElement).value)}
          />
          <button type="submit" ?disabled=${this.newPresetName.trim().length === 0}>
            Guardar estado actual
          </button>
        </form>
        <button class="dialog-close" type="button" @click=${this.closePresetsDialog}>
          Cerrar
        </button>
      </dialog>

      <div class="layout">
        <div class="accordion">
          ${this.renderProjectTypeSection()} ${this.renderStackSection()}
          ${this.renderConventionsSection()} ${this.renderTestingSection()}
          ${this.renderDescriptionSection()} ${this.renderScriptsSection()}
          ${this.renderAgentsSection()} ${this.renderSkillsSection()}
          ${this.renderMcpSection()} ${this.renderCommandsSection()}
        </div>

        <aside class="preview-pane" aria-label="Vista previa del bundle generado">
          <header class="preview-header">
            <div class="preview-title">
              <h2>Vista previa</h2>
              <div class="preview-tabs" role="tablist">
                <button
                  class="preview-tab"
                  type="button"
                  role="tab"
                  aria-selected=${this.previewMode === 'markdown'}
                  @click=${() => (this.previewMode = 'markdown')}
                >
                  CLAUDE.md
                </button>
                <button
                  class="preview-tab"
                  type="button"
                  role="tab"
                  aria-selected=${this.previewMode === 'settings'}
                  @click=${() => (this.previewMode = 'settings')}
                >
                  settings.json
                </button>
              </div>
              <cd-token-counter
                .text=${this.previewMode === 'markdown' ? this.markdown : this.settingsJson}
              ></cd-token-counter>
            </div>
            <div class="download-actions">
              <button
                class="download-btn secondary"
                type="button"
                @click=${this.handleDownload}
                title="Solo el fichero CLAUDE.md"
              >
                Solo CLAUDE.md
              </button>
              <button
                class="download-btn primary"
                type="button"
                @click=${this.handleDownloadBundle}
                title="Carpeta .claude/ completa (zip con CLAUDE.md + settings.json)"
              >
                Descargar .claude/
              </button>
            </div>
          </header>
          ${this.previewMode === 'markdown'
            ? html`<cd-md-preview .value=${this.markdown}></cd-md-preview>`
            : html`<pre class="json-preview" aria-label="settings.json generado"><code>${this.settingsJson}</code></pre>`}
        </aside>
      </div>
    `;
  }

  private renderProjectTypeSection(): TemplateResult {
    const status = this.wizardState.projectType ? '✓ definido' : 'sin seleccionar';
    return html`
      <details open>
        <summary>
          <span class="step-number">1</span>
          <span class="step-title">Tipo de proyecto</span>
          <span class="step-status">${status}</span>
        </summary>
        <div class="step-body">
          <cd-step-project-type
            .selected=${this.wizardState.projectType}
            @project-type-change=${this.handleProjectTypeChange}
          ></cd-step-project-type>
        </div>
      </details>
    `;
  }

  private renderStackSection(): TemplateResult {
    const count = this.wizardState.techStack.length;
    const status = count > 0 ? `${count} seleccionado${count === 1 ? '' : 's'}` : 'sin seleccionar';
    return html`
      <details>
        <summary>
          <span class="step-number">2</span>
          <span class="step-title">Stack tecnológico</span>
          <span class="step-status">${status}</span>
        </summary>
        <div class="step-body">
          <cd-step-stack
            .selected=${this.wizardState.techStack}
            @tech-stack-change=${this.handleTechStackChange}
          ></cd-step-stack>
        </div>
      </details>
    `;
  }

  private renderConventionsSection(): TemplateResult {
    const filled = Object.values(this.wizardState.conventions).filter((v) => v).length;
    const status = filled > 0 ? `${filled} de 4 categorías` : 'sin definir';
    return html`
      <details>
        <summary>
          <span class="step-number">3</span>
          <span class="step-title">Convenciones</span>
          <span class="step-status">${status}</span>
        </summary>
        <div class="step-body">
          <cd-step-conventions
            .selected=${this.wizardState.conventions}
            @conventions-change=${this.handleConventionsChange}
          ></cd-step-conventions>
        </div>
      </details>
    `;
  }

  private renderTestingSection(): TemplateResult {
    const { frameworks, strategies, coverage } = this.wizardState.testing;
    const hasCoverage = coverage !== null && coverage !== 'none';
    const total = frameworks.length + strategies.length + (hasCoverage ? 1 : 0);
    const status = total > 0 ? `${total} elemento${total === 1 ? '' : 's'}` : 'sin definir';
    return html`
      <details>
        <summary>
          <span class="step-number">4</span>
          <span class="step-title">Testing</span>
          <span class="step-status">${status}</span>
        </summary>
        <div class="step-body">
          <cd-step-testing
            .selected=${this.wizardState.testing}
            @testing-change=${this.handleTestingChange}
          ></cd-step-testing>
        </div>
      </details>
    `;
  }

  private renderScriptsSection(): TemplateResult {
    const count = this.wizardState.commands.filter((s) => s.cmd.trim().length > 0).length;
    const status = count > 0 ? `${count} script${count === 1 ? '' : 's'}` : 'sin definir';
    return html`
      <details>
        <summary>
          <span class="step-number">6</span>
          <span class="step-title">Scripts / comandos del proyecto</span>
          <span class="step-status">${status}</span>
        </summary>
        <div class="step-body">
          <cd-step-scripts
            .scripts=${this.wizardState.commands}
            .suggestions=${suggestScripts(this.wizardState)}
            @scripts-change=${this.handleScriptsChange}
          ></cd-step-scripts>
        </div>
      </details>
    `;
  }

  private renderAgentsSection(): TemplateResult {
    const count = this.wizardState.agentTemplates.length;
    const status = count > 0 ? `${count} agente${count === 1 ? '' : 's'}` : 'sin seleccionar';
    return html`
      <details>
        <summary>
          <span class="step-number">7</span>
          <span class="step-title">Sub-agentes</span>
          <span class="step-status">${status}</span>
        </summary>
        <div class="step-body">
          <cd-step-agents
            .selected=${this.wizardState.agentTemplates}
            @agent-templates-change=${this.handleAgentTemplatesChange}
          ></cd-step-agents>
        </div>
      </details>
    `;
  }

  private renderSkillsSection(): TemplateResult {
    const count = this.wizardState.skillTemplates.length;
    const status = count > 0 ? `${count} skill${count === 1 ? '' : 's'}` : 'sin seleccionar';
    return html`
      <details>
        <summary>
          <span class="step-number">8</span>
          <span class="step-title">Skills</span>
          <span class="step-status">${status}</span>
        </summary>
        <div class="step-body">
          <cd-step-skills
            .selected=${this.wizardState.skillTemplates}
            @skill-templates-change=${this.handleSkillTemplatesChange}
          ></cd-step-skills>
        </div>
      </details>
    `;
  }

  private renderMcpSection(): TemplateResult {
    const count = this.wizardState.mcpServers.length;
    const status = count > 0 ? `${count} server${count === 1 ? '' : 's'}` : 'sin seleccionar';
    return html`
      <details>
        <summary>
          <span class="step-number">9</span>
          <span class="step-title">MCP servers</span>
          <span class="step-status">${status}</span>
        </summary>
        <div class="step-body">
          <cd-step-mcp
            .selected=${this.wizardState.mcpServers}
            @mcp-servers-change=${this.handleMcpServersChange}
          ></cd-step-mcp>
        </div>
      </details>
    `;
  }

  private renderCommandsSection(): TemplateResult {
    const templates = this.wizardState.commandTemplates.length;
    const prompts = this.wizardState.customPromptCommands.length;
    const total = templates + prompts;
    const status =
      total > 0
        ? `${templates} plantilla${templates === 1 ? '' : 's'} · ${prompts} prompt${prompts === 1 ? '' : 's'}`
        : 'sin seleccionar';
    return html`
      <details>
        <summary>
          <span class="step-number">10</span>
          <span class="step-title">Slash commands para Claude</span>
          <span class="step-status">${status}</span>
        </summary>
        <div class="step-body">
          <cd-step-commands
            .selected=${this.wizardState.commandTemplates}
            .selectedPrompts=${this.wizardState.customPromptCommands}
            .availablePrompts=${this.availablePrompts}
            @command-templates-change=${this.handleCommandTemplatesChange}
            @custom-prompt-commands-change=${this.handleCustomPromptCommandsChange}
          ></cd-step-commands>
        </div>
      </details>
    `;
  }

  private renderDescriptionSection(): TemplateResult {
    const { projectName, description, restrictions } = this.wizardState;
    const filled = [projectName, description, restrictions].filter(
      (v) => v.trim().length > 0,
    ).length;
    const status = filled > 0 ? `${filled} de 3 campos` : 'sin texto';
    return html`
      <details>
        <summary>
          <span class="step-number">5</span>
          <span class="step-title">Funcionalidad y reglas</span>
          <span class="step-status">${status}</span>
        </summary>
        <div class="step-body">
          <cd-step-description
            .values=${{
              projectName: this.wizardState.projectName,
              description: this.wizardState.description,
              restrictions: this.wizardState.restrictions,
              hardenedPermissions: this.wizardState.hardenedPermissions,
            }}
            @description-change=${this.handleDescriptionChange}
          ></cd-step-description>
        </div>
      </details>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cd-project-wizard': CdProjectWizard;
  }
}
