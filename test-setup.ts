function defineDomHelpers(): void {
  if (!HTMLElement.prototype.createDiv) {
    HTMLElement.prototype.createDiv = function createDiv(options) {
      const element = document.createElement('div');
      if (options?.cls) {
        element.className = options.cls;
      }
      if (options?.text) {
        element.textContent = options.text;
      }
      if (options?.attr) {
        for (const [attributeName, attributeValue] of Object.entries(options.attr)) {
          element.setAttribute(attributeName, attributeValue);
        }
      }
      this.appendChild(element);
      return element;
    };
  }

  if (!HTMLElement.prototype.createEl) {
    HTMLElement.prototype.createEl = function createEl(tagName, options) {
      const element = document.createElement(tagName);
      if (options?.cls) {
        element.className = options.cls;
      }
      if (options?.text) {
        element.textContent = options.text;
      }
      if (options?.title) {
        element.title = options.title;
      }
      if (options?.attr) {
        for (const [attributeName, attributeValue] of Object.entries(options.attr)) {
          element.setAttribute(attributeName, attributeValue);
        }
      }
      this.appendChild(element);
      return element;
    };
  }

  if (!HTMLElement.prototype.setText) {
    HTMLElement.prototype.setText = function setText(text) {
      this.textContent = text;
      return this;
    };
  }

  if (!HTMLElement.prototype.addClass) {
    HTMLElement.prototype.addClass = function addClass(...classes) {
      this.classList.add(...classes);
      return this;
    };
  }

  if (!HTMLElement.prototype.removeClass) {
    HTMLElement.prototype.removeClass = function removeClass(...classes) {
      this.classList.remove(...classes);
      return this;
    };
  }

  if (!HTMLElement.prototype.toggleClass) {
    HTMLElement.prototype.toggleClass = function toggleClass(className, state) {
      this.classList.toggle(className, state);
      return this;
    };
  }

  if (!HTMLElement.prototype.empty) {
    HTMLElement.prototype.empty = function empty() {
      this.textContent = '';
      while (this.firstChild) {
        this.removeChild(this.firstChild);
      }
    };
  }
}

defineDomHelpers();
