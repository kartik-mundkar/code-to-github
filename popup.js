chrome.storage.local.get(["githubToken","githubUsername","githubRepo"], (data) => {
    if (data.githubToken) {
        // console.log("Token found:", data.githubToken);
        document.getElementById("githubToken").value = data.githubToken;
        document.getElementById("githubUserName").value = data.githubUsername;
        document.getElementById("githubRepo").value = data.githubRepo;
    }
});

document.getElementById("saveData").addEventListener("click", () => {
    let token = document.getElementById("githubToken").value;
    let username = document.getElementById("githubUserName").value;
    let repo = document.getElementById("githubRepo").value;
    if (token && username && repo) {
        storage_data = {
            "githubToken": token,
            "githubUsername": username,
            "githubRepo": repo
        }
        chrome.storage.local.set(storage_data, () => {
            showMessage("Data saved!", "green");
        });
    } else {
        showMessage("Enter a valid Data!", "red");
    }
});

function showMessage(msg, color) {
    let statusEl = document.getElementById("status");
    statusEl.innerText = msg;
    statusEl.style.color = color;
}


