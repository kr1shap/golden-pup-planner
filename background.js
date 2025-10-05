// background.js - service worker

let activeTab = null;
let lastActiveTime = Date.now();

// cached tracked sites (populated from storage)
let trackedSet = new Set();

let trackedSitesArray = ["notion.so", "leetcode.com"];

// totals (persisted in storage under trackedTotal and otherTotal)
let trackedTotal = 0;
let otherTotal = 0;

// NEW: In-memory variable tracking time on non-tracked sites
let untrackedSitesTime = 0;

// store structure: { domain: seconds }

async function getData() {
    return new Promise((res) => {
        chrome.storage.local.get(['siteTimes'], (resu) => {
            res(resu.siteTimes || {});
        });
    });
}

async function setData(data) {
    return new Promise((res) => {
        chrome.storage.local.set({ siteTimes: data }, () => res());
    });
}

function domainFromUrl(url) {
    try {
        const u = new URL(url);
        return u.hostname.replace(/^www\./, '');
    } catch (e) {
        return 'unknown';
    }
}

async function addTimeToDomain(domain, seconds) {
    // Record time for all domains; increment tracked or other totals accordingly
    const data = await getData();
    data[domain] = (data[domain] || 0) + seconds;
    await setData(data);
    // update aggregate totals
    try {
        const isTracked = trackedSet.has(domain);
        chrome.storage.local.get(['trackedTotal', 'otherTotal', 'untrackedSitesTime'], (res) => {
            const prevTracked = res.trackedTotal || 0;
            const prevOther = res.otherTotal || 0;
            const prevUntracked = res.untrackedSitesTime || 0;
            const t = prevTracked + (isTracked ? seconds : 0);
            const o = prevOther + (isTracked ? 0 : seconds);
            const u = prevUntracked + (isTracked ? 0 : seconds);
            chrome.storage.local.set({ trackedTotal: t, otherTotal: o, untrackedSitesTime: u });
            trackedTotal = t;
            otherTotal = o;
            untrackedSitesTime = u;
        });
    } catch (e) {
        // ignore
    }
}

// track active tab changes and visibility
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    // update time for previous active tab
    const now = Date.now();
    if (activeTab && activeTab.url) {
        const delta = Math.floor((now - lastActiveTime) / 1000);
        const dom = domainFromUrl(activeTab.url);
        if (delta > 0) await addTimeToDomain(dom, delta);
    }

    lastActiveTime = Date.now();
    chrome.tabs.get(activeInfo.tabId, (tab) => {
        if (chrome.runtime.lastError) return;
        activeTab = { id: tab.id, url: tab.url };
    });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (activeTab && activeTab.id === tabId && changeInfo.url) {
        // URL changed on active tab - treat as navigation
        const now = Date.now();
        const delta = Math.floor((now - lastActiveTime) / 1000);
        if (delta > 0 && activeTab.url) {
            addTimeToDomain(domainFromUrl(activeTab.url), delta);
        }
        lastActiveTime = Date.now();
        activeTab.url = changeInfo.url;
    }
});

// when the window or tab loses/gains focus we need to update lastActiveTime
chrome.windows.onFocusChanged.addListener(async (windowId) => {
    const now = Date.now();
    if (windowId === chrome.windows.WINDOW_ID_NONE) {
        // lost focus - update time
        if (activeTab && activeTab.url) {
            const delta = Math.floor((now - lastActiveTime) / 1000);
            if (delta > 0) await addTimeToDomain(domainFromUrl(activeTab.url), delta);
        }
        activeTab = null;
    } else {
        // gained focus - refresh activeTab
        chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
            if (tabs && tabs[0]) {
                activeTab = { id: tabs[0].id, url: tabs[0].url };
                lastActiveTime = Date.now();
            }
        });
    }
});

