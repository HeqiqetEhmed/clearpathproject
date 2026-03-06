# ClearPath

A mindful sobriety tracker with live supporter messaging and AI-powered insights.
Runs entirely on your machine. No subscription. No server. Free to use.

---

## What You Need Before Starting

1. **Node.js** (version 18 or newer)
   Download it at: https://nodejs.org
   Click the big green "LTS" button and install it like any normal program.

2. **A code editor** (optional, only needed if you want to look at or edit files)
   Recommended: https://code.visualstudio.com

3. **A terminal**
   On Mac: press Cmd + Space, type "Terminal", hit Enter.
   On Windows: press the Windows key, type "cmd", hit Enter.

To confirm Node.js installed correctly, open your terminal and type:

    node -v

You should see something like v20.11.0. Any number above 18 is fine.

---

## File Overview

Here is every file in the project and what it does:

    clearpath/
    +-- index.html          The browser entry point. Do not edit this.
    +-- package.json        Lists the dependencies. Do not edit this.
    +-- vite.config.js      Build configuration. Do not edit this.
    +-- .env.example        Template for your API key. You will copy this.
    +-- .env                Your actual API key file. You will create this.
    +-- README.md           This file.
    +-- src/
        +-- main.jsx        Starts the React app. Do not edit this.
        +-- App.jsx         The entire application UI and logic.
        +-- useAI.js        Handles all communication with OpenAI.

The only files you will ever need to touch are:

- .env (to add your OpenAI key)
- src/App.jsx (if you want to customize anything)
- src/useAI.js (if you want to change AI behavior)

---

## Setup (Do This Once)

### Step 1: Unzip the project

Unzip clearpath.zip somewhere easy to find, like your Desktop.
You will get a folder called clearpath.

### Step 2: Open a terminal inside the folder

On Mac:
Open Terminal. Type cd followed by a space, then drag the clearpath folder
into the terminal window. Press Enter.

On Windows:
Open the clearpath folder in File Explorer. Click the address bar at the top,
type cmd, and press Enter. A terminal will open already inside the folder.

You should now see something like:

    your-computer:clearpath yourname$

### Step 3: Install dependencies

Type this exactly and press Enter:

    npm install

This downloads the packages the app needs. It takes about 30 seconds.
You will see a lot of text scroll by. That is normal. Wait for it to finish.

### Step 4: Set up your OpenAI API key

You only need this if you want the AI Insights and Companion Chat features.
If you want to skip AI for now, jump straight to Step 5.

Get a key:
Go to https://platform.openai.com/api-keys and sign in or create an account.
Click "Create new secret key". Copy the key. It starts with sk-.

Add it to the project:
In your terminal, type:

    cp .env.example .env

Then open the .env file in any text editor (Notepad on Windows, TextEdit on Mac,
or VS Code). You will see this:

    VITE_OPENAI_KEY=sk-...your-key-here...

Replace sk-...your-key-here... with your actual key. Save the file.

### Step 5: Start the app

Type this and press Enter:

    npm run dev

You will see output like this:

    VITE ready in 300ms

    Local:   http://localhost:5173/
    Network: http://192.168.x.x:5173/

Open your browser and go to:

    http://localhost:5173

The app is now running.

---

## Running the Demo With Two Instances

This is how you show the supporter and tracker sides at the same time.

Open two browser tabs, both pointing to:

    http://localhost:5173

Tab 1: Click "I am on a journey" to open the tracker side.

Tab 2: Click "I am a supporter", then enter the code:

    CLRP-7423

Now type a message in Tab 2 and send it.
Switch to Tab 1 and open the Messages tab. The message appears instantly
with no refresh needed.

This works because both tabs share the same localStorage on your machine and
communicate through a BroadcastChannel, which is a browser feature that allows
tabs to talk to each other in real time.

---

## Using the AI Features

Once your OpenAI key is set up, two features become available inside the tracker.

Daily Insights (the star tab):
The app reads your mood, craving log, journal entries, and supporter messages
and sends them to GPT-4o. It comes back with a short personal reflection written
specifically for you. This generates once per day and is saved locally so it does
not keep calling the API on every page load. You can hit the Refresh button to
regenerate it manually at any time.

Companion Chat (the floating leaf button):
A chat window you can open at any time. The companion knows your full history
because every message you send includes your logs as context. It responds like
someone who actually knows what you have been going through, not a generic
chatbot.

---

## Stopping the App

Go back to your terminal and press:

    Ctrl + C

The server stops. Your data is saved in your browser's localStorage and will
still be there next time.

---

## Starting Again After Closing

Every time you want to run the app again, open your terminal, navigate to the
clearpath folder, and type:

    npm run dev

That is all.

---

## Showing the App on Your Phone (Same Wi-Fi Only)

When you run npm run dev, look for the Network line in the output:

    Network: http://192.168.1.5:5173/

Type that address into your phone browser while both your phone and laptop are
on the same Wi-Fi network. The app will load on your phone.

Note: Messages will not sync between your phone and laptop in this setup because
they use different localStorage. For a cross-device demo you would need a hosted
backend, which is a separate step.

---

## Troubleshooting

"npm is not recognized" or "command not found"
Node.js did not install correctly. Go back to https://nodejs.org, download the
LTS version, and reinstall it. Then close and reopen your terminal.

The page shows a blank white screen.
Open the browser developer console (press F12, then click Console). Look for
any red error messages and check that your .env file exists and is formatted
correctly.

AI features say "Missing VITE_OPENAI_KEY".
Your .env file is either missing or has a typo. Make sure the file is named
exactly .env (not .env.txt or env) and that your key starts with sk-.

Port already in use.
Another program is using port 5173. Either close it, or type this to use a
different port:

    npm run dev -- --port 3000

Messages are not syncing between tabs.
Make sure both tabs are on exactly the same URL including the port number. If
one is on localhost:5173 and the other is on 127.0.0.1:5173 they will not
share storage.
