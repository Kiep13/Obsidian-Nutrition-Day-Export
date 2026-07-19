declare global {
  interface HTMLElement {
    createDiv(options?: { cls?: string; text?: string; attr?: Record<string, string> }): HTMLDivElement;
    createEl<K extends keyof HTMLElementTagNameMap>(
      tag: K,
      options?: { cls?: string; text?: string; title?: string; attr?: Record<string, string> },
    ): HTMLElementTagNameMap[K];
    setText(text: string): this;
    addClass(...classes: string[]): this;
    removeClass(...classes: string[]): this;
    toggleClass(cls: string, state?: boolean): this;
    empty(): void;
  }
}

export class TFile {
  public name: string;
  public path: string;
  public basename: string;
  public extension: string;
  public parent = null;

  public constructor(path: string = '') {
    this.path = path;
    this.name = path.split('/').pop() ?? '';
    this.extension = this.name.split('.').pop() ?? 'md';
    this.basename = this.name.replace(/\.md$/i, '');
  }
}

export class Vault {
  public getMarkdownFiles(): TFile[] {
    return [];
  }

  public async cachedRead(_file: TFile): Promise<string> {
    return '';
  }
}

export class MetadataCache {
  public getFileCache(_file: TFile): { frontmatter?: Record<string, unknown> } | null {
    return null;
  }

  public getFirstLinkpathDest(_linkpath: string, _sourcePath: string): TFile | null {
    return null;
  }
}

export class Workspace {
  public getActiveFile(): TFile | null {
    return null;
  }
}

export class App {
  public vault = new Vault();
  public metadataCache = new MetadataCache();
  public workspace = new Workspace();
}

export class Modal {
  public app: App;
  public contentEl: HTMLElement = document.createElement('div');

  public constructor(app: App) {
    this.app = app;
  }

  public open(): void {}
  public close(): void {}
  public onOpen(): void {}
  public onClose(): void {}
}

export class Notice {
  public constructor(_message: string, _timeout?: number) {}
}

export class PluginSettingTab {
  public app: App;
  public containerEl: HTMLElement = document.createElement('div');

  public constructor(app: App, _plugin: Plugin) {
    this.app = app;
  }

  public display(): void {}
}

export class Plugin {
  public app: App = new App();

  public async onload(): Promise<void> {}

  public async loadData(): Promise<Record<string, unknown>> {
    return {};
  }

  public async saveData(_data: unknown): Promise<void> {}

  public addRibbonIcon(
    _icon: string,
    _title: string,
    _callback: (mouseEvent: MouseEvent) => unknown,
  ): HTMLElement {
    return document.createElement('div');
  }

  public addCommand(_command: {
    id: string;
    name: string;
    callback?: () => unknown;
    hotkeys?: Array<{ modifiers: string[]; key: string }>;
  }): void {}

  public addSettingTab(_settingTab: PluginSettingTab): void {}
}

export class TextComponent {
  public inputEl: HTMLInputElement = document.createElement('input');
  private changeHandler: ((value: string) => unknown) | null = null;

  public setValue(value: string): this {
    this.inputEl.value = value;
    return this;
  }

  public setPlaceholder(placeholder: string): this {
    this.inputEl.placeholder = placeholder;
    return this;
  }

  public onChange(callback: (value: string) => unknown): this {
    this.changeHandler = callback;
    return this;
  }

  public trigger(value: string): void {
    this.changeHandler?.(value);
  }
}

export class DropdownComponent {
  public selectEl: HTMLSelectElement = document.createElement('select');
  private changeHandler: ((value: string) => unknown) | null = null;

  public addOption(value: string, label: string): this {
    this.selectEl.add(new Option(label, value));
    return this;
  }

  public setValue(value: string): this {
    this.selectEl.value = value;
    return this;
  }

  public onChange(callback: (value: string) => unknown): this {
    this.changeHandler = callback;
    return this;
  }

  public trigger(value: string): void {
    this.changeHandler?.(value);
  }
}

export class Setting {
  public constructor(_containerEl: HTMLElement) {}

  public setName(_name: string): this {
    return this;
  }

  public setDesc(_description: string): this {
    return this;
  }

  public addText(callback: (textComponent: TextComponent) => unknown): this {
    callback(new TextComponent());
    return this;
  }

  public addDropdown(callback: (dropdownComponent: DropdownComponent) => unknown): this {
    callback(new DropdownComponent());
    return this;
  }
}

export function setIcon(_element: HTMLElement, _icon: string): void {}
