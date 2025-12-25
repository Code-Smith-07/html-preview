// Initialize CodeMirror editors with a dark theme and word wrap off by default
const htmlEditor = CodeMirror.fromTextArea(document.getElementById("htmlCode"), {
    mode: "xml",
    lineNumbers: true,
    theme: "monokai", // Set to a dark theme
    lineWrapping: false // Word wrap off by default
});

const cssEditor = CodeMirror.fromTextArea(document.getElementById("cssCode"), {
    mode: "css",
    lineNumbers: true,
    theme: "monokai", // Set to a dark theme
    lineWrapping: false // Word wrap off by default
});

const jsEditor = CodeMirror.fromTextArea(document.getElementById("jsCode"), {
    mode: "javascript",
    lineNumbers: true,
    theme: "monokai", // Set to a dark theme
    lineWrapping: false, // Word wrap off by default
    gutters: ["CodeMirror-lint-markers"],
    lint: true // Enable linting
});

// Function to toggle word wrap
function toggleWordWrap() {
    const wordWrapSwitch = document.getElementById('word-wrap-switch');
    const isChecked = wordWrapSwitch.checked;

    // Set the new wrap state based on the checkbox state
    htmlEditor.setOption("lineWrapping", isChecked);
    cssEditor.setOption("lineWrapping", isChecked);
    jsEditor.setOption("lineWrapping", isChecked);

    // Update label based on word wrap state
    const switchLabel = document.getElementById("switch-label");
    switchLabel.textContent = isChecked ? "Word Wrap: On" : "Word Wrap: Off";
}

// Attach event listener to the toggle switch
document.getElementById("word-wrap-switch").addEventListener("change", toggleWordWrap);

// Rest of the code for updating preview, copy to clipboard, clear editor, and zip download

// Function to update the preview window
function updatePreview() {
    const html = htmlEditor.getValue();
    const css = "<style>" + cssEditor.getValue() + "</style>";
    const js = jsEditor.getValue();
    const previewWindow = document.getElementById("preview-window").contentWindow;

    previewWindow.document.open();
    previewWindow.document.write(html + css + "<script>" + js + "<\/script>");
    previewWindow.document.close();
}

// Function to update the preview window size
function updatePreviewSize() {
    const previewWidth = document.getElementById("preview-width").value;
    const previewHeight = document.getElementById("preview-height").value;
    const previewWindow = document.getElementById("preview-window");

    previewWindow.style.width = previewWidth + "px";
    previewWindow.style.height = previewHeight + "px";
}

// Function to copy content to clipboard
function copyToClipboard(editor) {
    const content = editor.getValue();
    navigator.clipboard.writeText(content).then(() => {
        alert('Copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}

// Function to clear the editor content
function clearEditor(editor) {
    editor.setValue('');
    updatePreview();
}

// Function to paste code into the editor
function pasteCode(type) {
    navigator.clipboard.readText().then((text) => {
        switch(type) {
            case 'html':
                htmlEditor.setValue(text);
                break;
            case 'css':
                cssEditor.setValue(text);
                break;
            case 'js':
                jsEditor.setValue(text);
                break;
        }
        updatePreview();
    }).catch((err) => {
        console.error("Failed to paste: ", err);
    });
}

// Function to upload a file and load it into the editor
function uploadFile(event, type) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        switch(type) {
            case 'html':
                htmlEditor.setValue(e.target.result);
                break;
            case 'css':
                cssEditor.setValue(e.target.result);
                break;
            case 'js':
                jsEditor.setValue(e.target.result);
                break;
        }
        updatePreview();
    };
    reader.readAsText(file);
}

// Function to handle file drop event
function handleDrop(event, type) {
    event.preventDefault();
    event.stopPropagation();
    
    const file = event.dataTransfer.files[0];
    if (!file) return;

    const validTypes = {
        'html': ['.html', '.htm'],
        'css': ['.css'],
        'js': ['.js']
    };

    const extension = '.' + file.name.split('.').pop().toLowerCase();
    if (!validTypes[type].includes(extension)) {
        alert(`Please drop a valid ${type.toUpperCase()} file`);
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        switch(type) {
            case 'html':
                htmlEditor.setValue(e.target.result);
                break;
            case 'css':
                cssEditor.setValue(e.target.result);
                break;
            case 'js':
                jsEditor.setValue(e.target.result);
                break;
        }
        updatePreview();
    };
    reader.readAsText(file);
}

// Setup drag and drop for each editor
['html', 'css', 'js'].forEach(type => {
    const dropArea = document.getElementById(`${type}-drop-area`);
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, e => {
            e.preventDefault();
            e.stopPropagation();
        });
    });

    dropArea.addEventListener('dragenter', () => {
        dropArea.classList.add('dragover');
    });

    dropArea.addEventListener('dragleave', () => {
        dropArea.classList.remove('dragover');
    });

    dropArea.addEventListener('drop', (e) => {
        dropArea.classList.remove('dragover');
        handleDrop(e, type);
    });
});

// Event listener for downloading code as a ZIP file
document.getElementById('download-btn').addEventListener('click', function() {
    const zip = new JSZip();
    const title = document.getElementById('zip-title').value || "my_code";
    zip.file(`${title}.html`, htmlEditor.getValue());
    zip.file(`${title}.css`, cssEditor.getValue());
    zip.file(`${title}.js`, jsEditor.getValue());

    zip.generateAsync({ type: "blob" }).then(function(content) {
        saveAs(content, `${title}.zip`);
    });
});

// Update preview on editor change
htmlEditor.on("change", updatePreview);
cssEditor.on("change", updatePreview);
jsEditor.on("change", updatePreview);

// Attach event listeners to buttons
document.querySelector('.editor-buttons button[onclick="copyToClipboard(\'htmlCode\')"]').onclick = () => copyToClipboard(htmlEditor);
document.querySelector('.editor-buttons button[onclick="clearEditor(\'htmlCode\')"]').onclick = () => clearEditor(htmlEditor);

document.querySelector('.editor-buttons button[onclick="copyToClipboard(\'cssCode\')"]').onclick = () => copyToClipboard(cssEditor);
document.querySelector('.editor-buttons button[onclick="clearEditor(\'cssCode\')"]').onclick = () => clearEditor(cssEditor);

document.querySelector('.editor-buttons button[onclick="copyToClipboard(\'jsCode\')"]').onclick = () => copyToClipboard(jsEditor);
document.querySelector('.editor-buttons button[onclick="clearEditor(\'jsCode\')"]').onclick = () => clearEditor(jsEditor);

// Add event listeners to update preview size
document.getElementById("preview-width").addEventListener("input", updatePreviewSize);
document.getElementById("preview-height").addEventListener("input", updatePreviewSize);

// Initialize preview size
updatePreviewSize();

document.getElementById("preview-width").value = 1000;
document.getElementById("preview-height").value = 563; // For 16:9 ratio

document.getElementById("preview-window").style.width = "1000px";
document.getElementById("preview-window").style.height = "563px";

// Add event listener for fullscreen functionality
document.getElementById("fullscreen-btn").addEventListener("click", function () {
    let previewWindow = document.getElementById("preview-window");
    if (previewWindow.requestFullscreen) {
        previewWindow.requestFullscreen();
    } else if (previewWindow.mozRequestFullScreen) { // Firefox
        previewWindow.mozRequestFullScreen();
    } else if (previewWindow.webkitRequestFullscreen) { // Chrome, Safari and Opera
        previewWindow.webkitRequestFullscreen();
    } else if (previewWindow.msRequestFullscreen) { // IE/Edge
        previewWindow.msRequestFullscreen();
    }
});

