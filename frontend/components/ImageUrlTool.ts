export default class ImageUrlTool {
  data: any;
  wrapper: HTMLElement;

  static get toolbox() {
    return {
      title: 'Image URL',
      icon: '<svg width="17" height="15" viewBox="0 0 336 276" xmlns="http://www.w3.org/2000/svg"><path d="M291 150V79c0-19-15-34-34-34H79c-19 0-34 15-34 34v42l67-44 81 72 56-29 42 30zm0 52l-43-30-56 30-81-67-66 39v23c0 19 15 34 34 34h178c17 0 31-13 34-29zM79 0h178c44 0 79 35 79 79v118c0 44-35 79-79 79H79c-44 0-79-35-79-79V79C0 35 35 0 79 0z"/></svg>'
    };
  }

  constructor({ data }: { data: any }) {
    this.data = data || {};
    this.wrapper = document.createElement('div');
  }

  render() {
    this.wrapper.classList.add('image-url-tool', 'py-3');

    if (this.data && this.data.url) {
        this._renderImage(this.data.url);
        return this.wrapper;
    }

    const input = document.createElement('input');
    input.placeholder = 'Paste any image URL here and press Enter...';
    input.value = this.data.url || '';
    input.className = 'w-full p-4 border border-indigo-200 dark:border-indigo-800 bg-indigo-50/30 dark:bg-indigo-900/10 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-gray-800 dark:text-gray-100';
    
    input.addEventListener('input', () => {
        this.data.url = input.value;
    });

    input.addEventListener('paste', (event) => {
        setTimeout(() => {
            if (input.value) {
                this.data.url = input.value;
                this._renderImage(input.value);
            }
        }, 10);
    });

    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            if (input.value) {
                this.data.url = input.value;
                this._renderImage(input.value);
            }
        }
    });

    this.wrapper.appendChild(input);
    return this.wrapper;
  }

  _renderImage(url: string) {
    this.wrapper.innerHTML = '';
    
    const container = document.createElement('div');
    container.className = 'relative group rounded-xl overflow-hidden border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 flex justify-center items-center min-h-[150px]';
    
    const img = document.createElement('img');
    img.src = url;
    img.className = 'max-w-full rounded-xl max-h-[500px] object-contain transition-opacity';
    img.onerror = () => {
        img.style.display = 'none';
        const errorText = document.createElement('p');
        errorText.className = 'text-red-500 font-medium p-6 text-center text-sm';
        errorText.innerHTML = 'Error loading image URL.<br><span class="text-gray-500 test-xs mt-2 block">Ensure the link points directly to an image file (e.g. ends in .jpg, .png, .gif) and is not a webpage.</span>';
        container.appendChild(errorText);
    };
    
    const button = document.createElement('button');
    button.innerHTML = 'Replace URL';
    button.className = 'absolute top-3 right-3 bg-red-600 text-white hover:bg-red-700 font-bold px-4 py-2 rounded-lg text-xs shadow-xl transition-all cursor-pointer z-50';
    button.onclick = () => {
        this.data.url = '';
        this.wrapper.innerHTML = '';
        this.render();
    };

    container.appendChild(img);
    if (img.style.display !== 'none') {
        container.appendChild(button);
    }
    this.wrapper.appendChild(container);
  }

  save(blockContent: HTMLElement) {
    const input = blockContent.querySelector('input');
    if (input) {
      return { url: input.value };
    }
    const img = blockContent.querySelector('img');
    if (img) {
        return { url: img.src };
    }
    return { url: this.data.url };
  }
}
