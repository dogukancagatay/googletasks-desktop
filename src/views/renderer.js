const electron = require("electron");
const { remote, ipcRenderer } = require("electron");
const { screen } = remote;

let BrowserWindow = remote.getCurrentWindow();

let close = document.querySelector(".js-close");
let pin = document.querySelector(".js-pin");
let magnetic = document.querySelector(".js-magnetic");
let drag = document.querySelector(".js-drag");
let title = document.querySelector(".js-title");
let wait = document.querySelector(".js-wait");

let webview = document.getElementById("view");


close.addEventListener("click", function () {
    ipcRenderer.send("close-main-window");
});

pin.addEventListener("click", function () {
    pin.classList.toggle("is-pinned");
    if (pin.classList.contains("is-pinned")) {
        BrowserWindow.setAlwaysOnTop(true);
    } else {
        BrowserWindow.setAlwaysOnTop(false);
    }
});

magnetic.addEventListener("click", function () {
    magnetic.classList.toggle("is-magnetized");
    if (magnetic.classList.contains("is-magnetized")) {
        BrowserWindow.setPosition(
            screen.getPrimaryDisplay().workAreaSize.width - BrowserWindow.getBounds().width,
            screen.getPrimaryDisplay().workAreaSize.height - BrowserWindow.getBounds().height
        );
        drag.classList.remove("drag");
    } else {
        drag.classList.add("drag");
    }
});

BrowserWindow.on("resize", function () {
    if (magnetic.classList.contains("is-magnetized")) {
        magnetic.click();
    }
});

ipcRenderer.on("view-load-url", function (e, msg) {
    webview.src = msg;
});


webview.addEventListener("did-get-redirect-request", function (e) {
    if (e.newURL.lastIndexOf("https://www.google.com/accounts/ServiceLogin") === 0) {
        title.innerHTML = "Authenticate";
    }
});


webview.addEventListener("did-start-loading", function () {
    title.innerHTML = "loading...";
});

webview.addEventListener("did-stop-loading", function () {
    title.innerHTML = "Google Tasks";
    wait.style.display = "none";
});

webview.addEventListener("did-finish-load", function () {
    webview.insertCSS("html, body{background:white!important}");
});
