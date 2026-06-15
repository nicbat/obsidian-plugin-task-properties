import { App, PluginSettingTab, Setting } from 'obsidian';
import type TaskPropertiesPlugin from './main';

export interface TaskPropertiesSettings {
  tags: string[];
  propertyName: string;
  includePercentage: boolean;
}

export const DEFAULT_SETTINGS: TaskPropertiesSettings = {
  tags: ['goal'],
  propertyName: 'progress',
  includePercentage: false,
};

function normalizeTag(value: string): string {
  return value.trim().replace(/^#/, '').toLowerCase();
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
        'Notes with any of these tags get a progress property synced from their tasks. Matches inline #tags and frontmatter tags.'
      )
      .setHeading()
      .addButton((button) =>
        button
          .setButtonText('Add tag')
          .setCta()
          .onClick(async () => {
            this.plugin.settings.tags.push('');
            await this.plugin.saveSettings();
            this.display();
          })
      );

    this.plugin.settings.tags.forEach((tag, index) => {
      new Setting(containerEl)
        .addText((text) =>
          text
            .setPlaceholder('goal')
            // Re-render is only triggered on add/remove, so the field keeps
            // focus while typing; we just normalize and persist on change.
            .setValue(tag)
            .onChange(async (value) => {
              this.plugin.settings.tags[index] = normalizeTag(value);
              await this.plugin.saveSettings();
            })
        )
        .addExtraButton((button) =>
          button
            .setIcon('trash')
            .setTooltip('Remove tag')
            .onClick(async () => {
              this.plugin.settings.tags.splice(index, 1);
              await this.plugin.saveSettings();
              this.display();
            })
        );
    });

    new Setting(containerEl).setName('Output').setHeading();

    new Setting(containerEl)
      .setName('Property name')
      .setDesc(
        'The frontmatter property to write task progress to. Renaming leaves the old property on existing notes; run "Recompute progress for all notes" after changing it.'
      )
      .addText((text) =>
        text
          .setPlaceholder('progress')
          .setValue(this.plugin.settings.propertyName)
          .onChange(async (value) => {
            this.plugin.settings.propertyName = value.trim() || 'progress';
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Include percentage')
      .setDesc('Add a percentage field (0–100) inside the progress object.')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.includePercentage)
          .onChange(async (value) => {
            this.plugin.settings.includePercentage = value;
            await this.plugin.saveSettings();
          })
      );
  }
}
