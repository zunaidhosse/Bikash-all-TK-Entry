# TK Payment Tracker PWA

This is a simple Progressive Web App (PWA) to track payments.

## How to Deploy to GitHub Pages

Follow these steps to publish your PWA and make it accessible to everyone online.

### Step 1: Create a GitHub Repository

1.  Go to [GitHub](https://github.com/) and log in.
2.  Click the `+` icon in the top right corner and select **New repository**.
3.  Give your repository a name (e.g., `tk-payment-tracker`).
4.  Choose **Public** so that GitHub Pages can serve your site.
5.  Click **Create repository**.

### Step 2: Upload Your Project Files

1.  On your new repository's page, click the **Add file** button and select **Upload files**.
2.  Drag and drop all your project files into the upload area:
    *   `index.html`
    *   `style.css`
    *   `script.js`
    *   `state.js`
    *   `ui.js`
    *   `utils.js`
    *   `invoice.js`
    *   `manifest.json`
    *   `service-worker.js`
    *   `icon-192.png`
    *   `icon-512.png`
    *   `README.md` (this file)
3.  Add a commit message (e.g., "Initial commit") and click **Commit changes**.

### Step 3: Enable GitHub Pages

1.  In your repository, click on the **Settings** tab.
2.  In the left sidebar, click on **Pages**.
3.  Under the "Branch" section, select the `main` branch (or `master` if that's your default) from the dropdown menu.
4.  Leave the folder as `/ (root)`.
5.  Click **Save**.

### Step 4: Access Your Live PWA

1.  After saving, GitHub will generate a URL for your live site. It will look something like `https://YOUR_USERNAME.github.io/YOUR_REPOSITORY_NAME/`.
2.  It might take a few minutes for your site to become live. You can refresh the Pages settings page to see the status.
3.  Once it's published, visit the URL in your browser (preferably Chrome on a desktop or Android device to test the PWA features).

### Testing the PWA

*   **Offline Mode**: Open your site, then in your browser's developer tools, go to the "Network" tab and check the "Offline" box. Refresh the page. It should still load from the cache.
*   **Installation**: After visiting the site a couple of times, you should see the "Install App" button appear. Clicking it will prompt you to add the app to your home screen or desktop.
