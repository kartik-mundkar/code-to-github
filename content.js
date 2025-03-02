console.log("Content script loaded!");

// Function to create and style the floating overlay button
function createDraggableButton() {
    // ✅ Prevent duplicate buttons
    if (document.getElementById("uploadToGitHubOverlay")) {
        console.log("Upload button already exists, skipping creation.");
        return;
    }
    
    let overlayButton = document.createElement("button");
    overlayButton.id = "uploadToGitHubOverlay";
    overlayButton.innerText = "Upload to GitHub";

    // ✅ Retrieve stored position from `chrome.storage.local`
    chrome.storage.local.get(["buttonPosition"], (data) => {
    //     console.log("Button Position:", data.buttonPosition);
        let posX = data.buttonPosition.x || 20; // Default X position
        let posY =  data.buttonPosition.y || 50; // Default Y position

        // ✅ Apply stored position
        overlayButton.style.cssText = `
            position: fixed;
            bottom: ${posY}px;
            right: ${posX}px;
            background-color:rgb(56, 75, 75);
            color: white;
            padding: 8px 16px;
            font-size: 12px;
            font-weight: bold;
            border: none;
            border-radius: 8px;
            cursor: grab;
            box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            transition: background-color 0.2s ease-in-out;
        `;
    });

    // ✅ Hover effect
    overlayButton.onmouseover = () => (overlayButton.style.backgroundColor = "rgb(45, 60, 60)");
    overlayButton.onmouseleave = () => (overlayButton.style.backgroundColor = "rgb(56, 75, 75)");

    
    let isDragging = false; // ✅ Track if button is being dragged

    overlayButton.addEventListener("mousedown", (event) => {
        isDragging = false; // ✅ Reset drag flag
    });
    
    overlayButton.addEventListener("mousemove", () => {
        isDragging = true; // ✅ Set drag flag when moving
    });

    overlayButton.addEventListener("mouseup", (event) => {
        setTimeout(() => (isDragging = false), 100); // ✅ Delay reset to avoid click triggering
    });
    
    // ✅ Click event to extract problem data and upload to GitHub
    overlayButton.addEventListener("click", (event) => {
        if (isDragging) {
            console.log("Dragging detected, skipping upload.");
            return; // ✅ Prevent accidental upload while dragging
        }
        event.stopPropagation(); // Prevents event bubbling
        let platform = detectPlatform();
        extractProblemData(platform);
    });

    // ✅ Make button draggable
    makeButtonDraggable(overlayButton);

    // ✅ Append button to body
    document.body.appendChild(overlayButton);
    
}

// ✅ Make the button draggable
function makeButtonDraggable(button) {
    let isDragging = false, startX, startY, startLeft, startTop;

    function onMouseMove(event) {
        let dx = Math.abs(event.clientX - startX);
        let dy = Math.abs(event.clientY - startY);

        if (dx > 5 || dy > 5) {
            isDragging = true;
        }

        if (isDragging) {
            let newLeft = startLeft + (event.clientX - startX);
            let newTop = startTop + (event.clientY - startY);
            button.style.left = `${newLeft}px`;
            button.style.top = `${newTop}px`;
            button.style.bottom = "auto"; 
            button.style.right = "auto";  
        }
    }

    function onMouseUp() {
        isDragging = false;
        button.style.cursor = "grab";
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
    }

    button.addEventListener("mousedown", (event) => {
        event.preventDefault();
        isDragging = false;  
        startX = event.clientX;
        startY = event.clientY;
        startLeft = button.offsetLeft;
        startTop = button.offsetTop;
        button.style.cursor = "grabbing";

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    });
}



// ✅ Run the function to create the draggable button
createDraggableButton();


// Function to detect the coding platform
function detectPlatform() {
    if (window.location.hostname.includes("leetcode.com")) return "leetcode";
    if (window.location.hostname.includes("geeksforgeeks.org")) return "geeksforgeeks";
    return "unknown";
}

// ✅ Extract problem data when the button is clicked
function extractProblemData(platform) {
    let problemTitle = window.location.pathname.split("/")[2] || "Unknown_Problem";
    let code = "Code not found";
    let problemLang = "Unknown Language";

    if (platform === "leetcode") {
        code = document.querySelector(".view-lines")?.innerText || "Code not found";
        problemLang = document.querySelector("#editor")?.innerText.split("\n")[0] || "Unknown Language";
    } else if (platform === "geeksforgeeks") {
        code = document.querySelector(".ace_content")?.innerText || "Code not found";
        problemLang = document.querySelector(".problems_language_dropdown__DgjFb")?.children[0].innerText.split(" ")[0] || "Unknown Language";
    }

    console.log("Uploading Problem:", problemTitle, problemLang);
    
    chrome.runtime.sendMessage({
        action: "uploadSolution",
        title: problemTitle,
        code: code,
        problem_lang: problemLang
    });
}




// ✅ Function to show toast notifications
function showToast(message) {
    // Remove existing toast if present
    let existingToast = document.getElementById("uploadToast");
    if (existingToast) existingToast.remove();

    // ✅ Create toast element
    let toast = document.createElement("div");
    toast.id = "uploadToast";
    toast.innerText = message;

    // ✅ Style the toast
    toast.style.cssText = `
        position: fixed;
        top: 40px;
        right: 20px;
        background-color:rgb(56, 75, 75);
        color: white;
        padding: 12px 20px;
        font-size: 14px;
        font-weight: bold;
        border-radius: 5px;
        box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.5s ease-in-out;
    `;

    // ✅ Append to the body
    document.body.appendChild(toast);

    // ✅ Fade-in effect
    setTimeout(() => {
        toast.style.opacity = "1";
    }, 100);

    // ✅ Remove toast after 3 seconds
    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// ✅ Listen for messages from `background.js` when upload completes
chrome.runtime.onMessage.addListener((request) => {
    if (request.action === "uploadSuccess") {
        showToast(`✅ File "${request.filename}" uploaded successfully!`);
    }
});