function updateTime() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12;

    const mins = minutes < 10 ? '0' + minutes : minutes;
    const secs = seconds < 10 ? '0' + seconds : seconds;

    document.getElementById('time').textContent = `${hours}:${mins}:${secs} ${ampm}`;
}

updateTime();
setInterval(updateTime, 1000);

let activeWindow = null;
let isDragging = false;
let isResizing = false;
let currentX, currentY, initialX, initialY;
let gameWindowCounter = 0;
let resizeDirection = null;
let initialWidth, initialHeight, initialLeft, initialTop;

function openGame(gameName, gameSource) {
    gameWindowCounter++;
    const windowId = 'game-window-' + gameWindowCounter;

    const windowDiv = document.createElement('div');
    windowDiv.className = 'window active';
    windowDiv.id = windowId;
    windowDiv.style.top = (100 + gameWindowCounter * 30) + 'px';
    windowDiv.style.left = (300 + gameWindowCounter * 30) + 'px';
    windowDiv.style.width = '700px';
    windowDiv.style.height = '500px';

    windowDiv.innerHTML = `
        <div class="resize-handle resize-n"></div>
        <div class="resize-handle resize-s"></div>
        <div class="resize-handle resize-e"></div>
        <div class="resize-handle resize-w"></div>
        <div class="resize-handle resize-ne"></div>
        <div class="resize-handle resize-nw"></div>
        <div class="resize-handle resize-se"></div>
        <div class="resize-handle resize-sw"></div>
        <div class="window-header">
            <span class="window-title">${gameName}</span>
            <div class="window-controls">
                <button class="window-control-btn reload" onclick="reloadWindow('${windowId}')" title="Reload">↻</button>
                <button class="window-control-btn fullscreen" onclick="toggleFullscreen('${windowId}')">□</button>
                <button class="window-control-btn close" onclick="closeWindow('${windowId}')">×</button>
            </div>
        </div>
        <div class="window-content">
            <iframe src="${gameSource}"></iframe>
        </div>
    `;

    document.getElementById('desktop').appendChild(windowDiv);
    bringToFront(windowDiv);

    const header = windowDiv.querySelector('.window-header');
    header.addEventListener('mousedown', dragStart);
    header.addEventListener('dblclick', () => toggleFullscreen(windowId));

    setupResizeHandles(windowDiv);

    windowDiv.addEventListener('mousedown', () => {
        bringToFront(windowDiv);
    });

    toggleSidebar();
}

function openWindow(windowId) {
    const win = document.getElementById(windowId);
    win.classList.add('active');
    bringToFront(win);
}

function closeWindow(windowId) {
    const win = document.getElementById(windowId);
    win.classList.remove('active');

    if (windowId.startsWith('game-window-')) {
        win.remove();
    }
}

function reloadWindow(windowId) {
    const win = document.getElementById(windowId);
    const iframe = win.querySelector('iframe');

    if (iframe) {
        const src = iframe.src;
        const srcdoc = iframe.getAttribute('srcdoc');

        if (srcdoc) {
            iframe.setAttribute('srcdoc', srcdoc);
        } else if (src) {
            iframe.src = src;
        }
    }
}

function toggleFullscreen(windowId) {
    const win = document.getElementById(windowId);
    win.classList.toggle('fullscreen');
}

function bringToFront(win) {
    const allWindows = document.querySelectorAll('.window');
    allWindows.forEach((w) => (w.style.zIndex = 1));
    win.style.zIndex = 10;
}

function setupResizeHandles(windowElement) {
    const handles = windowElement.querySelectorAll('.resize-handle');
    handles.forEach((handle) => {
        handle.addEventListener('mousedown', (e) => resizeStart(e, windowElement));
    });
}

function resizeStart(e, windowElement) {
    e.stopPropagation();
    e.preventDefault();
    isResizing = true;
    activeWindow = windowElement;
    activeWindow.classList.add('resizing');

    const classList = e.target.classList;
    if (classList.contains('resize-n')) resizeDirection = 'n';
    else if (classList.contains('resize-s')) resizeDirection = 's';
    else if (classList.contains('resize-e')) resizeDirection = 'e';
    else if (classList.contains('resize-w')) resizeDirection = 'w';
    else if (classList.contains('resize-ne')) resizeDirection = 'ne';
    else if (classList.contains('resize-nw')) resizeDirection = 'nw';
    else if (classList.contains('resize-se')) resizeDirection = 'se';
    else if (classList.contains('resize-sw')) resizeDirection = 'sw';

    initialX = e.clientX;
    initialY = e.clientY;
    initialWidth = activeWindow.offsetWidth;
    initialHeight = activeWindow.offsetHeight;
    initialLeft = activeWindow.offsetLeft;
    initialTop = activeWindow.offsetTop;

    bringToFront(activeWindow);
}

function dragStart(e) {
    if (e.target.classList.contains('window-control-btn')) return;

    activeWindow = e.target.closest('.window');
    if (activeWindow.classList.contains('fullscreen')) return;

    bringToFront(activeWindow);
    activeWindow.classList.add('dragging');
    isDragging = true;

    initialX = e.clientX - activeWindow.offsetLeft;
    initialY = e.clientY - activeWindow.offsetTop;
}

document.addEventListener('mousemove', (e) => {
    if (isDragging) {
        drag(e);
    } else if (isResizing) {
        resize(e);
    }
});

document.addEventListener('mouseup', () => {
    if (activeWindow) {
        activeWindow.classList.remove('dragging', 'resizing');
    }
    isDragging = false;
    isResizing = false;
    resizeDirection = null;
});

function drag(e) {
    if (!isDragging || !activeWindow) return;

    e.preventDefault();
    currentX = e.clientX - initialX;
    currentY = e.clientY - initialY;

    activeWindow.style.left = currentX + 'px';
    activeWindow.style.top = currentY + 'px';
}

function resize(e) {
    if (!isResizing || !activeWindow) return;

    e.preventDefault();

    const deltaX = e.clientX - initialX;
    const deltaY = e.clientY - initialY;

    let newWidth = initialWidth;
    let newHeight = initialHeight;
    let newLeft = initialLeft;
    let newTop = initialTop;

    if (resizeDirection.includes('e')) {
        newWidth = Math.max(400, initialWidth + deltaX);
    }
    if (resizeDirection.includes('w')) {
        newWidth = Math.max(400, initialWidth - deltaX);
        newLeft = initialLeft + (initialWidth - newWidth);
    }
    if (resizeDirection.includes('s')) {
        newHeight = Math.max(300, initialHeight + deltaY);
    }
    if (resizeDirection.includes('n')) {
        newHeight = Math.max(300, initialHeight - deltaY);
        newTop = initialTop + (initialHeight - newHeight);
    }

    activeWindow.style.width = newWidth + 'px';
    activeWindow.style.height = newHeight + 'px';
    activeWindow.style.left = newLeft + 'px';
    activeWindow.style.top = newTop + 'px';
}

document.querySelectorAll('.window-header').forEach((header) => {
    header.addEventListener('mousedown', dragStart);
    header.addEventListener('dblclick', function () {
        const windowId = this.closest('.window').id;
        toggleFullscreen(windowId);
    });
});

document.querySelectorAll('.window').forEach((win) => {
    win.addEventListener('mousedown', () => {
        bringToFront(win);
    });
    setupResizeHandles(win);
});