import { App, PluginSettingTab, Setting } from 'obsidian';
import type TaskPropertiesPlugin from './main';

export interface TaskPropertiesSettings {
  tags: string[];
}

export const DEFAULT_SETTINGS: TaskPropertiesSettings = {
  tags: ['goal'],
};

function parseTags(value: string): string[] {
  return value
    .split(',')
    .map((t) => t.trim().replace(/^#/, '').toLowerCase())
    .filter((t) => t.length > 0);
}

export class TaskPropertiesSettingTab extends PluginSettingTab {
  plugin: TaskPropertiesPlugin;

  constructor(app: App, plugin: TaskPropertiesPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName('Trigger tags')
      .setDesc(
        'Comma-separated tags. Notes with any of these tags get a progress property synced from their tasks.'
      )
      .addText((text) =>
        text
          .setPlaceholder('goal, task')
          .setValue(this.plugin.settings.tags.join(', '))
          .onChange(async (value) => {
            this.plugin.settings.tags = parseTags(value);
            await this.plugin.saveSettings();
          })
      );
  }
}
