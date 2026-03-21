export default class EmbedUrlTool {
  data: any;
  wrapper: HTMLElement;

  static get toolbox() {
    return {
      title: 'Embed',
      icon: '<svg width="16" height="13" viewBox="0 0 16 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.5 10.5L1 6.5L5.5 2.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M10.5 2.5L15 6.5L10.5 10.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    };
  }

  constructor({ data }: { data: any }) {
    this.data = data || {};
    this.wrapper = document.createElement('div');
  }

  render() {
    this.wrapper.classList.add('embed-url-tool', 'py-3');

    if (this.data && this.data.url) {
        this._renderEmbed(this.data.url);
        return this.wrapper;
    }

    const input = document.createElement('input');
    input.placeholder = 'Paste YouTube URL or raw <iframe> HTML code and press Enter...';
    input.value = this.data.url || '';
    input.className = 'w-full p-4 border border-indigo-200 dark:border-indigo-800 bg-indigo-50/30 dark:bg-indigo-900/10 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-gray-800 dark:text-gray-100';
    
    input.addEventListener('input', () => {
        this.data.url = input.value;
    });

    input.addEventListener('paste', (event) => {
        setTimeout(() => {
            if (input.value) {
                this._processInput(input.value);
            }
        }, 10);
    });

    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            if (input.value) {
                this._processInput(input.value);
            }
        }
    });

    this.wrapper.appendChild(input);
    return this.wrapper;
  }

  _processInputUrl(val: string): string {
      let finalUrl = val.trim();
      if (finalUrl.includes('<iframe') && finalUrl.includes('src="')) {
          const match = finalUrl.match(/src="([^"]+)"/);
          if (match && match[1]) {
              finalUrl = match[1];
          }
      } else {
          const ytMatch = finalUrl.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?([a-zA-Z0-9_-]+)/);
          if (ytMatch && ytMatch[1]) {
              finalUrl = `https://www.youtube.com/embed/${ytMatch[1]}`;
          }
          const vimeoMatch = finalUrl.match(/(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/);
          if (vimeoMatch && vimeoMatch[3]) {
              finalUrl = `https://player.vimeo.com/video/${vimeoMatch[3]}`;
          }
      }
      return finalUrl;
  }

  _processInput(val: string) {
      const finalUrl = this._processInputUrl(val);
      this.data.url = finalUrl;
      this._renderEmbed(finalUrl);
  }

  _renderEmbed(url: string) {
    this.wrapper.innerHTML = '';
    
    const container = document.createElement('div');
    container.className = 'relative group rounded-xl overflow-hidden border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 flex justify-center items-center h-[300px] md:h-[500px] w-full shadow-sm';
    
    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.className = 'w-full h-full rounded-xl border-0 bg-black/5';
    iframe.allowFullscreen = true;
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    
    const button = document.createElement('button');
    button.innerHTML = 'Replace URL';
    button.className = 'absolute top-3 right-3 bg-red-600 text-white hover:bg-red-700 font-bold px-4 py-2 rounded-lg text-xs shadow-xl transition-all cursor-pointer z-50';
    button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.data.url = '';
        this.wrapper.innerHTML = '';
        this.render();
    });

    container.appendChild(iframe);
    container.appendChild(button);
    this.wrapper.appendChild(container);
  }

  save(blockContent: HTMLElement) {
    const input = blockContent.querySelector('input');
    if (input) {
      return { url: this._processInputUrl(input.value) };
    }
    const iframe = blockContent.querySelector('iframe');
    if (iframe) {
        return { url: iframe.src };
    }
    return { url: this.data.url };
  }
}
