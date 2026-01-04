function iframeBack(windowId) {
                const iframe = document.getElementById(windowId).querySelector('iframe');

                try {
                    iframe.contentWindow.history.back();
                } catch (e) {
                    console.warn('Back navigation blocked by iframe');
                }
            }

            function iframeForward(windowId) {
                const iframe = document.getElementById(windowId).querySelector('iframe');

                try {
                    iframe.contentWindow.history.forward();
                } catch (e) {
                    console.warn('Forward navigation blocked by iframe');
                }
            }

            let appInstanceCounter = 0;

            function cloneApp({ title, src, width = 500, height = 300 }) {
                appInstanceCounter++;

                const windowId = `app-window-${appInstanceCounter}`;

                const win = document.createElement('div');
                win.className = 'window active';
                win.id = windowId;

                win.style.top = 120 + appInstanceCounter * 25 + 'px';
                win.style.left = 200 + appInstanceCounter * 25 + 'px';
                win.style.width = width + 'px';
                win.style.height = height + 'px';

                win.innerHTML = `
                    <div class="resize-handle resize-n"></div>
                    <div class="resize-handle resize-s"></div>
                    <div class="resize-handle resize-e"></div>
                    <div class="resize-handle resize-w"></div>
                    <div class="resize-handle resize-ne"></div>
                    <div class="resize-handle resize-nw"></div>
                    <div class="resize-handle resize-se"></div>
                    <div class="resize-handle resize-sw"></div>

                    <div class="window-header">
                        <div class="window-nav">
                            <button class="nav-btn" onclick="iframeBack('${windowId}')">←</button>
                            <button class="nav-btn" onclick="iframeForward('${windowId}')">→</button>
                        </div>

                        <span class="window-title centered-title">${title}</span>

                        <div class="window-controls">
                            <button class="window-control-btn reload" onclick="reloadWindow('${windowId}')">↻</button>
                            <button class="window-control-btn fullscreen" onclick="toggleFullscreen('${windowId}')">□</button>
                            <button class="window-control-btn close" onclick="closeWindow('${windowId}')">×</button>
                        </div>
                    </div>

                    <div class="window-content">
                        <iframe importance="high" src="${src}"></iframe>
                    </div>
                `;

                document.getElementById('desktop').appendChild(win);

                const header = win.querySelector('.window-header');
                header.addEventListener('mousedown', dragStart);
                header.addEventListener('dblclick', () => toggleFullscreen(windowId));

                setupResizeHandles(win);
                win.addEventListener('mousedown', () => bringToFront(win));

                bringToFront(win);
            }