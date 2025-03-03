chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension Installed!");
    chrome.storage.local.set({ githubToken: "", githubUsername: "", githubRepo: "" });
    chrome.storage.local.set({ buttonPosition: { x: 20, y: 50 } });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "uploadSolution" && request.title && request.code) {
        uploadToGitHub(request.title, request.code, request.problem_lang);
    }
});

function uploadToGitHub(title, code, problem_lang) {
    chrome.storage.local.get(["githubToken", "githubUsername", "githubRepo"], (data) => {
        if (!data.githubToken) {
            console.log("GitHub token not set!");
            return;
        }

        const repo = `${data.githubUsername}/${data.githubRepo}`;
        const token = data.githubToken;

        const fileExt = {
            "python": "py", "python3": "py", "java": "java", "cpp": "cpp", "c++": "cpp", "c": "c", "c#": "cs", "javascript": "js",
            "TypeScript": "ts", "PHP": "php", "Swift": "swift", "Kotlin": "kt", "Dart": "dart", "Go": "go", "Ruby": "rb", "Scala": "scala",
            "Rust": "rs", "Racket": "rkt", "Erlang": "erl", "Elixir": "ex"
        };
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        // ✅ Get current date
        let now = new Date();
        let year = now.getFullYear();   // YYYY
        let month = monthNames[now.getMonth()]; // MMMM
        let day = String(now.getDate()).padStart(2, "0");  // DD

        // ✅ Format file path with folders
        const problemTitle = title.replace(/ /g, "-").toLowerCase();
        const fileName = problemTitle + "." + fileExt[problem_lang.toLowerCase()] || "txt";
        const filePath = `solutions/${year}/${month}/${day}/${fileName}`;

        fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
            headers: { "Authorization": `Bearer ${token}` }
        })
            .then(response => response.json())
            .then(fileData => {
                let fileSHA = fileData.sha || null;
                let requestBody = {
                    message: `Updated: ${filePath}`,
                    content: btoa(code),
                    branch: "main"
                };

                if (fileSHA) {
                    requestBody.sha = fileSHA;
                }

                return fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
                    method: "PUT",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(requestBody)
                });
            })
            .then(response => response.json())
            .then(data => {
                // ✅ Notify `content.js` about successful upload
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    console.log("active tab:", tabs[0].id);
                    chrome.tabs.sendMessage(tabs[0].id, {
                        action: "uploadSuccess",
                        filename: fileName
                    });
                })
            });
    });
}
