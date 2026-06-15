import { CachedMetadata, Plugin, TFile, debounce } from 'obsidian';
import {
  DEFAULT_SETTINGS,
  TaskPropertiesSettings,
  TaskPropertiesSettingTab,
} from './settings';
import { computeProgress, noteHasAnyTag, progressEquals } from './progress';

export default class TaskPropertiesPlugin extends Plugin {
  settings!: TaskPropertiesSettings;

  private pendingPaths = new Set<string>();
  private flushPending = debounce(() => this.flush(), 300, false);

  async onload() {
    await this.loadSettings();

    this.addSettingTab(new TaskPropertiesSettingTab(this.app, this));

    this.addCommand({
      id: 'recompute-all',
      name: 'Recompute progress for all notes',
      callback: () => this.recomputeAll(),
    });

    this.app.workspace.onLayoutReady(() => {
      this.registerEvent(
        this.app.metadataCache.on('changed', (file) => {
          this.pendingPaths.add(file.path);
          this.flushPending();
        })
      );

      // Backfill notes that already carry a trigger tag, so progress appears
      // without needing an edit first. Idempotent thanks to the dirty-check.
      this.recomputeAll();
    });
  }

  onunload() {
    this.flushPending.cancel();
  }

  /** Recompute progress for every markdown file in the vault. */
  private recomputeAll() {
    for (const file of this.app.vault.getMarkdownFiles()) {
      this.syncFile(file, this.app.metadataCache.getFileCache(file));
    }
  }

  /** Process the debounced batch of changed files. */
  private flush() {
    const paths = [...this.pendingPaths];
    this.pendingPaths.clear();
    for (const path of paths) {
      const file = this.app.vault.getAbstractFileByPath(path);
      if (file instanceof TFile) {
        this.syncFile(file, this.app.metadataCache.getFileCache(file));
      }
    }
  }

  /**
   * Core sync: write/refresh the progress property on tagged notes, and remove
   * a stale property from notes that no longer carry a trigger tag.
   *
   * The dirty-check compares against the cached frontmatter and only calls
   * processFrontMatter when something actually changes — this avoids redundant
   * disk writes and the write -> 'changed' -> write feedback loop.
   */
  private syncFile(file: TFile, cache: CachedMetadata | null) {
    if (!cache) {
      return;
    }
    const key = this.settings.propertyName || 'progress';
    const frontmatter = cache.frontmatter;
    const hasProperty = frontmatter != null && key in frontmatter;

    if (!noteHasAnyTag(cache, this.settings.tags)) {
      if (hasProperty) {
        this.app.fileManager.processFrontMatter(file, (fm) => {
          delete fm[key];
        });
      }
      return;
    }

    const next = computeProgress(cache, this.settings.includePercentage);
    if (progressEquals(frontmatter?.[key], next)) {
      return;
    }
    this.app.fileManager.processFrontMatter(file, (fm) => {
      fm[key] = next;
    });
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
