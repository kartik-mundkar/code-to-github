# code-to-github
Chrome extension to automate the task of uploading the solution to coding problems from coding platforms to GitHub repository.


## 🚀 Overview

*code-to-github* is a Chrome extension that automatically uploads solved coding problems from LeetCode and GeeksforGeeks to a GitHub repository. The extension extracts the problem title, code, and language, then organizes solutions in a structured GitHub repository.


## 📌 Features

✅ Supports LeetCode & GeeksforGeeks.

✅ Auto-extracts problem title & code.

✅ Draggable 'Upload to GitHub' button for easy access.

✅ Uploads solutions into date-wise structured folders.

✅ Success & failure notifications with toasts.

## 🔧 Installation Guide

### 1️⃣ Download the Extension

Clone this repository:

git clone https://github.com/your-repo/code-to-github.git

Open Chrome and go to chrome://extensions/.

Enable Developer Mode (toggle in the top-right corner).

Click Load Unpacked and select the cloned repository folder.

The extension is now installed! 🎉

### 2️⃣ Set Up GitHub Integration ( Use a Personal Access Token (Fine-grained) )

Go to GitHub Personal Access Tokens and generate a token with repo scope.

Open the extension popup and enter:

GitHub Username

Repository Name

Access Token

Click Save Data. Now, your code will be uploaded securely!

## 🛠 How It Works

Visit LeetCode or GeeksforGeeks.

Click the floating "Upload to GitHub" button.

The extension extracts the problem title, code, and language.

It formats the file as:

>  solutions/YYYY/MM/DD/problem-title.extension

The file is committed to your GitHub repository!


