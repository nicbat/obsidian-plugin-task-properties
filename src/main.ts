import { Plugin } from 'obsidian';
import {
  DEFAULT_SETTINGS,
  TaskPropertiesSettings,
  TaskPropertiesSettingTab,
} from './settings';
import { computeProgress, noteHasAnyTag, progressEquals } from './progress';

export default class TaskPropertiesPlugin extends Plugin {
  settings!: TaskPropertiesSettings;

  async onload() {
    await this.loadSettings();

    this.addSettingTab(new TaskPropertiesSettingTab(this.app, this));

    this.app.workspace.onLayoutReady(() => {
      this.registerEvent(
        this.app.metadataCache.on('changed', (file, _data, cache) => {
          if (!noteHasAnyTag(cache, this.settings.tags)) {
            return;
          }

          this.app.fileManager.processFrontMatter(file, (frontmatter) => {
            const next = computeProgress(cache);
            // Skip the write when nothing changed, otherwise our own write
            // re-triggers 'changed' and loops forever.
            if (progressEquals(frontmatter.progress, next)) {
              return;
            }
            frontmatter.progress = next;
          });
        })
      );
    });
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