// periodic heartbeat from content scripts to measure time while page visible
chrome.runtime.onMessage.addListener((msg, sender, sendResp) => {
    if (!msg || !msg.type) return;
    // programmatic trackedSites management
    if (msg.type === 'setTrackedSitesArray') {
        const arr = Array.isArray(msg.sites) ? msg.sites.map(s => String(s).toLowerCase().trim()) : [];
        trackedSitesArray = Array.from(new Set(arr));
        chrome.storage.local.set({ trackedSites: trackedSitesArray }, () => {
            loadTrackedSet();
            sendResp({ ok: true, sites: trackedSitesArray });
        });
        return true;
    }
    if (msg.type === 'getTrackedSitesArray') {
        sendResp({ sites: trackedSitesArray });
        return true;
    }
    if (msg.type === 'addTrackedSite') {
        const s = String(msg.site || '').toLowerCase().trim();
        if (s) {
            trackedSitesArray = Array.from(new Set((trackedSitesArray || []).concat([s])));
            chrome.storage.local.set({ trackedSites: trackedSitesArray }, () => {
                loadTrackedSet();
                sendResp({ ok: true, sites: trackedSitesArray });
            });
            return true;
        }
    }
    if (msg.type === 'removeTrackedSite') {
        const s = String(msg.site || '').toLowerCase().trim();
        trackedSitesArray = (trackedSitesArray || []).filter(x => x !== s);
        chrome.storage.local.set({ trackedSites: trackedSitesArray }, () => {
            loadTrackedSet();
            sendResp({ ok: true, sites: trackedSitesArray });
        });
        return true;
    }
    if (msg.type === 'heartbeat') {
        // heartbeat contains { visible: boolean, url }
        if (msg.visible && sender.tab) {
            // increment small amount since last heartbeat
            // we rely on service worker events as a backup; content script heartbeats help measure per-page visibility accurately
            addTimeToDomain(domainFromUrl(msg.url), msg.seconds || 1);
        }
    } else if (msg.type === 'getTimes') {
        getData().then((data) => sendResp({ times: data }));
        return true; // async
    } else if (msg.type === 'getTotals') {
        // return the cached totals including untracked time
        chrome.storage.local.get(['trackedTotal', 'otherTotal', 'untrackedSitesTime'], (res) => {
            sendResp({
                trackedTotal: res.trackedTotal || 0,
                otherTotal: res.otherTotal || 0,
                untrackedSitesTime: res.untrackedSitesTime || 0
            });
        });
        return true;
    } else if (msg.type === 'getUntrackedTime') {
        // NEW: Dedicated message type to get untracked time
        chrome.storage.local.get(['untrackedSitesTime'], (res) => {
            sendResp({ untrackedSitesTime: res.untrackedSitesTime || 0 });
        });
        return true;
    } else if (msg.type === 'reset') {
        chrome.storage.local.set({
            siteTimes: {},
            trackedTotal: 0,
            otherTotal: 0,
            untrackedSitesTime: 0
        }, () => {
            trackedTotal = 0;
            otherTotal = 0;
            untrackedSitesTime = 0;
            sendResp({ ok: true });
        });
        return true;
    }
});

// load trackedSites into trackedSet and recompute totals
function loadTrackedSet() {
    // use the in-memory trackedSitesArray as the source of truth
    const arr = Array.isArray(trackedSitesArray) ? trackedSitesArray : [];
    trackedSet = new Set(arr.map(s => String(s).toLowerCase().trim()));
    // recompute totals based on current siteTimes
    recomputeTotals();
}

function recomputeTotals() {
    getData().then((data) => {
        let t = 0, o = 0, u = 0;
        for (const d of Object.keys(data)) {
            if (trackedSet.has(d)) {
                t += data[d];
            } else {
                o += data[d];
                u += data[d];
            }
        }
        trackedTotal = t;
        otherTotal = o;
        untrackedSitesTime = u;
        chrome.storage.local.set({ trackedTotal: t, otherTotal: o, untrackedSitesTime: u });
    });
}

// watch for changes to trackedSites from popup and update cache
chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.trackedSites) {
        // update the in-memory array from storage change, then reload
        const newVal = changes.trackedSites.newValue;
        trackedSitesArray = Array.isArray(newVal) ? newVal.map(s => String(s).toLowerCase().trim()) : [];
        loadTrackedSet();
    }
});

// ensure we initialize activeTab on startup
chrome.runtime.onStartup.addListener(() => {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
        if (tabs && tabs[0]) {
            activeTab = { id: tabs[0].id, url: tabs[0].url };
            lastActiveTime = Date.now();
        }
    });
    // Load untrackedSitesTime from storage
    chrome.storage.local.get(['untrackedSitesTime'], (res) => {
        untrackedSitesTime = res.untrackedSitesTime || 0;
    });
});

// also initialize immediately when installed
chrome.runtime.onInstalled.addListener(() => {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
        if (tabs && tabs[0]) {
            activeTab = { id: tabs[0].id, url: tabs[0].url };
            lastActiveTime = Date.now();
        }
    });
    // Load untrackedSitesTime from storage
    chrome.storage.local.get(['untrackedSitesTime'], (res) => {
        untrackedSitesTime = res.untrackedSitesTime || 0;
    });
});

// initialize tracked set immediately
loadTrackedSet();