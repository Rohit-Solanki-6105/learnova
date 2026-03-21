export default class VideoUrlTool {
  data: any;
  wrapper: HTMLElement;

  static get toolbox() {
    return {
      title: 'Video URL',
      icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 10l4.5-2.5v9L15 14z"/><rect x="2" y="6" width="13" height="12" rx="2"/></svg>'
    };
  }

  constructor({ data }: { data: any }) {
    this.data = data || {};
    this.wrapper = document.createElement('div');
  }

  render() {
    this.wrapper.classList.add('video-url-tool', 'py-3');

    if (this.data && this.data.url) {
        this._renderVideo(this.data.url);
        return this.wrapper;
    }

    const input = document.createElement('input');
    input.placeholder = 'Paste any video URL (.mp4, .webm) here and press Enter...';
    input.value = this.data.url || '';
    input.className = 'w-full p-4 border border-indigo-200 dark:border-indigo-800 bg-indigo-50/30 dark:bg-indigo-900/10 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-gray-800 dark:text-gray-100';
    
    input.addEventListener('input', () => {
        this.data.url = input.value;
    });

    input.addEventListener('paste', (event) => {
        setTimeout(() => {
            if (input.value) {
                this.data.url = input.value;
                this._renderVideo(input.value);
            }
        }, 10);
    });

    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            if (input.value) {
                this.data.url = input.value;
                this._renderVideo(input.value);
            }
        }
    });

    this.wrapper.appendChild(input);
    return this.wrapper;
  }

  _renderVideo(url: string) {
    this.wrapper.innerHTML = '';
    
    const container = document.createElement('div');
    container.className = 'relative group rounded-xl overflow-hidden border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 flex justify-center items-center min-h-[150px]';
    
    const video = document.createElement('video');
    video.src = url;
    video.controls = true;
    video.className = 'max-w-full rounded-xl max-h-[500px] object-contain transition-opacity';
    
    video.onerror = () => {
        video.style.display = 'none';
        const errorText = document.createElement('p');
        errorText.className = 'text-red-500 font-medium p-6 text-center text-sm';
        errorText.innerHTML = 'Error loading video URL.<br><span class="text-gray-500 text-xs mt-2 block">Ensure the link points directly to a video file (e.g. .mp4) and is not a webpage/YouTube link.</span>';
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

    container.appendChild(video);
    container.appendChild(button);
    this.wrapper.appendChild(container);
  }

  save(blockContent: HTMLElement) {
    const input = blockContent.querySelector('input');
    if (input) {
      return { url: input.value };
    }
    const video = blockContent.querySelector('video');
    if (video) {
        return { url: video.src };
    }
    return { url: this.data.url };
  }
}
