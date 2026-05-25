import { LitElement, html, css, type PropertyValues, type TemplateResult } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import type { Prompt } from '@/data/prompt.ts';
import {
  createPrompt,
  deletePrompt,
  exportPromptsJson,
  importPromptsJson,
  listPrompts,
  previewImport,
  updatePrompt,
  type ImportStrategy,
} from '@/services/prompts.service.ts';
import './prompt-list.ts';
import './prompt-editor.ts';
import type { PromptSelectEvent } from './prompt-card.ts';
import type {
  PromptDeleteEvent,
  PromptSaveEvent,
} from './prompt-editor.ts';

type SortBy = 'recent' | 'oldest' | 'alpha';

@customElement('cd-prompts-view')
export class CdPromptsView extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }

    h1 {
      font-size: var(--cd-font-size-xl);
      font-weight: 600;
      margin: 0;
    }

    .toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--cd-space-3);
      margin-bottom: var(--cd-space-5);
      flex-wrap: wrap;
    }

    .toolbar-actions {
      display: flex;
      gap: var(--cd-space-2);
      flex-wrap: wrap;
    }

    .toolbar-btn {
      padding: var(--cd-space-2) var(--cd-space-4);
      border-radius: var(--cd-radius-md);
      font-size: var(--cd-font-size-sm);
      font-weight: 500;
      cursor: pointer;
      transition:
        opacity 0.15s ease,
        border-color 0.15s ease,
        background-color 0.15s ease;
    }

    .toolbar-btn.primary {
      border: 0;
      background-color: var(--cd-color-accent);
      color: var(--cd-color-accent-contrast);
    }

    .toolbar-btn.primary:hover {
      opacity: 0.9;
    }

    .toolbar-btn.secondary {
      border: 1px solid var(--cd-color-border);
      background-color: transparent;
      color: var(--cd-color-text);
    }

    .toolbar-btn.secondary:hover {
      border-color: var(--cd-color-accent);
    }

    .toolbar-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    input[type='file'] {
      display: none;
    }

    dialog {
      max-width: 28rem;
      padding: var(--cd-space-5);
      border: 1px solid var(--cd-color-border);
      border-radius: var(--cd-radius-md);
      background-color: var(--cd-color-bg);
      color: var(--cd-color-text);
    }

    dialog::backdrop {
      background-color: rgba(0, 0, 0, 0.5);
    }

    dialog h3 {
      margin: 0 0 var(--cd-space-3);
      font-size: var(--cd-font-size-lg);
    }

    dialog p {
      margin: 0 0 var(--cd-space-4);
      font-size: var(--cd-font-size-sm);
      color: var(--cd-color-text-muted);
      line-height: 1.5;
    }

    .dialog-actions {
      display: flex;
      gap: var(--cd-space-2);
      justify-content: flex-end;
      flex-wrap: wrap;
    }

    .dialog-actions .danger {
      border: 1px solid color-mix(in srgb, var(--cd-color-danger) 50%, var(--cd-color-border));
      background-color: transparent;
      color: var(--cd-color-danger);
    }

    .dialog-actions .danger:hover {
      background-color: color-mix(in srgb, var(--cd-color-danger) 12%, transparent);
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

    .left-pane {
      display: flex;
      flex-direction: column;
      gap: var(--cd-space-4);
    }

    .filter-bar {
      display: flex;
      flex-direction: column;
      gap: var(--cd-space-2);
    }

    .filter-controls {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: var(--cd-space-2);
    }

    .search,
    select.sort {
      box-sizing: border-box;
      padding: var(--cd-space-2) var(--cd-space-3);
      border: 1px solid var(--cd-color-border);
      border-radius: var(--cd-radius-md);
      background-color: var(--cd-color-bg-elevated);
      color: var(--cd-color-text);
      font-family: var(--cd-font-sans);
      font-size: var(--cd-font-size-sm);
      transition: border-color 0.15s ease;
    }

    .search {
      width: 100%;
    }

    .search:focus,
    select.sort:focus {
      outline: none;
      border-color: var(--cd-color-accent);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--cd-color-accent) 25%, transparent);
    }

    .tag-chips {
      display: flex;
      flex-wrap: wrap;
      gap: var(--cd-space-1);
    }

    .chip {
      padding: 2px var(--cd-space-2);
      border: 1px solid var(--cd-color-border);
      border-radius: 999px;
      background-color: var(--cd-color-bg-elevated);
      color: var(--cd-color-text-muted);
      font-size: 0.75rem;
      cursor: pointer;
      transition:
        background-color 0.15s ease,
        border-color 0.15s ease,
        color 0.15s ease;
    }

    .chip:hover {
      border-color: var(--cd-color-accent);
    }

    .chip[aria-pressed='true'] {
      background-color: var(--cd-color-accent);
      border-color: var(--cd-color-accent);
      color: var(--cd-color-accent-contrast);
    }

    .filter-status {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: var(--cd-font-size-sm);
      color: var(--cd-color-text-muted);
    }

    .clear-btn {
      padding: 0;
      border: 0;
      background: none;
      color: var(--cd-color-accent);
      font-size: var(--cd-font-size-sm);
      cursor: pointer;
      text-decoration: underline;
    }

    .clear-btn:hover {
      opacity: 0.8;
    }

    .empty {
      padding: var(--cd-space-6) var(--cd-space-4);
      text-align: center;
      color: var(--cd-color-text-muted);
      border: 1px dashed var(--cd-color-border);
      border-radius: var(--cd-radius-md);
    }

    .empty strong {
      display: block;
      color: var(--cd-color-text);
      margin-bottom: var(--cd-space-2);
    }

    .editor-pane {
      padding: var(--cd-space-4);
      border: 1px solid var(--cd-color-border);
      border-radius: var(--cd-radius-md);
      background-color: var(--cd-color-bg-elevated);
      min-height: 18rem;
    }

    .idle {
      display: grid;
      place-items: center;
      min-height: 14rem;
      color: var(--cd-color-text-muted);
      text-align: center;
    }
  `;

  @state()
  private prompts: readonly Prompt[] = [];

  @state()
  private selectedId: string | null = null;

  @state()
  private editorOpen = false;

  @state()
  private searchQuery = '';

  @state()
  private activeTags: readonly string[] = [];

  @state()
  private sortBy: SortBy = 'recent';

  @state()
  private importPending: { json: string; count: number } | null = null;

  @query('input[type="file"]')
  private fileInput?: HTMLInputElement;

  @query('dialog')
  private dialog?: HTMLDialogElement;

  override updated(changed: PropertyValues): void {
    if (changed.has('importPending')) {
      if (this.importPending && this.dialog && !this.dialog.open) {
        this.dialog.showModal();
      } else if (!this.importPending && this.dialog?.open) {
        this.dialog.close();
      }
    }
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.refresh();
  }

  private refresh(): void {
    this.prompts = listPrompts();
  }

  private get selectedPrompt(): Prompt | null {
    if (this.selectedId === null) return null;
    return this.prompts.find((p) => p.id === this.selectedId) ?? null;
  }

  private get availableTags(): readonly string[] {
    const set = new Set<string>();
    for (const p of this.prompts) {
      for (const tag of p.tags) set.add(tag);
    }
    return [...set].sort((a, b) => a.localeCompare(b, 'es'));
  }

  private get filteredPrompts(): readonly Prompt[] {
    let result: Prompt[] = [...this.prompts];

    const query = this.searchQuery.trim().toLowerCase();
    if (query) {
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(query) || p.content.toLowerCase().includes(query),
      );
    }

    if (this.activeTags.length > 0) {
      result = result.filter((p) => this.activeTags.every((tag) => p.tags.includes(tag)));
    }

    switch (this.sortBy) {
      case 'recent':
        result.sort((a, b) => b.updatedAt - a.updatedAt);
        break;
      case 'oldest':
        result.sort((a, b) => a.updatedAt - b.updatedAt);
        break;
      case 'alpha':
        result.sort((a, b) => a.title.localeCompare(b.title, 'es'));
        break;
    }

    return result;
  }

  private get hasActiveFilters(): boolean {
    return (
      this.searchQuery.trim().length > 0 || this.activeTags.length > 0 || this.sortBy !== 'recent'
    );
  }

  private openNewEditor(): void {
    this.selectedId = null;
    this.editorOpen = true;
  }

  private handleSelect(event: PromptSelectEvent): void {
    this.selectedId = event.detail;
    this.editorOpen = true;
  }

  private handleSave(event: PromptSaveEvent): void {
    const { id, input } = event.detail;
    const saved = id === null ? createPrompt(input) : updatePrompt(id, input);
    if (saved) this.selectedId = saved.id;
    this.refresh();
  }

  private handleCancel(): void {
    this.editorOpen = false;
    this.selectedId = null;
  }

  private handleDelete(event: PromptDeleteEvent): void {
    deletePrompt(event.detail);
    this.editorOpen = false;
    this.selectedId = null;
    this.refresh();
  }

  private toggleTag(tag: string): void {
    this.activeTags = this.activeTags.includes(tag)
      ? this.activeTags.filter((t) => t !== tag)
      : [...this.activeTags, tag];
  }

  private clearFilters(): void {
    this.searchQuery = '';
    this.activeTags = [];
    this.sortBy = 'recent';
  }

  private handleExport(): void {
    const json = exportPromptsJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const date = new Date().toISOString().slice(0, 10);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `claude-launchpad-prompts-${date}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  private triggerImportPicker(): void {
    this.fileInput?.click();
  }

  private async handleImportFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    try {
      const text = await file.text();
      const { count } = previewImport(text);
      this.importPending = { json: text, count };
    } catch (err) {
      alert(err instanceof Error ? err.message : 'No se pudo leer el fichero.');
    }
  }

  private cancelImport(): void {
    this.importPending = null;
  }

  private confirmImport(strategy: ImportStrategy): void {
    if (!this.importPending) return;
    try {
      const result = importPromptsJson(this.importPending.json, strategy);
      this.importPending = null;
      this.refresh();
      const detail =
        strategy === 'merge'
          ? `${result.added} añadidos, ${result.skipped} omitidos (ya existían).`
          : `${result.added} prompts importados (reemplazando los anteriores).`;
      alert(`Importación completada. ${detail}`);
    } catch (err) {
      this.importPending = null;
      alert(err instanceof Error ? err.message : 'No se pudo importar.');
    }
  }

  override render(): TemplateResult {
    return html`
      <div class="toolbar">
        <h1>Prompts</h1>
        <div class="toolbar-actions">
          <button
            class="toolbar-btn secondary"
            type="button"
            @click=${this.handleExport}
            ?disabled=${this.prompts.length === 0}
            title="Descargar todos los prompts como JSON"
          >
            Exportar
          </button>
          <button
            class="toolbar-btn secondary"
            type="button"
            @click=${this.triggerImportPicker}
            title="Importar prompts desde un JSON"
          >
            Importar
          </button>
          <button class="toolbar-btn primary" type="button" @click=${this.openNewEditor}>
            + Nuevo prompt
          </button>
        </div>
      </div>

      <input
        type="file"
        accept="application/json,.json"
        @change=${this.handleImportFileSelected}
      />

      <dialog
        @cancel=${this.cancelImport}
        @close=${() => (this.importPending = null)}
      >
        ${this.importPending
          ? html`
              <h3>Importar prompts</h3>
              <p>
                Has seleccionado un fichero con
                <strong>${this.importPending.count} prompts</strong>. ¿Qué quieres hacer?
              </p>
              <div class="dialog-actions">
                <button class="toolbar-btn secondary" type="button" @click=${this.cancelImport}>
                  Cancelar
                </button>
                <button
                  class="toolbar-btn secondary"
                  type="button"
                  @click=${() => this.confirmImport('merge')}
                >
                  Combinar
                </button>
                <button
                  class="toolbar-btn danger"
                  type="button"
                  @click=${() => this.confirmImport('replace')}
                >
                  Reemplazar todo
                </button>
              </div>
            `
          : null}
      </dialog>

      <div class="layout">
        <div class="left-pane">
          ${this.prompts.length > 0 ? this.renderFilterBar() : null}
          ${this.renderListOrEmpty()}
        </div>

        <aside class="editor-pane" aria-label="Editor de prompt">
          ${this.editorOpen
            ? html`
                <cd-prompt-editor
                  .prompt=${this.selectedPrompt}
                  @prompt-save=${this.handleSave}
                  @prompt-cancel=${this.handleCancel}
                  @prompt-delete=${this.handleDelete}
                ></cd-prompt-editor>
              `
            : html`
                <div class="idle">
                  <p>
                    Selecciona un prompt de la lista para editarlo<br />
                    o pulsa <strong>Nuevo prompt</strong> para crear uno.
                  </p>
                </div>
              `}
        </aside>
      </div>
    `;
  }

  private renderFilterBar(): TemplateResult {
    const tags = this.availableTags;
    return html`
      <div class="filter-bar">
        <div class="filter-controls">
          <input
            class="search"
            type="search"
            placeholder="Buscar por título o contenido..."
            aria-label="Buscar prompts"
            .value=${this.searchQuery}
            @input=${(e: Event) => (this.searchQuery = (e.target as HTMLInputElement).value)}
          />
          <select
            class="sort"
            aria-label="Ordenar"
            .value=${this.sortBy}
            @change=${(e: Event) => (this.sortBy = (e.target as HTMLSelectElement).value as SortBy)}
          >
            <option value="recent">Más recientes</option>
            <option value="oldest">Más antiguos</option>
            <option value="alpha">Alfabético</option>
          </select>
        </div>

        ${tags.length > 0
          ? html`
              <div class="tag-chips" role="group" aria-label="Filtrar por tags">
                ${tags.map(
                  (tag) => html`
                    <button
                      class="chip"
                      type="button"
                      aria-pressed=${this.activeTags.includes(tag) ? 'true' : 'false'}
                      @click=${() => this.toggleTag(tag)}
                    >
                      #${tag}
                    </button>
                  `,
                )}
              </div>
            `
          : null}
        ${this.hasActiveFilters
          ? html`
              <div class="filter-status">
                <span>
                  Mostrando ${this.filteredPrompts.length} de ${this.prompts.length}
                </span>
                <button class="clear-btn" type="button" @click=${this.clearFilters}>
                  Limpiar filtros
                </button>
              </div>
            `
          : null}
      </div>
    `;
  }

  private renderListOrEmpty(): TemplateResult {
    if (this.prompts.length === 0) {
      return html`
        <div class="empty">
          <strong>Aún no tienes prompts</strong>
          Pulsa "+ Nuevo prompt" para crear el primero.
        </div>
      `;
    }
    if (this.filteredPrompts.length === 0) {
      return html`
        <div class="empty">
          <strong>Ningún resultado</strong>
          Ajusta la búsqueda o limpia los filtros.
        </div>
      `;
    }
    return html`
      <cd-prompt-list
        .prompts=${this.filteredPrompts}
        .selectedId=${this.editorOpen ? this.selectedId : null}
        @prompt-select=${this.handleSelect}
      ></cd-prompt-list>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cd-prompts-view': CdPromptsView;
  }
}
