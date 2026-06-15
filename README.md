# Obsidian Task Properties Plugin

This is an Obsidian plugin that syncs task statuses into note properties.

https://github.com/user-attachments/assets/53ce56ec-1fce-4fff-94e0-3bbb06f0fb05


## Motivation

Obsidian v1.9.0 adds Bases feature, which is a powerful way to organize your notes in a structured way. When I was trying to migrate my vault to use Bases for task management, I found that there isn't a way to surface task statuses in note properties. This plugin aims to fill that gap.

## How it works

- It monitors metadata updates in your vault.
- When a file changes, if it carries any of your configured **trigger tags** (matched against both inline `#tags` and frontmatter `tags`), it reads all the tasks in the file and updates the `progress` property in the frontmatter. `progress` is an object with `total`, `completed`, and `remaining` counts. Any non-empty checkbox (`[x]`, `[/]`, `[-]`, ...) counts as completed.
- You can then configure a formula field in the base to calculate the progress percentage, e.g. `progress.completed / progress.total * 100`.

## Configuration

Open **Settings → Task Properties** and manage your **Trigger tags** (default: `goal`). Use **Add tag** to add a tag and the trash icon to remove one. Notes tagged with any of these get a `progress` property. The `#` prefix is optional.

## Note

This plugin is currently in early development. If a note carries a trigger tag, the plugin will overwrite its `progress` property. I recommend you try this plugin in a test vault before installing into your main vault.

I will be adding configuration options and submit to the Obsidian community plugins list. For now, you can install it manually by cloning this repo into your vault's `.obsidian/plugins` folder, or use the BRAT plugin to install from GitHub.

## License

[BSD Zero Clause License & MIT License](LICENSE)
