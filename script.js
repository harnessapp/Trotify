// Trotify Dashboard v1
// For local testing, copy:
// C:\harness_scraper\harness_api\upcoming_fields.csv
// into:
// C:\trotify_dashboard\upcoming_fields.csv

const RAW_BASE_URL = "https://raw.githubusercontent.com/harnessapp/harness-csv-data/main/";

const CSV_URL = "./upcoming_fields.csv";
const FIELDSIZE_STATS_URL = RAW_BASE_URL + "fieldsize_stats.csv";
const BOX_TICKERS_URL = RAW_BASE_URL + "unicorn_tiers_refined.csv";
const TRIALS_URL = "./data/trials.json";

const FIRST100_URL = "./data/first100.json";

const RACE_FINDER_MEETING_URL = "./meeting_calendar.csv";
const RACE_FINDER_VENUE_URL = "./venue_locations.csv";
const RACE_FINDER_POSTCODE_URL = "./postcode_locations_clean.csv";
const RACE_FINDER_STORAGE_KEY = "trotifyRaceFinderState";

const LIVE_RESULTS_URL = "./live_results_today.csv";

const CHART_RACE_URL = "./chart_race_data.json";
const POSITION_CHART_URL = "./position_chart_data.json";

const HRA_ANALYSIS_URL = "hra_analysis.csv";

const RACE_MEDIA_URL = "race_media.csv";

let chartRacePayload = null;
let chartRaceInstance = null;
let chartRaceTimer = null;
let chartRaceFrameIndex = 0;
let chartRacePlaying = false;
let chartRaceSpeedMs = 2600;
let chartRaceTopN = 12;
let chartRaceSelectedState = "ALL";
let chartRaceSelectedGait = "ALL";
let chartRaceSelectedType = "DRIVER";
let chartRaceSelectedMetric = "WINS";
let chartRaceDroughtEntity = "DRIVER";
let chartRaceLastExplosionKey = "";

let chartRaceLastLeader = "";
let chartRaceLeaderPulseUntil = 0;
let chartRaceFinished = false;
let hraAnalysisRows = [];
let raceMediaRows = [];

let selectedTippingTipster = null;



const RACE_CHART_URL_PARAMS =
    new URLSearchParams(window.location.search);

const RACE_CHART_SOCIAL_MODE =
    RACE_CHART_URL_PARAMS.get("social") === "1";

const RACE_CHART_SOCIAL_TYPE_RAW =
    String(
        RACE_CHART_URL_PARAMS.get("type") || "driver"
    ).toUpperCase();

const RACE_CHART_SOCIAL_TYPE =
    ["DRIVER", "TRAINER", "HORSE"].includes(
        RACE_CHART_SOCIAL_TYPE_RAW
    )
        ? RACE_CHART_SOCIAL_TYPE_RAW
        : "DRIVER";


const RESULTS_RECENT_URL = "./results_recent.csv";
let resultsRecentRows = [];
let selectedResultsState = "ALL";
let selectedResultsDate = "";
let selectedResultsVenue = "ALL";

const RESULTS_LOOKBACK_DAYS = 90;

const TAB_DIVIDENDS_URL = "./tab_dividends.csv";
let tabDividendRows = [];

const CHARITY_TIPS_URL = "./charity_tips_settled.csv";
let charityTipRows = [];

let expandedResultsVenues = new Set();

let liveResultsRows = [];

let first100Payload = null;
let first100RaceMap = new Map();

let first100CurrentRace = null;
let first100SelectedMetric = "weighted";
let first100SelectedDistance = "100";
let first100PlayRaf = null;
let first100IsPlaying = false;

let rfRaces = [];
let rfVenueLocations = {};
let rfPostcodeLocations = {};
let rfLoaded = false;

let selectedLast30State = "ALL";

let timelineRefreshTimer = null;
let latestResultsRefreshTimer = null;
let latestResultNewRaceKeys = new Set();

let first100CurrentMap = {
    container: null,
    mapEl: null,
    track: null,
    post: null,
    postLabel: null,
    runnersByKey: {}
};

let positionChartPayload = null;

let positionChartSelectedState = "ALL";
let positionChartSelectedVenue = "ALL";
let positionChartSelectedDistance = "ALL";
let positionChartSelectedGait = "ALL";
let positionChartSelectedStart = "MOBILE";
let positionChartSelectedCategory = "BARRIER";
let positionChartSelectedMetric = "STRIKE_RATE";


const DRIVER_TABLES = [
    { file: "Hot Drivers 30.csv", title: "Hot Drivers - last 30 days" },
    { file: "Hot Drivers.csv", title: "Hot Drivers - last 100" },
    { file: "Cold Drivers 30.csv", title: "Cold Drivers - last 30 days" },
    { file: "Cold Drivers.csv", title: "Cold Drivers - last 100" },
    { file: "Lead Drivers.csv", title: "Leader Drivers" },
    { file: "First Over Crush Drivers.csv", title: "Death Seat Drivers" },
    { file: "Odds On Drivers.csv", title: "Odds on Drivers" },
    { file: "Roughie Drivers.csv", title: "Roughie Drivers" },
    { file: "Second Row Drivers.csv", title: "Second Row Drivers" }
];

const TRAINER_TABLES = [
    { file: "Hot Trainers 30.csv", title: "Hot Trainers - last 30 days" },
    { file: "Hot Trainers.csv", title: "Hot Trainers - last 100" },
    { file: "Cold Trainers 30.csv", title: "Cold Trainers - last 30 days" },
    { file: "Cold Trainers.csv", title: "Cold Trainers - last 100" },
    { file: "Lead Trainers.csv", title: "Leader Trainers" },
    { file: "First Over Crush Trainers.csv", title: "Death Seat Trainers" },
    { file: "Odds On Trainers.csv", title: "Odds on Trainers" },
    { file: "Roughie Trainers.csv", title: "Roughie Trainers" },
    { file: "Second Row Trainers.csv", title: "Second Row Trainers" }
];

const DAILY_WRAPS_URL = "https://raw.githubusercontent.com/harnessapp/daily-wraps/main/daily_wraps.json";

const MEETING_CALENDAR_URL = "./meeting_calendar.csv";

let meetingCalendarRows = [];
let meetingCalendarLoaded = false;
let selectedMeetingCalendarState = "ALL";
let meetingCalendarSearch = "";

let allDailyWraps = [];
let selectedWrapDate = "";

let selectedTrainerState = "ALL";

let allRows = [];

let nextRaceCountdownTimer = null;

let nextUpPageTimer = null;

let selectedNextUpState = "ALL";
let selectedFeatureRaceState = "ALL";
let selectedLatestResultsState = "ALL";

let selectedDriverState = "ALL";
let selectedStableChangeState = "ALL";

let selectedGoodLeaderState = "ALL";
let selectedModelTipState = "ALL";

let selectedVenueStatMode = "off";
let fieldSizeStatsRows = [];
let selectedSizePosition = "LEAD";
let sizePopupOpen = false;
let runnerDisplayMode = "comments"; // comments, trials, map
let trialsPayload = null;
let trialRunnerMap = new Map();

let boxTickerRows = [];
let selectedBoxTickerState = "ALL";

document.addEventListener("DOMContentLoaded", async () => {
    setDateLabel();
    setInterval(setDateLabel, 1000);

    setupNavigation();
    setupMeetingCalendarButton();

    loadMergedMeta().then(meta => {
        if (!meta) return;

        const el = document.getElementById("heroDataMeta");
        if (!el) return;

        const sinceYear =
            meta.data_from
                ? String(meta.data_from).slice(0, 4)
                : "2021";

        const races =
            Number(meta.races || 0).toLocaleString("en-AU");

        const runs =
            Number(meta.runners || 0).toLocaleString("en-AU");

        el.textContent =
            window.innerWidth <= 700
                ? `Since ${sinceYear} · ${races} races · ${runs} runs`
                : `Harness data since ${sinceYear} · ${races} races · ${runs} runs`;
    });


    /*
       =====================================================
       STAGE 1 - LOAD ONLY WHAT THE HOME PAGE NEEDS FIRST
       =====================================================
    */

    allRows = await loadUpcomingFields();

    // Get useful content onto the screen immediately
    renderDashboard(allRows);

    setInterval(refreshNextToGoCard, 60000);

    /*
       These can start immediately without holding up
       Next To Go / Today's Racing.
    */
    updateLatestDailyWrapCard();
    updateLast30HomeTile();


    /*
       =====================================================
       STAGE 2 - LOAD EVERYTHING ELSE IN PARALLEL
       =====================================================
    */

    const trialsPromise = loadTrialsData()
        .then(data => {
            trialsPayload = data;
            trialRunnerMap = buildTrialRunnerMap(trialsPayload);
        });

    const first100Promise = loadFirst100Data()
        .then(data => {
            first100Payload = data;
            first100RaceMap = buildFirst100RaceMap(first100Payload);
        });

    const hraPromise = loadHraAnalysis()
        .then(data => {
            hraAnalysisRows = data;
            console.log(
                "HRA Analysis loaded:",
                hraAnalysisRows.length
            );
        });

    const raceMediaPromise = loadRaceMedia()
        .then(data => {
            raceMediaRows = data;
            console.log(
                "Race media loaded:",
                raceMediaRows.length
            );
        });

    const fieldSizePromise = loadFieldSizeStats()
        .then(data => {
            fieldSizeStatsRows = data;
        });

    const boxTickerPromise = loadBoxTickers()
        .then(data => {
            boxTickerRows = data;
        });

    const liveResultsPromise = loadLiveResults()
        .then(data => {
            liveResultsRows = data;

            // Populate latest results as soon as this file arrives
            renderLatestResultsHomeTile();

            startLatestResultsRefresh();
        });

    const dividendsPromise = loadTabDividends()
        .then(data => {
            tabDividendRows = data;
        });

    const charityPromise = loadCharityTips()
        .then(data => {
            charityTipRows = data;
        });

    const recentResultsPromise = loadResultsRecent()
        .then(data => {
            resultsRecentRows = data;
        });


    /*
       =====================================================
       STAGE 3 - START THE WIRE AFTER THE IMPORTANT
       BACKGROUND DATA HAS HAD A CHANCE TO ARRIVE
       =====================================================
    */

    Promise.allSettled([
        liveResultsPromise,
        boxTickerPromise,
        charityPromise
    ]).then(() => {
        setupTrotifyWire();
    });


    /*
       =====================================================
       OPTIONAL SOCIAL RACE CHART MODE
       =====================================================
    */

    if (RACE_CHART_SOCIAL_MODE) {
        document.body.classList.add("race-chart-social");

        chartRaceTopN = 8;

        chartRaceSelectedType =
            RACE_CHART_SOCIAL_TYPE;

        chartRaceSelectedMetric = "WINS";
        chartRaceSelectedState = "ALL";
        chartRaceSelectedGait = "ALL";

        await showRaceChartsView();
    }
});

function closeMobileStatsPopup() {
    document.querySelector(".mobile-stats-popup")?.remove();
}

function openMobileStatsPopup(target) {

    const tooltip = target.querySelector(
        ".horse-stats-tooltip, .barrier-stats-tooltip, .person-stats-tooltip, .record-tooltip, .race-summary-tooltip, .race-roi-tooltip"
    );

    if (!tooltip) return;

    closeMobileStatsPopup();

    const popup = tooltip.cloneNode(true);

    popup.classList.add("mobile-stats-popup");

    const isRaceSummary =
        popup.classList.contains("race-summary-tooltip");

    if (isRaceSummary) {
        popup.classList.add("mobile-race-summary-popup");
    }

    popup.style.setProperty("display", "block", "important");
    popup.style.setProperty("position", "fixed", "important");

    /*
       Race summary gets its own compact mobile geometry.
       Other existing popups retain their current behaviour.
    */
    if (isRaceSummary) {

        popup.style.setProperty("left", "20px", "important");
        popup.style.setProperty("right", "20px", "important");

        popup.style.setProperty("padding", "10px", "important");

        popup.style.setProperty("max-height", "78vh", "important");
        popup.style.setProperty("overflow-x", "hidden", "important");

    } else {

        popup.style.setProperty("left", "12px", "important");
        popup.style.setProperty("right", "12px", "important");

        popup.style.setProperty("max-height", "75vh", "important");
    }

    popup.style.setProperty("top", "50%", "important");
    popup.style.setProperty("bottom", "auto", "important");

    popup.style.setProperty("width", "auto", "important");
    popup.style.setProperty("min-width", "0", "important");
    popup.style.setProperty("max-width", "none", "important");

    popup.style.setProperty(
        "transform",
        "translateY(-50%)",
        "important"
    );

    popup.style.setProperty("z-index", "999999", "important");
    popup.style.setProperty("overflow-y", "auto", "important");

    document.body.appendChild(popup);
}


document.addEventListener("click", function (e) {

    if (window.innerWidth > 700) return;

    const target = e.target.closest(
        ".horse-hover, .barrier-hover, .stat-hover, .record-hover, .mobile-race-summary, .race-roi-hover"
    );

    /* Horse / barrier / trainer / driver */
    if (target) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        openMobileStatsPopup(target);
        return;
    }

    /* Tapping the popup itself should not close it */
    if (e.target.closest(".mobile-stats-popup")) {
        e.stopPropagation();
        return;
    }

    /* Anything else closes it */
    closeMobileStatsPopup();

}, true);


async function loadUpcomingFields() {
    try {
        const response = await fetch(
            CSV_URL + "?v=" + Date.now(),
            { cache: "no-store" }
        );

        if (!response.ok) {
            throw new Error(`Could not load ${CSV_URL}`);
        }

        const text = await response.text();
        const parsed = parseCSV(text);

        if (!parsed.length) {
            throw new Error("CSV loaded but no rows were found");
        }

        return parsed;
    } catch (error) {
        console.log("Using fallback dashboard data:", error);

        return [
            { Venue: "Horsham", State: "VIC", "Race No": "R1", Time: "12:17pm", Date: todayIso(), "Ld %": "18" },
            { Venue: "Penrith", State: "NSW", "Race No": "R1", Time: "12:26pm", Date: todayIso(), "Ld %": "21" },
            { Venue: "Globe Derby Park", State: "SA", "Race No": "R1", Time: "12:44pm", Date: todayIso(), "Ld %": "9" },
            { Venue: "Pinjarra", State: "WA", "Race No": "R1", Time: "1:56pm", Date: todayIso(), "Ld %": "16" },
            { Venue: "Redcliffe", State: "QLD", "Race No": "R1", Time: "6:07pm", Date: todayIso(), "Ld %": "22" },
            { Venue: "Menangle", State: "NSW", "Race No": "R1", Time: "1:33pm", Date: addDaysIso(1), "Ld %": "18" },
            { Venue: "Albion Park", State: "QLD", "Race No": "R1", Time: "1:47pm", Date: addDaysIso(1), "Ld %": "20" },
            { Venue: "Shepparton", State: "VIC", "Race No": "R1", Time: "4:58pm", Date: addDaysIso(1), "Ld %": "14" },
            { Venue: "Young", State: "NSW", "Race No": "R1", Time: "5:42pm", Date: addDaysIso(1), "Ld %": "19" },
            { Venue: "Gloucester Park", State: "WA", "Race No": "R1", Time: "6:50pm", Date: addDaysIso(1), "Ld %": "17" },
            { Venue: "Bathurst", State: "NSW", "Race No": "R1", Time: "3:23pm", Date: addDaysIso(2), "Ld %": "18" }
        ];
    }
}

async function loadBoxTickers() {
    try {
        const response = await fetch(BOX_TICKERS_URL, { cache: "no-store" });

        if (!response.ok) {
            throw new Error(`Could not load ${BOX_TICKERS_URL}`);
        }

        const text = await response.text();
        return parseCSV(text);
    } catch (error) {
        console.log("Box Tickers not loaded:", error);
        return [];
    }
}

async function loadFieldSizeStats() {
    try {
        const response = await fetch(FIELDSIZE_STATS_URL, { cache: "no-store" });

        if (!response.ok) {
            throw new Error(`Could not load ${FIELDSIZE_STATS_URL}`);
        }

        const text = await response.text();
        return parseCSV(text);
    } catch (error) {
        console.log("Field size stats not loaded:", error);
        return [];
    }
}

async function loadTrialsData() {
    try {
        const response = await fetch(TRIALS_URL, { cache: "no-store" });

        if (!response.ok) {
            throw new Error(`Could not load ${TRIALS_URL}`);
        }

        return await response.json();
    } catch (error) {
        console.log("Trials data not loaded:", error);
        return null;
    }
}

async function loadHraAnalysis() {
    try {
        const response = await fetch(
            "hra_analysis.csv",
            { cache: "no-store" }
        );

        if (!response.ok) {
            throw new Error("Could not load hra_analysis.csv");
        }

        const text = await response.text();

        return parseCSV(text);

    } catch (e) {
        console.error("Failed to load HRA Analysis:", e);
        return [];
    }
}

async function loadRaceMedia() {
    try {
        const response = await fetch(
            RACE_MEDIA_URL,
            { cache: "no-store" }
        );

        if (!response.ok) {
            throw new Error("Could not load race_media.csv");
        }

        const text = await response.text();
        const rows = parseCSV(text);

        return addDerivedRaceMediaTimes(rows);

    } catch (error) {
        console.error("Failed to load race media:", error);
        return [];
    }
}

function mediaTimestampToSeconds(value) {
    const parts = String(value || "")
        .trim()
        .split(":")
        .map(Number);

    if (!parts.length || parts.some(Number.isNaN)) {
        return null;
    }

    if (parts.length === 2) {
        return parts[0] * 60 + parts[1];
    }

    if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }

    return null;
}

function addDerivedRaceMediaTimes(rows) {
    const groups = new Map();

    rows.forEach(row => {
        row.RaceAnchorFull = normaliseRaceAnchor(
            row.RaceAnchorFull || ""
        );

        // StartTimestamp contains total elapsed seconds:
        // e.g. 1 min 25 sec = 85
        row.StartSeconds = Number(row.StartTimestamp);

        if (!Number.isFinite(row.StartSeconds)) {
            row.StartSeconds = null;
        }

        const groupKey = clean(row.URL || "");

        if (!groupKey) return;

        if (!groups.has(groupKey)) {
            groups.set(groupKey, []);
        }

        groups.get(groupKey).push(row);
    });

    groups.forEach(group => {
        group.sort((a, b) => {
            return (a.StartSeconds ?? 999999) -
                   (b.StartSeconds ?? 999999);
        });

        group.forEach((row, index) => {
            const nextRow = group[index + 1];

            row.EndSeconds = nextRow?.StartSeconds ?? null;
        });
    });

    return rows;
}

function getRaceMedia(raceAnchorFull) {
    const key = normaliseRaceAnchor(raceAnchorFull);

    return raceMediaRows.filter(row =>
        normaliseRaceAnchor(row.RaceAnchorFull) === key
    );
}


let selectedRaceNo = null;

function openHraAnalysisPopup(raceAnchorFull) {

    const race = hraAnalysisRows.find(
        r => r.RaceAnchorFull === raceAnchorFull
    );

    if (!race) {
        alert("HRA Analysis not available for this race.");
        return;
    }

    const analysis = race["HRA Analysis"] || "";

    const popup = document.createElement("div");
    popup.className = "hra-popup-overlay";

    popup.innerHTML = `
        <div class="hra-popup">
            <div class="hra-popup-header">
                <h3>HRA Analysis</h3>
                <button onclick="this.closest('.hra-popup-overlay').remove()">✕</button>
            </div>

            <div class="hra-popup-body">
                ${escapeHtml(analysis).replace(/\n/g, "<br>")}
            </div>
        </div>
    `;

    document.body.appendChild(popup);
}

function renderHraAnalysisHover(raceAnchorFull) {
    const race = hraAnalysisRows.find(
        row => row.RaceAnchorFull === raceAnchorFull
    );

    if (!race) return "";

    const analysis = race["HRA Analysis"] || "";

    return `
        <div class="hra-analysis-hover"
            onclick="event.stopPropagation()">

            <button
                type="button"
                class="field-result-button hra-analysis-hover-button">
                HRA Analysis
            </button>

            <div class="hra-analysis-hover-panel">
                <div class="hra-analysis-hover-title">
                    HRA Analysis
                </div>

                <div class="hra-analysis-hover-body">
                    ${escapeHtml(analysis).replace(/\r?\n/g, "<br>")}
                </div>
            </div>
        </div>
    `;
}

function openUpcomingFieldsDrawer(event) {
    if (event) event.stopPropagation();

    const layout = document.getElementById("upcomingFieldsLayout");
    if (layout) layout.classList.add("drawer-open");
}

function closeUpcomingFieldsDrawer() {
    const layout = document.getElementById("upcomingFieldsLayout");
    if (layout) layout.classList.remove("drawer-open");
}

function enterUpcomingRaceFocus() {
    const layout = document.getElementById("upcomingFieldsLayout");
    if (!layout) return;

    layout.classList.add("race-focus");
    layout.classList.remove("drawer-open");
}

function selectRace(venue, state, dateValue, raceNo) {
    selectedRaceNo = raceNo;

    renderRaceDetail(venue, state, dateValue, raceNo);
    enterUpcomingRaceFocus();

    const meetings = groupMeetings(allRows);
    const meeting = meetings.find(m =>
        m.venue === venue &&
        m.state === state &&
        m.dateValue === dateValue
    );

    if (meeting) {
        renderRaceListForMeeting(allRows, meeting);
    }
}

function resetMobileViewScroll() {
    if (window.innerWidth > 700) return;

    document.documentElement.style.scrollBehavior = "auto";
    document.body.style.scrollBehavior = "auto";

    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    requestAnimationFrame(() => {
        window.scrollTo(0, 0);

        requestAnimationFrame(() => {
            window.scrollTo(0, 0);
        });
    });

    setTimeout(() => {
        window.scrollTo(0, 0);
    }, 100);
}

function setupNavigation() {
    document.querySelectorAll(".nav-item").forEach(item => {
        item.addEventListener("click", function (e) {
            e.preventDefault();

            document.querySelectorAll(".nav-item").forEach(i => i.classList.remove("active"));
            this.classList.add("active");

            const view = this.dataset.view;

            if (view === "home") {
                showHomeView();
            } else if (view === "upcoming") {
                showUpcomingFieldsView();
            } else if (view === "next-up") {
                showNextUpView();
            } else if (view === "feature-races") {
                showFeatureRacesView();
            } else if (view === "latest-results") {
                showLatestResultsView();
            } else if (view === "results") {
                showResultsView();
            } else if (view === "timeline") {
                showTimelineView();
            } else if (view === "drivers") {
                showDriversView();
            } else if (view === "trainers") {
                showTrainersView();
            } else if (view === "daily-wraps") {
                showDailyWrapsView();
            } else if (view === "tipping-comp") {
                showTippingCompView();
            } else if (view === "stable-changes") {
                showStableChangesView();
            } else if (view === "watchlist") {
                showWatchlistView();
            } else if (view === "good-leaders") {
                showGoodLeadersView();
            } else if (view === "model-tips") {
                showModelTipsView();
            } else if (view === "box-tickers") {
                showBoxTickersView();
            } else if (view === "race-charts") {
                showRaceChartsView();
            } else if (view === "race-finder") {
                showRaceFinderView();
            } else {
                showComingSoonView(this.innerText.trim());
            }

            resetMobileViewScroll();
        });
    });
}

function showModelTipsView() {
    clearNextUpTimer();

    document.querySelector(".hero").style.display = "none";
    document.querySelector(".dashboard-grid").style.display = "none";
    document.querySelector(".meetings-panel").style.display = "";

    document.querySelector(".panel-heading").innerHTML = `
        <span>🎯</span>
        <span>Model Tips</span>
    `;

    const allTips = getModelTips(allRows);

    const tips = selectedModelTipState === "ALL"
        ? allTips
        : allTips.filter(item => item.state === selectedModelTipState);

    const grouped = groupModelTipsByDay(tips);

    document.getElementById("meetingStrip").innerHTML = `
        <div class="stable-changes-layout">
            <div class="stable-changes-header">
                <div>
                    <h2>${tips.length} model tips found</h2>
                </div>
            </div>

            <div class="driver-state-filter stable-change-filter">
                ${["ALL", "VIC", "NSW", "QLD", "SA", "WA", "TAS"].map(state => `
                    <button class="driver-state-button ${selectedModelTipState === state ? "selected" : ""}"
                        onclick="setModelTipStateFilter('${state}')">
                        ${state}
                    </button>
                `).join("")}
            </div>

            ${grouped.length ? grouped.map(renderModelTipDayGroup).join("") : `
                <div class="coming-soon-card">
                    <div class="coming-soon-title">No model tips found</div>
                    <p>No upcoming runners match the selected state filter.</p>
                </div>
            `}
        </div>
    `;
}

function showTippingCompView() {
    stopTimelineRefresh();
    clearNextUpTimer();

    document.querySelector(".hero").style.display = "none";
    document.querySelector(".dashboard-grid").style.display = "none";
    document.querySelector(".meetings-panel").style.display = "";

    document.querySelector(".panel-heading").innerHTML = `
        <span>🏆</span>
        <span>Tipping Comp</span>
    `;

    renderTippingCompView();
}


function renderTippingCompView() {
    const rows = charityTipRows || [];
    const tipsters = ["Joel", "Mick", "Sarah"];

    const leaderboard = tipsters.map(name => {
        const tips = rows.filter(row =>
            clean(row.Tipster || "").toLowerCase() === name.toLowerCase()
        );

        const settled = tips.filter(row =>
            clean(row.SettlementStatus || "").toUpperCase() === "SETTLED"
        );

        const pending = tips.filter(row =>
            clean(row.SettlementStatus || "").toUpperCase() !== "SETTLED"
        );

        const profit = settled.reduce((sum, row) => {
            const value = Number(row.Profit);
            return sum + (Number.isFinite(value) ? value : 0);
        }, 0);

        const stake = settled.reduce((sum, row) => {
            const value = Number(row.Stake);
            return sum + (Number.isFinite(value) ? value : 0);
        }, 0);

        return {
            name,
            tips,
            settled,
            pending,
            profit,
            stake
        };
    });

    leaderboard.sort((a, b) => {
        if (b.profit !== a.profit) {
            return b.profit - a.profit;
        }

        return a.name.localeCompare(b.name);
    });

    const upcomingTips = getUpcomingTippingTips(rows);

    document.getElementById("meetingStrip").innerHTML = `
        <div class="tipping-comp-layout">

            <div class="tipping-comp-intro">
                <div class="race-panel-eyebrow">
                    Charity tipping competition
                </div>

                <h2>Leaderboard</h2>

                <p>
                    $100 Win or $50 Each Way.
                    Bonus tips are doubled.
                </p>
            </div>

            <div class="tipping-leaderboard">
                ${leaderboard.map((person, index) =>
                    renderTippingLeaderboardRow(person, index + 1)
                ).join("")}
            </div>

            <div class="tipping-upcoming">
                <div class="race-panel-eyebrow">
                    Next selections
                </div>

                <h2>Upcoming Tips</h2>

                <div class="tipping-upcoming-list">
                    ${upcomingTips.length
                        ? upcomingTips
                            .map(renderUpcomingTippingTip)
                            .join("")
                        : `
                            <div class="coming-soon-card">
                                <div class="coming-soon-title">
                                    No upcoming tips
                                </div>
                                <p>
                                    All current competition tips have settled.
                                </p>
                            </div>
                        `
                    }
                </div>
            </div>

        </div>
    `;
}


function renderTippingLeaderboardRow(person, rank) {
    const hasPending = person.pending.length > 0;

    // Only visually flag pending tips that are racing TODAY
    const hasPendingToday = person.pending.some(row => {
        const timestamp = parseTippingDate(row.Date);

        if (!timestamp) return false;

        const tipDate = new Date(timestamp)
            .toLocaleDateString("en-CA");

        return tipDate === todayIso();
    });

    const profitClass =
        person.profit > 0
            ? "positive"
            : person.profit < 0
                ? "negative"
                : "neutral";

    return `
        <div
            class="tipping-leaderboard-row ${hasPendingToday ? "pending" : ""}"
            onclick="openTippingTipsterPopup('${escapeHtml(person.name)}')"
        >

            <div class="tipping-rank">
                ${rank}
            </div>

            <div class="tipping-person">
                <strong>
                    ${escapeHtml(person.name)}
                </strong>

                <span>
                    ${person.settled.length} settled
                    ${hasPending
                        ? ` • ${person.pending.length} pending`
                        : ""
                    }
                    • click for tips
                </span>
            </div>

            <div class="tipping-profit ${profitClass}">
                ${formatTippingMoney(person.profit, true)}
            </div>

            ${hasPendingToday
                ? `<div class="tipping-pending-pill">PENDING</div>`
                : `<div></div>`
            }

        </div>
    `;
}


function renderTippingHistoryRow(row) {
    const status =
        clean(row.SettlementStatus || "").toUpperCase();

    const isPending = status !== "SETTLED";

    const betType = clean(row.BetType || "");
    const bonus =
        clean(row.Bonus || "").toUpperCase() === "YES";

    const result = clean(row.Result || "");

    const stake = Number(row.Stake);
    const profit = Number(row.Profit);

    return `
        <div class="tipping-history-row ${isPending ? "pending" : ""}">

            <div class="tipping-history-date">
                ${escapeHtml(formatTippingDate(row.Date))}
            </div>

            <div class="tipping-history-selection">
                <strong>
                    ${escapeHtml(row.Horse || row.Selection || "")}
                </strong>

                <span>
                    ${escapeHtml(row.Venue || "")}
                    R${escapeHtml(row["Race No"] || "")}

                    • ${escapeHtml(betType)}

                    ${bonus
                        ? ` • <strong>BONUS</strong>`
                        : ""
                    }
                </span>
            </div>

            <div class="tipping-history-result">
                ${isPending
                    ? `<span class="tipping-pending-text">
                           Pending
                       </span>`
                    : escapeHtml(result || "")
                }
            </div>

            <div class="tipping-history-stake">
                ${Number.isFinite(stake)
                    ? formatTippingMoney(stake)
                    : ""
                }
            </div>

            <div class="tipping-history-profit ${
                Number.isFinite(profit)
                    ? profit > 0
                        ? "positive"
                        : profit < 0
                            ? "negative"
                            : "neutral"
                    : ""
            }">
                ${isPending
                    ? "—"
                    : Number.isFinite(profit)
                        ? formatTippingMoney(profit, true)
                        : ""
                }
            </div>

        </div>
    `;
}

function getUpcomingTippingTips(rows) {
    const now = new Date();

    return (rows || [])
        .filter(row =>
            clean(
                row.SettlementStatus || ""
            ).toUpperCase() !== "SETTLED"
        )
        .map(row => {
            const raceAnchor =
                normaliseRaceAnchor(
                    row.RaceAnchorFull || ""
                );

            const fieldRow = allRows.find(field =>
                normaliseRaceAnchor(
                    field.RaceAnchorFull ||
                    field["RaceAnchorFull"] ||
                    ""
                ) === raceAnchor
            );

            if (!fieldRow) {
                return null;
            }

            const raceDateTime =
                getRaceDateTime(fieldRow);

            if (!raceDateTime) {
                return null;
            }

            return {
                row,
                raceAnchor,
                raceDateTime,
                timeUntil:
                    formatTimeUntil(
                        raceDateTime,
                        now
                    )
            };
        })
        .filter(Boolean)
        .filter(item =>
            item.raceDateTime.getTime() >=
            now.getTime() - 5 * 60 * 1000
        )
        .sort((a, b) =>
            a.raceDateTime - b.raceDateTime
        )
        .slice(0, 5);
}


function renderUpcomingTippingTip(item) {
    const row = item.row;

    const bonus =
        clean(row.Bonus || "").toUpperCase() === "YES";

    return `
        <button
            type="button"
            class="tipping-upcoming-row"
            onclick="openTippingRace('${escapeHtml(item.raceAnchor)}')"
        >

            <div class="tipping-upcoming-time">
                ${escapeHtml(item.timeUntil)}
            </div>

            <div class="tipping-upcoming-tipster">
                ${escapeHtml(row.Tipster || "")}
            </div>

            <div class="tipping-upcoming-selection">
                <strong>
                    ${escapeHtml(
                        row.Horse ||
                        row.Selection ||
                        ""
                    )}
                </strong>

                <span>
                    ${escapeHtml(row.Venue || "")}
                    R${escapeHtml(row["Race No"] || "")}

                    • ${escapeHtml(row.BetType || "")}

                    ${bonus ? " • BONUS" : ""}
                </span>
            </div>

            <div class="race-arrow">
                ›
            </div>

        </button>
    `;
}

function openTippingRace(raceAnchorFull) {
    const target =
        normaliseRaceAnchor(raceAnchorFull);

    const fieldRow = allRows.find(row =>
        normaliseRaceAnchor(
            row.RaceAnchorFull ||
            row["RaceAnchorFull"] ||
            ""
        ) === target
    );

    if (!fieldRow) {
        console.log(
            "Could not find tipping race:",
            raceAnchorFull
        );
        return;
    }

    const venue =
        clean(fieldRow.Venue || "");

    const state =
        clean(
            fieldRow.State ||
            fieldRow.STATE ||
            ""
        );

    const dateValue =
        clean(
            fieldRow.Date ||
            fieldRow.DATE ||
            ""
        );

    const raceNo =
        clean(
            fieldRow["Race No"] ||
            fieldRow.RaceNo ||
            ""
        ).replace(/^R/i, "");

    openRaceFromHome({
        key:
            `${venue}|${state}|${dateValue}|${raceNo}`,
        venue,
        state,
        dateValue,
        raceNo,
        time: getRaceDisplayTime(fieldRow),
        raceDateTime: getRaceDateTime(fieldRow)
    });
}

function toggleTippingTipster(name) {
    openTippingTipsterPopup(name);
}

function openTippingTipsterPopup(tipster) {
    const existing = document.getElementById("tippingTipsterPopup");

    if (existing) {
        existing.remove();
    }

    const tips = (charityTipRows || [])
        .filter(row =>
            clean(row.Tipster || "").toLowerCase() ===
            tipster.toLowerCase()
        )
        .sort((a, b) => {
            const dateA = parseTippingDate(a.Date);
            const dateB = parseTippingDate(b.Date);

            if (dateA !== dateB) {
                return dateB - dateA;
            }

            return Number(b["Race No"] || 0) -
                   Number(a["Race No"] || 0);
        });

    const html = `
        <div
            class="tipping-popup-backdrop"
            id="tippingTipsterPopup"
            onclick="closeTippingTipsterPopup()"
        >
            <div
                class="tipping-popup"
                onclick="event.stopPropagation()"
            >
                <div class="tipping-popup-header">
                    <div>
                        <div class="race-panel-eyebrow">
                            Tip history
                        </div>

                        <h2>
                            ${escapeHtml(tipster)}
                        </h2>
                    </div>

                    <button
                        type="button"
                        onclick="closeTippingTipsterPopup()"
                    >
                        ×
                    </button>
                </div>

                <div class="tipping-popup-list">
                    ${tips.length
                        ? tips
                            .map(renderTippingHistoryRow)
                            .join("")
                        : `
                            <div class="coming-soon-card">
                                No tips recorded.
                            </div>
                        `
                    }
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML(
        "beforeend",
        html
    );
}


function closeTippingTipsterPopup() {
    document
        .getElementById("tippingTipsterPopup")
        ?.remove();
}


function renderTippingTipsterHistory(tipster, rows) {
    const tips = rows
        .filter(row =>
            clean(row.Tipster || "").toLowerCase() ===
            tipster.toLowerCase()
        )
        .sort((a, b) => {
            const dateA = parseTippingDate(a.Date);
            const dateB = parseTippingDate(b.Date);

            if (dateA !== dateB) {
                return dateB - dateA;
            }

            return Number(b["Race No"] || 0) -
                   Number(a["Race No"] || 0);
        });

    return `
        <div class="tipping-person-history">

            <div class="tipping-history-heading">
                <div>
                    <div class="race-panel-eyebrow">
                        Tip history
                    </div>

                    <h2>${escapeHtml(tipster)}</h2>
                </div>

                <button
                    type="button"
                    class="tipping-history-close"
                    onclick="event.stopPropagation(); toggleTippingTipster('${escapeHtml(tipster)}')">
                    ×
                </button>
            </div>

            <div class="tipping-history-list">
                ${tips.length
                    ? tips.map(renderTippingHistoryRow).join("")
                    : `
                        <div class="coming-soon-card">
                            No tips recorded.
                        </div>
                    `
                }
            </div>

        </div>
    `;
}


function parseTippingDate(value) {
    const text = clean(value || "");

    if (!text) {
        return 0;
    }

    // yyyy-mm-dd
    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
        return new Date(text + "T00:00:00").getTime();
    }

    // dd/mm/yyyy
    const match = text.match(
        /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
    );

    if (match) {
        return new Date(
            Number(match[3]),
            Number(match[2]) - 1,
            Number(match[1])
        ).getTime();
    }

    return 0;
}


function formatTippingDate(value) {
    const timestamp = parseTippingDate(value);

    if (!timestamp) {
        return clean(value || "");
    }

    return new Date(timestamp).toLocaleDateString(
        "en-AU",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );
}


function formatTippingMoney(value, showPlus = false) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return "";
    }

    let prefix = "";

    if (number < 0) {
        prefix = "-";
    } else if (showPlus && number > 0) {
        prefix = "+";
    }

    return `${prefix}$${Math.abs(number).toLocaleString("en-AU", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    })}`;
}

function setModelTipStateFilter(state) {
    selectedModelTipState = state;
    showModelTipsView();
}

function getModelTips(rows) {
    const now = new Date();

    return rows.map(row => {
        const venue = clean(row.Venue || "");
        const state = clean(row.State || row.STATE || row["State "] || "").toUpperCase();
        const dateValue = clean(row.Date || row.DATE || row["Meeting Date"] || "");
        const raceNo = clean(row["Race No"] || row.RaceNo || row.Race || "").replace(/^R/i, "");
        const time = getRaceDisplayTime(row);
        const horse = clean(row.Horse || "");
        const horseNo = formatWholeNumber(row["Horse No"] || row.HorseNo || row.Tab || "");
        const trainer = clean(row.Trainer_clean || row["Trainer Clean"] || row.Trainer || "");
        const driver = clean(row.Driver || "");
        const fairOddsRaw = row["Fair Odds"] || row.FairOdds || row["FairOdds"] || "";
        const fairOdds = parseNumber(fairOddsRaw);
        const barrier = clean(row.Barrier || row.BARRIER || "").toUpperCase();

        const dateKey = parseDateToKey(dateValue);
        const raceDateTime = getRaceDateTime(row);

        return {
            key: `${venue}|${state}|${dateValue}|${raceNo}`,
            dateKey,
            dateValue,
            venue,
            state,
            raceNo,
            time,
            horse,
            horseNo,
            trainer,
            driver,
            fairOdds,
            barrier,
            raceDateTime,
            timeUntil: raceDateTime ? formatTimeUntil(raceDateTime, now) : "TBC"
        };
    }).filter(item => {
        if (!item.raceDateTime) return false;
        if (!item.venue || !item.raceNo || !item.horse) return false;
        if (item.barrier.startsWith("SCR") || item.barrier.includes("SCRATCH")) return false;
        if (!Number.isFinite(item.fairOdds)) return false;
        if (item.fairOdds >= 2) return false;

        return item.raceDateTime.getTime() >= now.getTime() - 5 * 60 * 1000;
    }).sort((a, b) => {
        const timeDiff = a.raceDateTime - b.raceDateTime;
        if (timeDiff !== 0) return timeDiff;

        const venueDiff = a.venue.localeCompare(b.venue);
        if (venueDiff !== 0) return venueDiff;

        const raceDiff = Number(a.raceNo || 999) - Number(b.raceNo || 999);
        if (raceDiff !== 0) return raceDiff;

        return Number(a.horseNo || 999) - Number(b.horseNo || 999);
    });
}

function groupModelTipsByDay(tips) {
    const map = new Map();

    tips.forEach(item => {
        const key = item.dateKey || "unknown";
        const label = dayLabelFromDateKey(key, item.dateValue);

        if (!map.has(key)) {
            map.set(key, {
                key,
                label,
                items: []
            });
        }

        map.get(key).items.push(item);
    });

    return [...map.values()].sort((a, b) => {
        return (a.key || "9999-99-99").localeCompare(b.key || "9999-99-99");
    });
}

function renderModelTipDayGroup(group) {
    const midpoint = Math.ceil(group.items.length / 2);
    const leftItems = group.items.slice(0, midpoint);
    const rightItems = group.items.slice(midpoint);

    return `
        <div class="stable-change-day-group">
            <div class="day-heading stable-change-day-heading">
                <span></span>
                <strong>${escapeHtml(group.label)}</strong>
                <span></span>
            </div>

            <div class="stable-change-two-pane">
                <div class="stable-change-list-one-column">
                    ${leftItems.map(renderModelTipRow).join("")}
                </div>

                <div class="stable-change-list-one-column">
                    ${rightItems.map(renderModelTipRow).join("")}
                </div>
            </div>
        </div>
    `;
}

function renderModelTipRow(item) {
    const timeDisplay = item.dateKey === todayIso()
        ? item.timeUntil
        : item.time || "TBC";

    return `
        <div class="stable-change-row-one-line" onclick="openRaceFromHomeByKey('${escapeHtml(item.key)}')">
            <div class="stable-change-time">${escapeHtml(timeDisplay)}</div>
            <div class="stable-change-race">${escapeHtml(shortVenueName(item.venue))} R${escapeHtml(item.raceNo)} No ${escapeHtml(item.horseNo)}</div>
            <div class="stable-change-horse">
                ${escapeHtml(item.horse)}
            </div>
            <div class="stable-change-trainers">
                ${escapeHtml(toProperCase(item.trainer))}
                <span>•</span>
                ${escapeHtml(toProperCase(item.driver))}
            </div>
        </div>
    `;
}

function showBoxTickersView() {
    stopTimelineRefresh();
    clearNextUpTimer();

    document.querySelector(".hero").style.display = "none";
    document.querySelector(".dashboard-grid").style.display = "none";
    document.querySelector(".meetings-panel").style.display = "";

    document.querySelector(".panel-heading").innerHTML = `
        <span>☑️</span>
        <span>Box Tickers</span>
    `;

    const rows = getBoxTickers();

    const filtered = selectedBoxTickerState === "ALL"
        ? rows
        : rows.filter(item => item.state === selectedBoxTickerState);

    const grouped = groupBoxTickersByDay(filtered);

    document.getElementById("meetingStrip").innerHTML = `
        <div class="stable-changes-layout">
            <div class="stable-changes-header">
                <div>
                    <div class="race-panel-eyebrow">Model shortlist</div>
                    <h2>${filtered.length} box tickers found</h2>
                </div>
            </div>

            <div class="driver-state-filter stable-change-filter">
                ${["ALL", "VIC", "NSW", "QLD", "SA", "WA", "TAS"].map(state => `
                    <button class="driver-state-button ${selectedBoxTickerState === state ? "selected" : ""}"
                        onclick="setBoxTickerStateFilter('${state}')">
                        ${state}
                    </button>
                `).join("")}
            </div>

            ${grouped.length ? grouped.map(renderBoxTickerDayGroup).join("") : `
                <div class="coming-soon-card">
                    <div class="coming-soon-title">No Box Tickers found</div>
                    <p>No upcoming runners match the selected state filter.</p>
                </div>
            `}
        </div>
    `;
}

function setBoxTickerStateFilter(state) {
    selectedBoxTickerState = state;
    showBoxTickersView();
}

function getBoxTickers() {
    const now = new Date();

    return (boxTickerRows || []).map(row => {
        const venue = clean(row.Venue || "");
        const state = clean(row.State || row.STATE || row["State "] || "").toUpperCase();
        const dateValue = clean(row.Date || row.DATE || row["Meeting Date"] || "");
        const raceNo = clean(row["Race No"] || row.RaceNo || row.Race || "").replace(/^R/i, "");
        const time = getRaceDisplayTime(row);
        const horse = clean(row.Horse || "");
        const horseNo = formatWholeNumber(row["Horse No"] || row.HorseNo || row.Tab || "");
        const driver = clean(row.Driver || "");
        const barrier = clean(row.Barrier || "");
        const fairOdds = formatNearestOdds(row["Fair Odds"] || "");
        const qualityScore = formatWholeNumber(row.quality_score || "");
        const tier = clean(row.UnicornTier || "").replaceAll("🦄", "✓");

        const dateKey = parseDateToKey(dateValue);
        const raceDateTime = getRaceDateTime(row);

        return {
            key: `${venue}|${state}|${dateValue}|${raceNo}`,
            dateKey,
            dateValue,
            venue,
            state,
            raceNo,
            time,
            horse,
            horseNo,
            driver,
            barrier,
            fairOdds,
            qualityScore,
            tier,
            raceDateTime,
            timeUntil: raceDateTime ? formatTimeUntil(raceDateTime, now) : "TBC",
            condBr: isTruthyCsv(row.cond_br),
            condL100: isTruthyCsv(row.cond_l100),
            condOdds: isTruthyCsv(row.cond_odds)
        };
    }).filter(item => {
        if (!item.raceDateTime) return false;
        if (!item.venue || !item.raceNo || !item.horse) return false;
        return item.raceDateTime.getTime() >= now.getTime() - 5 * 60 * 1000;
    }).sort((a, b) => {
        const timeDiff = a.raceDateTime - b.raceDateTime;
        if (timeDiff !== 0) return timeDiff;

        const venueDiff = a.venue.localeCompare(b.venue);
        if (venueDiff !== 0) return venueDiff;

        return Number(a.horseNo || 999) - Number(b.horseNo || 999);
    });
}

function groupBoxTickersByDay(items) {
    const map = new Map();

    items.forEach(item => {
        const key = item.dateKey || "unknown";
        const label = dayLabelFromDateKey(key, item.dateValue);

        if (!map.has(key)) {
            map.set(key, { key, label, items: [] });
        }

        map.get(key).items.push(item);
    });

    return [...map.values()].sort((a, b) => {
        return (a.key || "9999-99-99").localeCompare(b.key || "9999-99-99");
    });
}

function renderBoxTickerDayGroup(group) {
    return `
        <div class="stable-change-day-group">
            <div class="day-heading stable-change-day-heading">
                <span></span>
                <strong>${escapeHtml(group.label)}</strong>
                <span></span>
            </div>

            <div class="box-ticker-list">
                ${group.items.map(renderBoxTickerRow).join("")}
            </div>
        </div>
    `;
}

function renderBoxTickerRow(item) {
    const timeDisplay = item.dateKey === todayIso()
        ? item.timeUntil
        : item.time || "TBC";

    return `
        <div class="box-ticker-row-card" onclick="openRaceFromHomeByKey('${escapeHtml(item.key)}')">
            <div class="box-ticker-time">${escapeHtml(timeDisplay)}</div>

            <div class="box-ticker-race">
                ${escapeHtml(shortVenueName(item.venue))} R${escapeHtml(item.raceNo)} No ${escapeHtml(item.horseNo)}
            </div>

            <div class="box-ticker-runner">
                <div class="box-ticker-horse">${escapeHtml(item.horse)}</div>
            </div>

            <div class="box-ticker-price">
                ${escapeHtml(item.driver)} · ${escapeHtml(item.fairOdds.replace(".00", ""))}
            </div>

            <div class="box-ticker-checks">
                ${renderBoxTick("Map", true)}
                ${renderBoxTick("Field", true)}
                ${renderBoxTick("Barrier", item.condBr)}
                ${renderBoxTick("L100", item.condL100)}
                ${renderBoxTick("Odds", item.condOdds)}
            </div>
        </div>
    `;
}


function renderBoxTick(label, passed) {
    const details = {
        Map: "Only one front-row runner in the race has Ld % above 15%.",
        Field: "Race has at least 6 runners.",
        Barrier: "Barrier ROI is better than -10%.",
        L100: "Driver or trainer L/100 ROI is positive.",
        Odds: "Fair Odds are less than $5."
    };

    return `
        <span class="box-tick ${passed ? "passed" : "failed"}" title="${escapeHtml(details[label] || label)}">
            ${passed ? "☑" : "☐"} ${escapeHtml(label)}
        </span>
    `;
}

function isTruthyCsv(value) {
    return ["true", "1", "yes", "y"].includes(clean(value).toLowerCase());
}

function showRaceFinderView() {
    clearNextUpTimer();

    document.querySelector(".hero").style.display = "none";
    document.querySelector(".dashboard-grid").style.display = "none";
    document.querySelector(".meetings-panel").style.display = "";

    document.querySelector(".panel-heading").innerHTML = `
        <span>🎯</span>
        <span>Race Finder</span>
    `;

    document.getElementById("meetingStrip").innerHTML = `
        <div class="race-finder-layout">
            <div class="race-finder-card">
                <div class="race-panel-eyebrow">Race matching tool</div>
                <h2>Trotify Race Finder</h2>
                <p>Find upcoming races a horse may be eligible for.</p>

                <div class="race-finder-section">
                    <h3>Trainer Settings</h3>

                    <div class="race-finder-grid">
                        <label>Trainer Postcode <input id="rfTrainerPostcode" /></label>

                        <label>Max Travel KM
                            <select id="rfMaxTravelKm">
                                <option value="">Any</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                                <option value="150">150</option>
                                <option value="200">200</option>
                                <option value="250">250</option>
                                <option value="300">300</option>
                                <option value="400">400</option>
                                <option value="500">500</option>
                                <option value="600">600</option>
                                <option value="1000">1000</option>
                            </select>
                        </label>

                        <label>Sort By
                            <select id="rfSortBy">
                                <option value="fit">Fit</option>
                                <option value="date">Date</option>
                            </select>
                        </label>

                        <label class="race-finder-checkbox">
                            <input id="rfNextTwoWeeks" type="checkbox" />
                            Next 2 weeks
                        </label>
                    </div>
                </div>

                <div class="race-finder-section">
                    <h3>Saved Horses</h3>

                    <div class="race-finder-horse-row">
                        <select id="rfHorseSelector"></select>
                        <button id="rfAddHorseBtn" type="button">+ Add Horse</button>
                        <button id="rfSaveHorseBtn" type="button">Save Horse</button>
                    </div>
                </div>

                <div class="race-finder-section">
                    <h3>Horse Details</h3>

                    <div class="race-finder-grid">
                        <label>Horse Name <input id="rfHorseName" /></label>

                        <label>NR
                            <select id="rfNr">
                                <option value="">Any</option>
                                ${Array.from({ length: 91 }, (_, i) => i + 30).map(n => `
                                    <option value="${n}">${n}</option>
                                `).join("")}
                            </select>
                        </label>

                        <label>Gait
                            <select id="rfGait">
                                <option value="">Any</option>
                                <option value="PACE">Pace</option>
                                <option value="TROT">Trot</option>
                            </select>
                        </label>

                        <label>Sex
                            <select id="rfSex">
                                <option value="">Any</option>
                                <option value="Gelding">Gelding</option>
                                <option value="Mare">Mare</option>
                                <option value="Colt">Colt</option>
                                <option value="Filly">Filly</option>
                            </select>
                        </label>

                        <label>Age
                            <select id="rfAge">
                                <option value="">Any</option>
                                ${Array.from({ length: 14 }, (_, i) => i + 2).map(n => `
                                    <option value="${n}">${n}</option>
                                `).join("")}
                            </select>
                        </label>

                        <label>Lifetime Wins <input id="rfWins" type="number" /></label>

                        <label>Preferred Min Distance
                            <select id="rfPreferredMinDistance">
                                <option value="">Any</option>
                                ${Array.from({ length: 16 }, (_, i) => 900 + i * 100).map(n => `
                                    <option value="${n}">${n}</option>
                                `).join("")}
                            </select>
                        </label>

                        <label>Preferred Max Distance
                            <select id="rfPreferredMaxDistance">
                                <option value="">Any</option>
                                ${Array.from({ length: 23 }, (_, i) => 1000 + i * 100).map(n => `
                                    <option value="${n}">${n}</option>
                                `).join("")}
                            </select>
                        </label>

                        <label>Barrier Importance
                            <select id="rfBarrierImportance">
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </label>

                        <label>Travel Importance
                            <select id="rfTravelImportance">
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </label>

                        <label>Distance Importance
                            <select id="rfDistanceImportance">
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </label>

                        <label>Prizemoney Importance
                            <select id="rfPrizemoneyImportance">
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </label>

                        <label>Avoid Seasoned Winners
                            <select id="rfAvoidSeasonedWinners">
                                <option value="off">Low</option>
                                <option value="medium">Medium</option>
                                <option value="strong">High</option>
                            </select>
                        </label>

                        <label>Date From <input id="rfDateFrom" type="date" /></label>
                        <label>Date To <input id="rfDateTo" type="date" /></label>

                        <label class="race-finder-checkbox">
                            <input id="rfVicbred" type="checkbox" />
                            Vicbred eligible
                        </label>

                        <label class="race-finder-checkbox">
                            <input id="rfAvoidMetro" type="checkbox" />
                            Avoid Metro
                        </label>
                    </div>

                    <div class="race-finder-actions">
                        <button id="rfFindBtn" type="button">Find Races</button>
                        <button id="rfClearBtn" type="button" class="secondary">Clear Saved Details</button>
                    </div>
                </div>

                <div id="rfSummary" class="race-finder-summary">
                    Race Finder layout loaded. Logic will be wired in Step 2.
                </div>

                <div id="rfResults" class="race-finder-results"></div>
            </div>
        </div>
    `;

    initRaceFinder();
}

async function initRaceFinder() {
    rfLoadSavedDetails();
    rfRenderHorseSelector();

    document.getElementById("rfFindBtn")?.addEventListener("click", rfFindRaces);
    document.getElementById("rfClearBtn")?.addEventListener("click", rfClearSavedDetails);
    document.getElementById("rfAddHorseBtn")?.addEventListener("click", rfAddHorse);
    document.getElementById("rfSaveHorseBtn")?.addEventListener("click", rfSaveCurrentHorse);
    document.getElementById("rfHorseSelector")?.addEventListener("change", rfLoadSelectedHorseFromSelector);

    document.getElementById("rfNextTwoWeeks")?.addEventListener("change", () => {
        if (document.getElementById("rfNextTwoWeeks").checked) {
            rfSetNextTwoWeeksDates();
            rfFindRaces();
        }
    });

    document.getElementById("rfSortBy")?.addEventListener("change", rfFindRaces);

    if (!rfLoaded) {
        rfRaces = await rfLoadCSV(RACE_FINDER_MEETING_URL);

        const venueRows = await rfLoadCSV(RACE_FINDER_VENUE_URL);
        venueRows.forEach(row => {
            rfVenueLocations[clean(row.Venue).toUpperCase()] = {
                lat: Number(row.Lat),
                lon: Number(row.Lon),
            };
        });

        const postcodeRows = await rfLoadCSV(RACE_FINDER_POSTCODE_URL);
        postcodeRows.forEach(row => {
            rfPostcodeLocations[String(row.Postcode).trim()] = {
                lat: Number(row.Lat),
                lon: Number(row.Lon),
            };
        });

        rfLoaded = true;
    }

    const summary = document.getElementById("rfSummary");
    if (summary) {
        summary.textContent = `Loaded ${rfRaces.length} race rows.`;
    }
}

async function rfLoadCSV(url) {
    const response = await fetch(url, { cache: "no-store" });
    const text = await response.text();
    return parseCSV(text);
}

function rfValue(id) {
    return document.getElementById(id)?.value.trim() || "";
}

function rfNumberValue(id) {
    const raw = rfValue(id);
    if (raw === "") return null;
    const n = Number(raw);
    return Number.isNaN(n) ? null : n;
}

function rfSetValue(id, val) {
    if (val === undefined || val === null) return;
    const el = document.getElementById(id);
    if (el) el.value = val;
}

function rfNumberOrNull(value) {
    if (value === undefined || value === null || value === "") return null;
    const num = Number(value);
    return Number.isNaN(num) ? null : num;
}

function rfIsTrue(value) {
    return String(value).toLowerCase() === "true";
}

function rfGetCurrentHorseOnly() {
    return {
        horseName: rfValue("rfHorseName"),
        nr: rfNumberValue("rfNr"),
        gait: rfValue("rfGait"),
        sex: rfValue("rfSex"),
        age: rfNumberValue("rfAge"),
        wins: rfNumberValue("rfWins"),
        vicbred: document.getElementById("rfVicbred")?.checked || false,
        avoidMetro: document.getElementById("rfAvoidMetro")?.checked || false,
        barrierImportance: rfValue("rfBarrierImportance"),
        travelImportance: rfValue("rfTravelImportance"),
        distanceImportance: rfValue("rfDistanceImportance"),
        preferredMinDistance: rfNumberValue("rfPreferredMinDistance"),
        preferredMaxDistance: rfNumberValue("rfPreferredMaxDistance"),
        prizemoneyImportance: rfValue("rfPrizemoneyImportance"),
        avoidSeasonedWinners: rfValue("rfAvoidSeasonedWinners"),
        dateFrom: rfValue("rfDateFrom"),
        dateTo: rfValue("rfDateTo"),
    };
}

function rfGetAppState() {
    return {
        trainer: {
            trainerPostcode: rfValue("rfTrainerPostcode"),
            maxTravelKm: rfNumberValue("rfMaxTravelKm"),
            sortBy: rfValue("rfSortBy"),
            nextTwoWeeks: document.getElementById("rfNextTwoWeeks")?.checked || false,
        },
        horses: [rfGetCurrentHorseOnly()],
        selectedHorseIndex: 0,
    };
}

function rfReadStoredState() {
    const saved = localStorage.getItem(RACE_FINDER_STORAGE_KEY);
    if (!saved) return null;

    try {
        return JSON.parse(saved);
    } catch {
        return null;
    }
}

function rfSaveStoredState(state) {
    localStorage.setItem(RACE_FINDER_STORAGE_KEY, JSON.stringify(state));
}

function rfLoadSavedDetails() {
    const saved = rfReadStoredState();
    if (!saved) return;

    const trainer = saved.trainer || {};
    const horse = (saved.horses && saved.horses[saved.selectedHorseIndex || 0]) || {};

    rfSetValue("rfTrainerPostcode", trainer.trainerPostcode);
    rfSetValue("rfMaxTravelKm", trainer.maxTravelKm);
    rfSetValue("rfSortBy", trainer.sortBy);
    document.getElementById("rfNextTwoWeeks").checked = !!trainer.nextTwoWeeks;

    rfSetValue("rfHorseName", horse.horseName);
    rfSetValue("rfNr", horse.nr);
    rfSetValue("rfGait", horse.gait);
    rfSetValue("rfSex", horse.sex);
    rfSetValue("rfAge", horse.age);
    rfSetValue("rfWins", horse.wins);
    rfSetValue("rfDateFrom", horse.dateFrom);
    rfSetValue("rfDateTo", horse.dateTo);
    rfSetValue("rfBarrierImportance", horse.barrierImportance);
    rfSetValue("rfTravelImportance", horse.travelImportance);
    rfSetValue("rfDistanceImportance", horse.distanceImportance);
    rfSetValue("rfPreferredMinDistance", horse.preferredMinDistance);
    rfSetValue("rfPreferredMaxDistance", horse.preferredMaxDistance);
    rfSetValue("rfPrizemoneyImportance", horse.prizemoneyImportance);
    rfSetValue("rfAvoidSeasonedWinners", horse.avoidSeasonedWinners);

    document.getElementById("rfVicbred").checked = !!horse.vicbred;
    document.getElementById("rfAvoidMetro").checked = !!horse.avoidMetro;
}

function rfRenderHorseSelector() {
    const selector = document.getElementById("rfHorseSelector");
    if (!selector) return;

    const state = rfReadStoredState() || rfGetAppState();
    const horses = state.horses || [];

    selector.innerHTML = "";

    horses.forEach((horse, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = horse.horseName || `Horse ${index + 1}`;
        selector.appendChild(option);
    });

    selector.value = state.selectedHorseIndex || 0;
}

function rfSaveCurrentHorse() {
    const state = rfReadStoredState() || rfGetAppState();

    state.trainer = rfGetAppState().trainer;

    const index = Number(document.getElementById("rfHorseSelector").value || 0);

    state.horses = state.horses || [];
    state.horses[index] = rfGetCurrentHorseOnly();
    state.selectedHorseIndex = index;

    rfSaveStoredState(state);
    rfRenderHorseSelector();
}

function rfAddHorse() {
    const state = rfReadStoredState() || rfGetAppState();

    state.horses = state.horses || [];
    state.horses.push({
        horseName: "New Horse",
        nr: null,
        gait: "",
        sex: "",
        age: null,
        wins: null,
        vicbred: false,
        avoidMetro: false,
        barrierImportance: "medium",
        travelImportance: "medium",
        distanceImportance: "medium",
        preferredMinDistance: null,
        preferredMaxDistance: null,
        prizemoneyImportance: "medium",
        avoidSeasonedWinners: "medium",
        dateFrom: rfValue("rfDateFrom"),
        dateTo: rfValue("rfDateTo"),
    });

    state.selectedHorseIndex = state.horses.length - 1;
    rfSaveStoredState(state);

    rfLoadSavedDetails();
    rfRenderHorseSelector();
}

function rfLoadSelectedHorseFromSelector() {
    const state = rfReadStoredState();
    if (!state) return;

    state.selectedHorseIndex = Number(document.getElementById("rfHorseSelector").value || 0);
    rfSaveStoredState(state);

    rfLoadSavedDetails();
}

function rfClearSavedDetails() {
    localStorage.removeItem(RACE_FINDER_STORAGE_KEY);
    showRaceFinderView();
}

function rfGetSelectedHorseWithTrainer() {
    const state = rfReadStoredState() || rfGetAppState();
    const currentTrainer = rfGetAppState().trainer;
    const selectedIndex = state.selectedHorseIndex || 0;
    const horse = (state.horses && state.horses[selectedIndex]) || rfGetCurrentHorseOnly();

    return {
        ...horse,
        trainerPostcode: currentTrainer.trainerPostcode,
        maxTravelKm: currentTrainer.maxTravelKm,
        sortBy: currentTrainer.sortBy,
        nextTwoWeeks: currentTrainer.nextTwoWeeks,
    };
}

function rfFindRaces() {
    const state = rfReadStoredState() || rfGetAppState();
    let horse = rfGetSelectedHorseWithTrainer();

    if (horse.nextTwoWeeks) {
        rfSetNextTwoWeeksDates();
        state.trainer.nextTwoWeeks = true;
        horse.dateFrom = rfValue("rfDateFrom");
        horse.dateTo = rfValue("rfDateTo");
        state.horses[state.selectedHorseIndex].dateFrom = horse.dateFrom;
        state.horses[state.selectedHorseIndex].dateTo = horse.dateTo;
    }

    localStorage.setItem(RACE_FINDER_STORAGE_KEY, JSON.stringify(state));

    const matches = rfRaces
        .map(race => rfAssessRace(race, horse))
        .filter(result => result.isEligible)
        .sort((a, b) => rfSortRaceResults(a, b, horse.sortBy));

    rfRenderResults(matches, horse);
}

function rfAssessRace(race, horse) {
    const reasons = [];
    const warnings = [];
    const penalties = [];

    let score = 50;
    let distanceKmValue = null;
    let hardFail = false;

    if (horse.dateFrom || horse.dateTo) {
        const raceDate = rfParseRaceDate(race.DateISO || race.Date);

        if (horse.dateFrom && raceDate && raceDate < horse.dateFrom) hardFail = true;
        if (horse.dateTo && raceDate && raceDate > horse.dateTo) hardFail = true;
    }

    if (horse.avoidMetro && race.RaceCode && race.RaceCode.length >= 3) {
        if (race.RaceCode.charAt(2).toUpperCase() === "M") hardFail = true;
    }

    const prizemoney = rfNumberOrNull(race.Prizemoney);
    if (prizemoney === 0) {
        score -= 40;
        penalties.push("Trial / no prizemoney");
        hardFail = true;
    }

    if (horse.trainerPostcode && horse.maxTravelKm !== null) {
        const trainer = rfPostcodeLocations[String(horse.trainerPostcode).trim()];
        const venue = rfVenueLocations[clean(race.Venue).toUpperCase()];
        const travelWeight = rfWeightValue(horse.travelImportance);

        if (trainer && venue) {
            distanceKmValue = rfDistanceKm(trainer.lat, trainer.lon, venue.lat, venue.lon);

            if (distanceKmValue <= horse.maxTravelKm) {
                reasons.push(`${Math.round(distanceKmValue)}km away`);
            } else {
                const overBy = distanceKmValue - horse.maxTravelKm;
                score -= Math.min(35, (overBy / 50) * 8 * travelWeight);
                penalties.push(`${Math.round(distanceKmValue)}km away`);
                hardFail = true;
            }
        } else {
            warnings.push("Distance not checked");
        }
    }

    if (horse.gait && race.Gait && race.Gait !== horse.gait) {
        score -= 45;
        penalties.push(`Wrong gait: ${race.Gait}`);
        hardFail = true;
    } else if (horse.gait && race.Gait === horse.gait) {
        reasons.push("Correct gait");
    }

    if (horse.nr !== null) {
        const minNR = rfNumberOrNull(race.MinNR);
        const maxNR = rfGetRaceMaxNR(race);

        if (minNR !== null && horse.nr < minNR) {
            score -= 35;
            penalties.push(`Below NR range ${minNR}+`);
            hardFail = true;
        } else if (maxNR !== null && horse.nr > maxNR) {
            score -= 35;
            penalties.push(`Above NR cap ${maxNR}`);
            hardFail = true;
        } else if (minNR !== null || maxNR !== null) {
            reasons.push(`NR fit ${minNR ?? "open"}-${maxNR ?? "open"}`);
        }
    }

    if (horse.wins !== null) {
        const minWins = rfNumberOrNull(race.MinWins);
        const maxWins = rfNumberOrNull(race.MaxWins);

        if (minWins !== null && horse.wins < minWins) {
            score -= 30;
            penalties.push(`Below wins range ${minWins}+`);
            hardFail = true;
        } else if (maxWins !== null && horse.wins > maxWins) {
            score -= 30;
            penalties.push(`Above wins cap ${maxWins}`);
            hardFail = true;
        } else if (minWins !== null || maxWins !== null) {
            reasons.push(`Wins fit ${minWins ?? "open"}-${maxWins ?? "open"}`);

            if (maxWins !== null && maxWins <= 3 && horse.wins === maxWins) {
                score += 8;
                reasons.push("At top of low-wins race");
            }
        }

        const avoidWeight = rfWeightValue(horse.avoidSeasonedWinners);

        if (avoidWeight > 0) {
            if (maxWins !== null && maxWins <= 3) {
                score += 12 * avoidWeight;
                reasons.push("Low-wins race");
            } else if (minWins === null && maxWins === null) {
                score -= 10 * avoidWeight;
                penalties.push("Open wins race");
            }
        }
    }

    if (horse.age !== null) {
        const minAge = rfNumberOrNull(race.MinAge);
        const maxAge = rfNumberOrNull(race.MaxAge);

        if (minAge !== null && horse.age < minAge) {
            score -= 25;
            penalties.push("Too young for age condition");
            hardFail = true;
        } else if (maxAge !== null && horse.age > maxAge) {
            score -= 25;
            penalties.push("Too old for age condition");
            hardFail = true;
        } else if (minAge !== null || maxAge !== null) {
            reasons.push(`Age fit ${minAge ?? "open"}-${maxAge ?? "open"}`);

            if (minAge !== null && minAge >= 4) {
                score += 4;
                reasons.push("Older-age race");
            }
        }
    }

    if (rfIsTrue(race.IsMaresOnly)) {
        if (horse.sex && horse.sex !== "Mare" && horse.sex !== "Filly") {
            score -= 45;
            penalties.push("Mares only");
            hardFail = true;
        } else {
            score += 10;
            reasons.push("Mares race fit");
        }
    }

    if (rfIsTrue(race.IsVicbredOnly)) {
        if (horse.vicbred) {
            score += 8;
            reasons.push("Vicbred fit");
        } else {
            score -= 25;
            warnings.push("Vicbred only");
            hardFail = true;
        }
    }

    const raceDistance = rfNumberOrNull(race.Distance);
    const distanceWeight = rfWeightValue(horse.distanceImportance);

    if (raceDistance !== null && (horse.preferredMinDistance !== null || horse.preferredMaxDistance !== null)) {
        const minOk = horse.preferredMinDistance === null || raceDistance >= horse.preferredMinDistance;
        const maxOk = horse.preferredMaxDistance === null || raceDistance <= horse.preferredMaxDistance;

        if (minOk && maxOk) {
            score += 15 * distanceWeight;
            reasons.push("Preferred distance");
        } else {
            score -= 15 * distanceWeight;
            penalties.push("Outside preferred distance");
        }
    }

    const drawText = String(race.Draw || "").toUpperCase();
    const barrierWeight = rfWeightValue(horse.barrierImportance);

    if (barrierWeight > 0) {
        if (drawText.includes("PBD")) {
            score += 10 * barrierWeight;
            reasons.push("Preferential barrier draw");
        } else if (drawText.includes("RBD")) {
            score -= 10 * barrierWeight;
            penalties.push("Random barrier draw");
        }
    }

    const prizemoneyWeight = rfWeightValue(horse.prizemoneyImportance);

    if (prizemoney !== null && prizemoney > 0) {
        if (prizemoney >= 15000) {
            score += 17 * prizemoneyWeight;
            reasons.push("Excellent prizemoney");
        } else if (prizemoney >= 10000) {
            score += 12 * prizemoneyWeight;
            reasons.push("Strong prizemoney");
        } else if (prizemoney >= 6000) {
            score += 6 * prizemoneyWeight;
            reasons.push("Decent prizemoney");
        } else if (prizemoney < 5000) {
            score -= 15 * prizemoneyWeight;
            penalties.push("Low prizemoney");
        }
    }

    if (race.OtherConditionsRaw) {
        warnings.push("Check conditions");
        score -= 3;
    }

    score = Math.max(0, Math.min(100, Math.round(score)));

    return {
        isEligible: !hardFail,
        race,
        reasons,
        warnings,
        penalties,
        score,
        distanceKm: distanceKmValue,
    };
}

function rfSortRaceResults(a, b, sortBy = "fit") {
    const dateA = rfParseRaceDate(a.race.DateISO || a.race.Date) || "9999-99-99";
    const dateB = rfParseRaceDate(b.race.DateISO || b.race.Date) || "9999-99-99";

    if (sortBy === "date") {
        if (dateA !== dateB) return dateA.localeCompare(dateB);

        const venueA = String(a.race.Venue || "");
        const venueB = String(b.race.Venue || "");

        if (venueA !== venueB) return venueA.localeCompare(venueB);

        return b.score - a.score;
    }

    if (b.score !== a.score) return b.score - a.score;
    return dateA.localeCompare(dateB);
}

function rfRenderResults(matches, horse) {
    const summary = document.getElementById("rfSummary");
    const results = document.getElementById("rfResults");

    summary.textContent = `${matches.length} likely eligible race(s) found for ${horse.horseName || "this horse"}.`;
    results.innerHTML = "";

    if (!matches.length) {
        results.innerHTML = `<div class="race-finder-empty">No likely matches found.</div>`;
        return;
    }

    results.innerHTML = `
        <div class="race-finder-table-wrap">
            <table class="race-finder-results-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Venue</th>
                        <th>Day</th>
                        <th>Time</th>
                        <th>Race Details</th>
                        <th>Code</th>
                        <th>Distance</th>
                        <th>Class</th>
                        <th>Prize</th>
                        <th>Fit</th>
                    </tr>
                </thead>
                <tbody>
                    ${matches.map(match => {
                        const race = match.race;
                        const detailNotes = [
                            ...match.reasons,
                            ...match.penalties,
                            ...match.warnings,
                        ].join(" | ");

                        const scoreClass = rfGetScoreClass(match.score);
                        const prize = Number(race.Prizemoney);
                        const prizeText = race.Prizemoney && !Number.isNaN(prize)
                            ? `$${prize.toLocaleString("en-AU")}`
                            : "";

                        return `
                            <tr>
                                <td>${escapeHtml(race.Date || "")}</td>
                                <td>
                                    ${race.URL
                                        ? `<a href="${escapeHtml(race.URL)}" target="_blank" rel="noopener noreferrer">${escapeHtml(race.Venue || "")}</a>`
                                        : escapeHtml(race.Venue || "")
                                    }
                                </td>
                                <td>${escapeHtml(race.Weekday || "")}</td>
                                <td>${escapeHtml(race.TimeOfDay || "")}</td>
                                <td title="${escapeHtml(race.OtherConditionsRaw || "No conditions listed.")}">
                                    ${escapeHtml(race.RaceName || "")}
                                </td>
                                <td>${escapeHtml(race.RaceCode || "")}</td>
                                <td>${race.Distance ? `${escapeHtml(race.Distance)}m` : ""}</td>
                                <td>${escapeHtml(race.ClassRaw || "")}</td>
                                <td>${escapeHtml(prizeText)}</td>
                                <td>
                                    <span class="race-finder-score ${scoreClass}" title="${escapeHtml(detailNotes)}">
                                        ${rfScoreDot(match.score)} ${match.score}
                                    </span>
                                </td>
                            </tr>
                        `;
                    }).join("")}
                </tbody>
            </table>
        </div>
    `;
}

function rfParseRaceDate(value) {
    if (!value) return "";

    const text = String(value).trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;

    const months = {
        jan: "01", january: "01",
        feb: "02", february: "02",
        mar: "03", march: "03",
        apr: "04", april: "04",
        may: "05",
        jun: "06", june: "06",
        jul: "07", july: "07",
        aug: "08", august: "08",
        sep: "09", september: "09",
        oct: "10", october: "10",
        nov: "11", november: "11",
        dec: "12", december: "12",
    };

    let match = text.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
    if (match) {
        const day = match[1].padStart(2, "0");
        const month = months[match[2].toLowerCase()];
        const year = match[3];
        return month ? `${year}-${month}-${day}` : "";
    }

    match = text.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{2})$/);
    if (match) {
        const day = match[1].padStart(2, "0");
        const month = months[match[2].toLowerCase()];
        const year = `20${match[3]}`;
        return month ? `${year}-${month}-${day}` : "";
    }

    return "";
}

function rfDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = rfToRad(lat2 - lat1);
    const dLon = rfToRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(rfToRad(lat1)) *
        Math.cos(rfToRad(lat2)) *
        Math.sin(dLon / 2) ** 2;

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function rfToRad(value) {
    return value * Math.PI / 180;
}

function rfWeightValue(setting) {
    if (setting === "low") return 0.5;
    if (setting === "high" || setting === "strong") return 1.5;
    if (setting === "off") return 0;
    return 1;
}

function rfGetRaceMaxNR(race) {
    const parsedMaxNR = rfNumberOrNull(race.MaxNR);

    if (parsedMaxNR !== null) return parsedMaxNR;

    const classText = String(race.ClassRaw || "").toUpperCase();

    let match = classText.match(/NR\s*UP\s*TO\s*(\d+)/);
    if (match) return Number(match[1]);

    match = classText.match(/NR\s*(\d+)\s*(?:TO|-)\s*(\d+)/);
    if (match) return Number(match[2]);

    return null;
}

function rfGetScoreClass(score) {
    if (score >= 80) return "score-strong";
    if (score >= 55) return "score-good";
    if (score >= 30) return "score-marginal";
    return "score-poor";
}

function rfScoreDot(score) {
    if (score >= 80) return "🟢";
    if (score >= 55) return "🟡";
    if (score >= 30) return "🟠";
    return "🔴";
}

function rfSetNextTwoWeeksDates() {
    const today = new Date();
    const twoWeeks = new Date();

    twoWeeks.setDate(today.getDate() + 14);

    document.getElementById("rfDateFrom").value = rfFormatDateInput(today);
    document.getElementById("rfDateTo").value = rfFormatDateInput(twoWeeks);
}

function rfFormatDateInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function showHomeView() {
    if (nextUpPageTimer) {
        clearInterval(nextUpPageTimer);
        nextUpPageTimer = null;
    }

    document.querySelector(".hero").style.display = "";
    document.querySelector(".dashboard-grid").style.display = "";
    document.querySelector(".meetings-panel").style.display = "none";

    document.querySelector(".panel-heading").innerHTML = `
        <span>📅</span>
        <span>Today’s Meetings</span>
    `;

    renderDashboard(allRows);
}

function showUpcomingFieldsView() {
    resetMobileViewScroll();
    if (nextUpPageTimer) {
        clearInterval(nextUpPageTimer);
        nextUpPageTimer = null;
    }

    document.querySelector(".hero").style.display = "none";
    document.querySelector(".dashboard-grid").style.display = "none";
    document.querySelector(".meetings-panel").style.display = "";

    document.querySelector(".panel-heading").innerHTML = `
        <span>⚡</span>
        <span
            onclick="resetUpcomingFieldsMobile()"
            style="cursor: pointer;"
        >
            Upcoming Fields
        </span>
    `;

    renderUpcomingFields(allRows);
}

function showStableChangesView() {
    resetMobileViewScroll();
    stopTimelineRefresh();
    document.querySelector(".hero").style.display = "none";
    document.querySelector(".dashboard-grid").style.display = "none";
    document.querySelector(".meetings-panel").style.display = "";

    document.querySelector(".panel-heading").innerHTML = `
        <span>🔄</span>
        <span>Stable Changes</span>
    `;

    const allChanges = getStableChanges(allRows);

    const changes = selectedStableChangeState === "ALL"
        ? allChanges
        : allChanges.filter(change => change.state === selectedStableChangeState);

    const grouped = groupStableChangesByDay(changes);

    document.getElementById("meetingStrip").innerHTML = `
        <div class="stable-changes-layout">
            <div class="stable-changes-header">
                <div>
                    <div class="race-panel-eyebrow">Upcoming stable changes</div>
                    <h2>${changes.length} changes found</h2>
                </div>
            </div>

            <div class="driver-state-filter stable-change-filter">
                ${["ALL", "VIC", "NSW", "QLD", "SA", "WA", "TAS"].map(state => `
                    <button class="driver-state-button ${selectedStableChangeState === state ? "selected" : ""}"
                        onclick="setStableChangeStateFilter('${state}')">
                        ${state}
                    </button>
                `).join("")}
            </div>

            ${grouped.length ? grouped.map(renderStableChangeDayGroup).join("") : `
                <div class="coming-soon-card">
                    <div class="coming-soon-title">No stable changes found</div>
                    <p>No runners match the selected state filter.</p>
                </div>
            `}
        </div>
    `;
}

function showGoodLeadersView() {
    stopTimelineRefresh();
    clearNextUpTimer();

    document.querySelector(".hero").style.display = "none";
    document.querySelector(".dashboard-grid").style.display = "none";
    document.querySelector(".meetings-panel").style.display = "";

    document.querySelector(".panel-heading").innerHTML = `
        <span>🚀</span>
        <span>Good Leaders</span>
    `;

    const allLeaders = getGoodLeaders(allRows);

    const leaders = selectedGoodLeaderState === "ALL"
        ? allLeaders
        : allLeaders.filter(item => item.state === selectedGoodLeaderState);

    const grouped = groupGoodLeadersByDay(leaders);

    document.getElementById("meetingStrip").innerHTML = `
        <div class="stable-changes-layout">
            <div class="stable-changes-header">
                <div>
                    <h2>${leaders.length} good leaders found</h2>
                </div>
            </div>

            <div class="driver-state-filter stable-change-filter">
                ${["ALL", "VIC", "NSW", "QLD", "SA", "WA", "TAS"].map(state => `
                    <button class="driver-state-button ${selectedGoodLeaderState === state ? "selected" : ""}"
                        onclick="setGoodLeaderStateFilter('${state}')">
                        ${state}
                    </button>
                `).join("")}
            </div>

            ${grouped.length ? grouped.map(renderGoodLeaderDayGroup).join("") : `
                <div class="coming-soon-card">
                    <div class="coming-soon-title">No good leaders found</div>
                    <p>No upcoming runners match the selected state filter.</p>
                </div>
            `}
        </div>
    `;
}

function shortVenueName(venue) {
    const value = clean(venue);

    const map = {
        "Gloucester Park": "Gloucester Pk",
        "Globe Derby Park": "Globe Derby",
        "Nswhrc at Tabcorp Pk Menangle": "Menangle",
        "Tabcorp Pk Menangle": "Menangle",
        "Central Wheatbelt": "Cent Wheatbelt",
        "Wagga at Riverina Paceway": "Wagga",
        "Riverina Paceway": "Wagga"
    };

    return map[value] || value;
}

function shortVenueNameHomeNext10(venue) {
    const value = clean(venue);

    const map = {
        "Globe Derby Park": "Globe Derby",
        "Central Wheatbelt": "Cent Wheatbelt",
        "Gloucester Park": "Gloucester Pk",
        "Wagga at Riverina Paceway": "Wagga",
        "Riverina Paceway": "Wagga"
    };

    return map[value] || value;
}

function setGoodLeaderStateFilter(state) {
    selectedGoodLeaderState = state;
    showGoodLeadersView();
}

function getGoodLeaders(rows) {
    const now = new Date();

    const baseItems = rows.map(row => {
        const venue = clean(row.Venue || "");
        const state = clean(row.State || row.STATE || row["State "] || "").toUpperCase();
        const dateValue = clean(row.Date || row.DATE || row["Meeting Date"] || "");
        const raceNo = clean(row["Race No"] || row.RaceNo || row.Race || "").replace(/^R/i, "");
        const time = clean(row.Time || row.TIME || row["Race Time"] || "");
        const horse = clean(row.Horse || "");
        const horseNo = formatWholeNumber(row["Horse No"] || row.HorseNo || row.Tab || "");
        const barrier = clean(row.Barrier || row.BARRIER || "").toUpperCase();

        const dateKey = parseDateToKey(dateValue);
        const raceDateTime = buildRaceDateTime(dateKey, time);

        const leadStarts = parseNumber(row["Bell Pos Lead"] || row["Lead Sts"] || row["Ld Sts"] || "");
        const leadWins = parseNumber(row["Ld Win"] || row["Lead Wins"] || "");
        const leadPlaces = parseNumber(row["Ld Pla"] || row["Lead Places"] || "");
        const leadPct = parseNumber(row["Ld %"] || row["Ld%"] || row["Lead %"] || "");

        const winPct = leadStarts > 0 ? (leadWins / leadStarts) * 100 : 0;
        const placePct = leadStarts > 0 ? ((leadWins + leadPlaces) / leadStarts) * 100 : 0;

        return {
            key: `${venue}|${state}|${dateValue}|${raceNo}`,
            raceKey: `${venue}|${state}|${dateValue}|${raceNo}`,
            dateKey,
            dateValue,
            venue,
            state,
            raceNo,
            time,
            horse,
            horseNo,
            barrier,
            raceDateTime,
            timeUntil: raceDateTime ? formatTimeUntil(raceDateTime, now) : "TBC",
            leadStarts,
            leadWins,
            leadPlaces,
            leadPct,
            winPct,
            placePct
        };
    }).filter(item => {
        if (!item.raceDateTime) return false;
        if (!item.venue || !item.raceNo || !item.horse) return false;
        if (!item.barrier.includes("FR")) return false;
        if (item.raceDateTime.getTime() < now.getTime() - 5 * 60 * 1000) return false;

        return item.leadStarts >= 5 && (item.winPct > 59 || item.placePct > 89);
    });

    const frontRowRankMap = new Map();

    baseItems.forEach(item => {
        if (!frontRowRankMap.has(item.raceKey)) {
            const raceFrontRow = rows
                .filter(row => {
                    const venue = clean(row.Venue || "");
                    const state = clean(row.State || row.STATE || row["State "] || "").toUpperCase();
                    const dateValue = clean(row.Date || row.DATE || row["Meeting Date"] || "");
                    const raceNo = clean(row["Race No"] || row.RaceNo || row.Race || "").replace(/^R/i, "");
                    const barrier = clean(row.Barrier || row.BARRIER || "").toUpperCase();

                    return `${venue}|${state}|${dateValue}|${raceNo}` === item.raceKey &&
                        barrier.includes("FR");
                })
                .map(row => ({
                    horse: clean(row.Horse || ""),
                    horseNo: formatWholeNumber(row["Horse No"] || row.HorseNo || row.Tab || ""),
                    leadPct: parseNumber(row["Ld %"] || row["Ld%"] || row["Lead %"] || "")
                }))
                .sort((a, b) => {
                    const leadDiff = safeNum(b.leadPct) - safeNum(a.leadPct);
                    if (leadDiff !== 0) return leadDiff;

                    return Number(a.horseNo || 999) - Number(b.horseNo || 999);
                });

            const rankSet = new Set(
                raceFrontRow
                    .slice(0, 2)
                    .map(r => `${normaliseName(r.horse)}|${r.horseNo}`)
            );

            frontRowRankMap.set(item.raceKey, rankSet);
        }
    });

    return baseItems.filter(item => {
        const rankSet = frontRowRankMap.get(item.raceKey);
        return rankSet && rankSet.has(`${normaliseName(item.horse)}|${item.horseNo}`);
    }).sort((a, b) => {
        const timeDiff = a.raceDateTime - b.raceDateTime;
        if (timeDiff !== 0) return timeDiff;

        const venueDiff = a.venue.localeCompare(b.venue);
        if (venueDiff !== 0) return venueDiff;

        const raceDiff = Number(a.raceNo || 999) - Number(b.raceNo || 999);
        if (raceDiff !== 0) return raceDiff;

        return Number(a.horseNo || 999) - Number(b.horseNo || 999);
    });
}

function groupGoodLeadersByDay(leaders) {
    const map = new Map();

    leaders.forEach(item => {
        const key = item.dateKey || "unknown";
        const label = dayLabelFromDateKey(key, item.dateValue);

        if (!map.has(key)) {
            map.set(key, {
                key,
                label,
                items: []
            });
        }

        map.get(key).items.push(item);
    });

    return [...map.values()].sort((a, b) => {
        return (a.key || "9999-99-99").localeCompare(b.key || "9999-99-99");
    });
}

function renderGoodLeaderDayGroup(group) {
    const midpoint = Math.ceil(group.items.length / 2);
    const leftItems = group.items.slice(0, midpoint);
    const rightItems = group.items.slice(midpoint);

    return `
        <div class="stable-change-day-group">
            <div class="day-heading stable-change-day-heading">
                <span></span>
                <strong>${escapeHtml(group.label)}</strong>
                <span></span>
            </div>

            <div class="stable-change-two-pane">
                <div class="stable-change-list-one-column">
                    ${leftItems.map(renderGoodLeaderRow).join("")}
                </div>

                <div class="stable-change-list-one-column">
                    ${rightItems.map(renderGoodLeaderRow).join("")}
                </div>
            </div>
        </div>
    `;
}

function renderGoodLeaderRow(item) {
    const timeDisplay = item.dateKey === todayIso()
        ? item.timeUntil
        : item.time || "TBC";

    return `
        <div class="stable-change-row-one-line" onclick="openRaceFromHomeByKey('${escapeHtml(item.key)}')">
            <div class="stable-change-time">${escapeHtml(timeDisplay)}</div>
            <div class="stable-change-race">${escapeHtml(shortVenueName(item.venue))} R${escapeHtml(item.raceNo)} No ${escapeHtml(item.horseNo)}</div>
            <div class="stable-change-horse">${escapeHtml(item.horse)}</div>
            <div class="stable-change-trainers">
                Lead: ${formatWholeNumber(item.leadStarts)}
                <span>•</span>
                Win: ${formatWholeNumber(item.leadWins)} (${Math.round(item.winPct)}%)
                <span>•</span>
                Place: ${formatWholeNumber(item.leadPlaces)} (${Math.round(item.placePct)}%)
            </div>
        </div>
    `;
}

function setStableChangeStateFilter(state) {
    selectedStableChangeState = state;
    showStableChangesView();
}

function groupStableChangesByDay(changes) {
    const map = new Map();

    changes.forEach(change => {
        const key = change.dateKey || "unknown";
        const label = dayLabelFromDateKey(key, change.dateValue);

        if (!map.has(key)) {
            map.set(key, {
                key,
                label,
                changes: []
            });
        }

        map.get(key).changes.push(change);
    });

    return [...map.values()].sort((a, b) => {
        return (a.key || "9999-99-99").localeCompare(b.key || "9999-99-99");
    });
}

function renderStableChangeDayGroup(group) {
    const midpoint = Math.ceil(group.changes.length / 2);
    const leftChanges = group.changes.slice(0, midpoint);
    const rightChanges = group.changes.slice(midpoint);

    return `
        <div class="stable-change-day-group">
            <div class="day-heading stable-change-day-heading">
                <span></span>
                <strong>${escapeHtml(group.label)}</strong>
                <span></span>
            </div>

            <div class="stable-change-two-pane">
                <div class="stable-change-list-one-column">
                    ${leftChanges.map(renderStableChangeRow).join("")}
                </div>

                <div class="stable-change-list-one-column">
                    ${rightChanges.map(renderStableChangeRow).join("")}
                </div>
            </div>
        </div>
    `;
}

function renderStableChangeRow(change) {
    const timeDisplay = change.dateKey === todayIso()
        ? change.timeUntil
        : change.time || "TBC";

    return `
        <div class="stable-change-row-one-line" onclick="openRaceFromHomeByKey('${escapeHtml(change.key)}')">
            <div class="stable-change-time">${escapeHtml(timeDisplay)}</div>
            <div class="stable-change-race">${escapeHtml(shortVenueName(change.venue))} R${escapeHtml(change.raceNo)} No ${escapeHtml(change.horseNo)}</div>
            <div class="stable-change-horse">${escapeHtml(change.horse)}</div>
            <div class="stable-change-trainers">
                ${escapeHtml(toProperCase(change.oldTrainer))}
                <span>→</span>
                ${escapeHtml(toProperCase(change.newTrainer))}
            </div>
        </div>
    `;
}

function toProperCase(value) {
    return clean(value)
        .toLowerCase()
        .replace(/\b\w/g, char => char.toUpperCase());
}

function formatGait(value) {
    return toProperCase(value);
}



function getStableChanges(rows) {
    const now = new Date();

    return rows.map(row => {
        const oldTrainer = clean(row.LR_Trainer || row["LR Trainer"] || "");
        const newTrainer = clean(row.Trainer_clean || row["Trainer Clean"] || row.Trainer || "");

        const venue = clean(row.Venue || "");
        const state = clean(row.State || row.STATE || row["State "] || "");
        const dateValue = clean(row.Date || row.DATE || row["Meeting Date"] || "");
        const raceNo = clean(row["Race No"] || row.RaceNo || row.Race || "").replace(/^R/i, "");
        const time = clean(row.Time || row.TIME || row["Race Time"] || "");
        const horse = clean(row.Horse || "");
        const horseNo = formatWholeNumber(row["Horse No"] || row.HorseNo || row.Tab || "");

        const dateKey = parseDateToKey(dateValue);
        const raceDateTime = buildRaceDateTime(dateKey, time);

        return {
            key: `${venue}|${state}|${dateValue}|${raceNo}`,
            dateKey,
            oldTrainer,
            newTrainer,
            venue,
            state,
            dateValue,
            raceNo,
            time,
            horse,
            horseNo,
            raceDateTime,
            timeUntil: raceDateTime ? formatTimeUntil(raceDateTime, now) : "TBC"
        };
    }).filter(change => {
        if (!change.oldTrainer || !change.newTrainer) return false;
        if (normaliseName(change.oldTrainer) === normaliseName(change.newTrainer)) return false;
        if (!change.raceDateTime) return false;

        return change.raceDateTime.getTime() >= now.getTime() - 5 * 60 * 1000;
    }).sort((a, b) => {
        const timeDiff = a.raceDateTime - b.raceDateTime;
        if (timeDiff !== 0) return timeDiff;

        const venueDiff = a.venue.localeCompare(b.venue);
        if (venueDiff !== 0) return venueDiff;

        const raceDiff = Number(a.raceNo || 999) - Number(b.raceNo || 999);
        if (raceDiff !== 0) return raceDiff;

        return Number(a.horseNo || 999) - Number(b.horseNo || 999);
    });
    }


const WATCHLIST_STORAGE_KEY = "trotifyWatchlist";
let watchlistSearchText = "";

function showWatchlistView() {
    stopTimelineRefresh();
    clearNextUpTimer();

    document.querySelector(".hero").style.display = "none";
    document.querySelector(".dashboard-grid").style.display = "none";
    document.querySelector(".meetings-panel").style.display = "";

    document.querySelector(".panel-heading").innerHTML = `
        <span>⭐</span>
        <span>Search / Watchlist</span>
    `;

    renderWatchlistView();
}

function renderWatchlistView() {
    const saved = getSavedWatchlist();
    const results = getWatchlistSearchResults(watchlistSearchText);
    const savedMatches = getSavedWatchlistMatches(saved);

    const savedSorted = [...saved].sort((a, b) => {
        const keyA = `${a.type}|${normaliseName(a.value)}`;
        const keyB = `${b.type}|${normaliseName(b.value)}`;

        const firstA = savedMatches.get(keyA)?.[0]?.raceDateTime?.getTime() ?? 9999999999999;
        const firstB = savedMatches.get(keyB)?.[0]?.raceDateTime?.getTime() ?? 9999999999999;

        return firstA - firstB;
    });

    document.getElementById("meetingStrip").innerHTML = `
        <div class="watchlist-layout">
            <div class="watchlist-search-card">

                <input
                    class="watchlist-search-input"
                    placeholder="Enter horse, trainer or driver"
                    value="${escapeHtml(watchlistSearchText)}"
                    oninput="setWatchlistSearch(this.value)"
                />

                ${watchlistSearchText.trim() ? `
                    <div class="watchlist-search-results">
                        ${results.length ? results.map(renderWatchlistSearchResult).join("") : `
                            <div class="watchlist-empty">No matching horse, trainer or driver found.</div>
                        `}
                    </div>
                ` : ""}
            </div>

            <div class="watchlist-search-card">
                <div class="race-panel-eyebrow">Saved searches</div>
                <h2>Watchlist</h2>

                ${savedSorted.length ? savedSorted.map(item => renderSavedWatchlistItem(item, savedMatches)).join("") : `
                    <div class="watchlist-empty">No saved searches yet.</div>
                `}
            </div>
        </div>
    `;
}

function setWatchlistSearch(value) {
    watchlistSearchText = value || "";
    renderWatchlistView();

    setTimeout(() => {
        const input = document.querySelector(".watchlist-search-input");
        if (input) {
            input.focus();
            input.setSelectionRange(input.value.length, input.value.length);
        }
    }, 0);
}

function getWatchlistSearchResults(searchText) {
    const search = clean(searchText).toLowerCase();
    if (search.length < 2) return [];

    const map = new Map();

    allRows.forEach(row => {
        [
            { type: "Horse", value: clean(row.Horse || "") },
            { type: "Trainer", value: clean(row.Trainer_clean || row["Trainer Clean"] || row.Trainer || "") },
            { type: "Driver", value: clean(row.Driver || "") }
        ].forEach(item => {
            if (!item.value) return;

            const valueKey = normaliseName(item.value);
            const key = `${item.type}|${valueKey}`;

            if (!item.value.toLowerCase().includes(search)) return;

            if (!map.has(key)) {
                map.set(key, {
                    type: item.type,
                    value: toProperCase(item.value),
                    matches: []
                });
            }

            map.get(key).matches.push(row);
        });
    });

    return [...map.values()]
        .sort((a, b) => {
            const countDiff = b.matches.length - a.matches.length;
            if (countDiff !== 0) return countDiff;
            return a.value.localeCompare(b.value);
        })
        .slice(0, 20);
}

function renderWatchlistSearchResult(item) {
    const saved = isWatchlistSaved(item.type, item.value);

    return `
        <div class="watchlist-result-row">
            <div>
                <strong>${escapeHtml(item.value)}</strong>
                <span>${escapeHtml(item.type)} • ${item.matches.length} upcoming</span>
            </div>

            <button onclick="toggleWatchlistItem('${escapeHtml(item.type)}', '${escapeHtml(item.value)}')">
                ${saved ? "Saved" : "Save"}
            </button>
        </div>

        <div class="watchlist-runner-list">
            ${getRowsForWatchlistItem(item).slice(0, 8).map(renderWatchlistRunnerRow).join("")}
        </div>
    `;
}

function getRowsForWatchlistItem(item) {
    const now = new Date();

    return allRows
        .filter(row => rowMatchesWatchlistItem(row, item))
        .map(row => buildWatchlistRunner(row))
        .filter(item => item.raceDateTime && item.raceDateTime.getTime() >= now.getTime() - 2 * 60 * 1000)
        .sort((a, b) => a.raceDateTime - b.raceDateTime);
}

function buildWatchlistRunner(row) {
    const venue = clean(row.Venue || "");
    const state = clean(row.State || row.STATE || row["State "] || "").toUpperCase();
    const dateValue = clean(row.Date || row.DATE || row["Meeting Date"] || "");
    const raceNo = clean(row["Race No"] || row.RaceNo || row.Race || "").replace(/^R/i, "");
    const raceDateTime = getRaceDateTime(row);
    const horseNo = formatWholeNumber(row["Horse No"] || row.HorseNo || row.Tab || "");

    return {
        key: `${venue}|${state}|${dateValue}|${raceNo}`,
        venue,
        state,
        dateValue,
        raceNo,
        horseNo,
        time: getRaceDisplayTime(row),
        raceDateTime,
        horse: clean(row.Horse || ""),
        trainer: toProperCase(
            clean(row.Trainer_clean || row["Trainer Clean"] || row.Trainer || "")
        ),

        driver: toProperCase(
            clean(row.Driver || "")
        ),
        barrier: clean(row.Barrier || row.BARRIER || ""),
        distance: clean(row.Distance || ""),
        start: clean(row.Start || ""),
        gait: clean(row.Gait || "")
    };
}

function renderWatchlistRunnerRow(item) {
    return `
        <div class="watchlist-runner-row" onclick="openRaceFromHomeByKey('${escapeHtml(item.key)}')">
            <div class="watchlist-time">${escapeHtml(formatTimeUntil(item.raceDateTime))}</div>
            <div class="watchlist-race">${escapeHtml(shortVenueName(item.venue))} R${escapeHtml(item.raceNo)} NO ${escapeHtml(item.horseNo || "")}</div>
            <div class="watchlist-horse">${escapeHtml(item.horse)}</div>
            <div class="watchlist-people">
                ${escapeHtml(item.trainer)} <span>•</span> ${escapeHtml(item.driver)}
            </div>
        </div>
    `;
}

function getSavedWatchlist() {
    try {
        return JSON.parse(localStorage.getItem(WATCHLIST_STORAGE_KEY) || "[]");
    } catch {
        return [];
    }
}

function saveWatchlist(items) {
    localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(items));
}

function isWatchlistSaved(type, value) {
    const key = `${type}|${normaliseName(value)}`;
    return getSavedWatchlist().some(item => `${item.type}|${normaliseName(item.value)}` === key);
}

function toggleWatchlistItem(type, value) {
    const saved = getSavedWatchlist();
    const key = `${type}|${normaliseName(value)}`;

    const existingIndex = saved.findIndex(item =>
        `${item.type}|${normaliseName(item.value)}` === key
    );

    if (existingIndex >= 0) {
        saved.splice(existingIndex, 1);
    } else {
        saved.push({ type, value });
    }

    saveWatchlist(saved);
    watchlistSearchText = "";
    renderWatchlistView();
}

function removeWatchlistItem(type, value) {
    const key = `${type}|${normaliseName(value)}`;

    const saved = getSavedWatchlist().filter(item =>
        `${item.type}|${normaliseName(item.value)}` !== key
    );

    saveWatchlist(saved);
    watchlistSearchText = "";
    renderWatchlistView();
}

function getSavedWatchlistMatches(saved) {
    const map = new Map();

    saved.forEach(item => {
        const key = `${item.type}|${normaliseName(item.value)}`;
        map.set(key, getRowsForWatchlistItem(item));
    });

    return map;
}

function renderSavedWatchlistItem(item, savedMatches) {
    const key = `${item.type}|${normaliseName(item.value)}`;
    const matches = savedMatches.get(key) || [];

    return `
        <div class="watchlist-saved-block">
            <div class="watchlist-saved-header">
                <div>
                    <strong>${escapeHtml(item.value)}</strong>
                    <span>${escapeHtml(item.type)} • ${matches.length} upcoming</span>
                </div>

                <button onclick="removeWatchlistItem('${escapeHtml(item.type)}', '${escapeHtml(item.value)}')">Remove</button>
            </div>

            ${matches.length ? `
                <div class="watchlist-runner-list">
                    ${matches.map(renderWatchlistRunnerRow).join("")}
                </div>
            ` : `
                <div class="watchlist-empty small">No upcoming runners found.</div>
            `}
        </div>
    `;
}

function rowMatchesWatchlistItem(row, item) {
    const value = normaliseName(item.value);

    if (item.type === "Horse") {
        return normaliseName(row.Horse || "") === value;
    }

    if (item.type === "Trainer") {
        return normaliseName(row.Trainer_clean || row["Trainer Clean"] || row.Trainer || "") === value;
    }

    if (item.type === "Driver") {
        return normaliseName(row.Driver || "") === value;
    }

    return false;
}


function showTimelineView() {
    clearNextUpTimer();

    document.querySelector(".hero").style.display = "none";
    document.querySelector(".dashboard-grid").style.display = "none";
    document.querySelector(".meetings-panel").style.display = "";

    document.querySelector(".panel-heading").innerHTML = `
        <span>🧵</span>
        <span>Timeline</span>
    `;

    startTimelineRefresh();
    renderTimelineView();
}

function renderTimelineView() {
    const items = getTimelineItems();

    document.getElementById("meetingStrip").innerHTML = `
        <div class="timeline-layout">
            <div class="timeline-list">
                ${items.length ? items.map(renderTimelineItem).join("") : `
                    <div class="coming-soon-card">
                        <div class="coming-soon-title">No timeline items yet</div>
                        <p>Save a horse, trainer or driver in Watchlist and upcoming races/results will appear here.</p>
                    </div>
                `}
            </div>
        </div>
    `;
}

function openTimelineWatchlist() {
    document.querySelectorAll(".nav-item").forEach(i => i.classList.remove("active"));
    document.querySelector('.nav-item[data-view="watchlist"]')?.classList.add("active");
    showWatchlistView();
}

function getTimelineItems() {
    const saved = getSavedWatchlist();
    if (!saved.length) return [];

    const now = new Date();
    const itemMap = new Map();

    const resultRunnerKeys = new Set(
        (liveResultsRows || []).map(row => {
            const raceKey = clean(row.RaceAnchorFull || "");
            const horse = normaliseName(row.Horse || "");
            return `${raceKey}|${horse}`;
        })
    );

    // -------------------------
    // PRE-RACE ITEMS
    // -------------------------
    allRows.forEach(row => {
        const raceDateTime = getRaceDateTime(row);
        if (!raceDateTime) return;

        const diffMs = raceDateTime.getTime() - now.getTime();
        // Keep pre-race item alive for 25 mins after start while waiting for result
        if (diffMs < -60 * 60 * 1000) return;
        if (diffMs > 21 * 24 * 60 * 60 * 1000) return;

        const barrier = clean(row.Barrier || row.BARRIER || "").toUpperCase();
        if (barrier.startsWith("SCR") || barrier.includes("SCRATCH")) return;

        const matches = saved.filter(item => rowMatchesWatchlistItem(row, item));
        if (!matches.length) return;

        const stage = getTimelineStage(row, raceDateTime, now);
        const raceAnchor = clean(row.RaceAnchorFull || row["RaceAnchorFull"] || "");
        const horse = clean(row.Horse || "");

        // If we already have the result, don't show pre-race reminder
        if (resultRunnerKeys.has(`${raceAnchor}|${normaliseName(horse)}`)) return;

        const horseNo = formatWholeNumber(row["Horse No"] || row.HorseNo || row.Tab || "");
        const venue = clean(row.Venue || "");
        const state = clean(row.State || row.STATE || row["State "] || "").toUpperCase();
        const dateValue = clean(row.Date || row.DATE || row["Meeting Date"] || "");
        const raceNo = clean(row["Race No"] || row.RaceNo || row.Race || "").replace(/^R/i, "");
        const key = `${venue}|${state}|${dateValue}|${raceNo}`;
        const eventKey = `${raceAnchor || key}|${normaliseName(horse)}|${stage.key}`;

        const existing = itemMap.get(eventKey);
        const followTypes = [...new Set(matches.map(m => m.type))];

        const item = {
            type: "upcoming",
            eventKey,
            key,
            raceKey: raceAnchor,
            stage,
            raceDateTime,
            sortTime: getTimelineSortTime(stage, raceDateTime, now),
            venue,
            state,
            dateValue,
            raceNo,
            time: getRaceDisplayTime(row),
            meetingTime: clean(row.MeetingTime || row["Meeting Time"] || ""),
            horse,
            horseNo,
            trainer: toProperCase(clean(row.Trainer_clean || row["Trainer Clean"] || row.Trainer || "")),
            driver: toProperCase(clean(row.Driver || "")),
            followTypes,
            matchedNames: matches.map(m => getTimelineFollowLabel(row, m)),
            message: ""
        };

        item.message = buildTimelineMessage(item);

        if (!existing) {
            itemMap.set(eventKey, item);
        } else {
            existing.followTypes = [...new Set([...existing.followTypes, ...item.followTypes])];
            existing.matchedNames = [...new Set([...existing.matchedNames, ...item.matchedNames])];
            existing.message = buildTimelineMessage(existing);
        }
    });

    // -------------------------
    // RESULT ITEMS
    // -------------------------
    getTimelineResultItems(saved).forEach(item => {
        itemMap.set(item.eventKey, item);
    });

    return [...itemMap.values()].sort((a, b) => {
        const aAccepted = a.stage?.key === "accepted";
        const bAccepted = b.stage?.key === "accepted";

        // Accepted items always sit below active timeline items/results
        if (aAccepted && !bAccepted) return 1;
        if (!aAccepted && bAccepted) return -1;

        // Within accepted: sort by upcoming race time, soonest first
        if (aAccepted && bAccepted) {
            return (a.raceDateTime?.getTime() || 0) - (b.raceDateTime?.getTime() || 0);
        }

        // Everything else: true timeline order, newest event first
        if ((b.sortTime || 0) !== (a.sortTime || 0)) {
            return (b.sortTime || 0) - (a.sortTime || 0);
        }

        return (a.raceDateTime?.getTime() || 0) - (b.raceDateTime?.getTime() || 0);
    });

}

function getTimelineResultItems(saved) {
    if (!liveResultsRows || !liveResultsRows.length) return [];

    const raceMap = new Map();

    liveResultsRows.forEach(row => {
        const raceKey = clean(row.RaceAnchorFull || "");
        if (!raceKey) return;

        if (!raceMap.has(raceKey)) {
            raceMap.set(raceKey, []);
        }

        raceMap.get(raceKey).push(row);
    });

    const items = [];

    raceMap.forEach((rows, raceKey) => {
        const winner = rows.find(r => clean(r.Placing || "") === "1") || null;
        const winnerHorse = winner ? clean(winner.Horse || "") : "";

        rows.forEach(row => {
            const matches = saved.filter(item => resultRowMatchesWatchlistItem(row, item));
            if (!matches.length) return;

            const horse = clean(row.Horse || "");
            const venue = clean(row.Venue || "");
            const state = clean(row.State || "").toUpperCase();
            const dateValue = clean(row.Date || "");
            const raceNo = clean(row["Race No"] || "").replace(/^R/i, "");
            const horseNo = "";
            const raceDateTime = buildRaceDateTime(parseDateToKey(dateValue), clean(row.Time || ""));
            const capturedAt = clean(row.LiveCapturedAtUTC || "");
            const capturedTime = capturedAt ? new Date(capturedAt).getTime() : 0;

            const followTypes = [...new Set(matches.map(m => m.type))];

            const item = {
                type: "result",
                eventKey: `${raceKey}|${normaliseName(horse)}|result`,
                key: `${venue}|${state}|${dateValue}|${raceNo}`,
                raceKey,
                stage: {
                    key: "result",
                    label: "RESULT",
                    icon: "🏁",
                    priority: 999
                },
                raceDateTime,
                sortTime: capturedTime || raceDateTime?.getTime() || Date.now(),
                venue,
                state,
                dateValue,
                raceNo,
                time: clean(row.Time || ""),
                horse,
                horseNo,
                trainer: toProperCase(clean(row.Trainer || "")),
                driver: toProperCase(clean(row.Driver || "")),
                followTypes,
                matchedNames: matches.map(m => `${m.type}: ${m.value}`),
                placing: clean(row.Placing || ""),
                margin: formatMargin(row.Margin || ""),
                mileRate: formatTimelineMileRate(row),
                winnerHorse,
                isWinner: clean(row.Placing || "") === "1",
                message: ""
            };

            item.message = buildTimelineResultMessage(item);
            items.push(item);
        });
    });

    return items;
}

function getTimelineFollowLabel(row, item) {
    if (item.type === "Horse") {
        return "Horse";
    }

    if (item.type === "Trainer") {
        return toProperCase(clean(row.Trainer || item.value || ""));
    }

    if (item.type === "Driver") {
        return toProperCase(clean(row.Driver || item.value || ""));
    }

    return item.type;
}

function formatAcceptedDayTime(item) {
    const day = timelineDayLabel(item.raceDateTime);
    const meetingTime = clean(item.meetingTime || "").toLowerCase();
    const time = item.time || "";

    const dayText = day && day !== "today" && day !== "tomorrow"
        ? day
        : day;

    const meetingText = meetingTime
        ? ` ${meetingTime}`
        : "";

    return [dayText, time ? `at ${time}` : ""]
        .filter(Boolean)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
}

function resultRowMatchesWatchlistItem(row, item) {
    const value = normaliseName(item.value);

    if (item.type === "Horse") {
        return normaliseName(row.Horse || "") === value;
    }

    if (item.type === "Trainer") {
        return normaliseName(row.Trainer || "") === value;
    }

    if (item.type === "Driver") {
        return normaliseName(row.Driver || "") === value;
    }

    return false;
}

function buildTimelineResultMessage(item) {
    const horse = item.horse || "Runner";
    const venue = shortVenueName(item.venue || "");
    const margin = item.margin || "";
    const mileRate = item.mileRate || "";

    if (item.isWinner) {
        return [
            `${horse} won at ${venue}`,
            margin ? `by ${margin}` : "",
            mileRate ? `in ${mileRate}` : ""
        ].filter(Boolean).join(", ");
    }

    const placing = ordinal(item.placing);
    const winner = item.winnerHorse ? toProperCase(item.winnerHorse) : "the winner";

    return [
        `${horse} finished ${placing} behind ${winner} at ${venue}`,
        margin ? `beaten ${margin}` : "",
        mileRate ? `in ${mileRate}` : ""
    ].filter(Boolean).join(", ");
}

function formatTimelineMileRate(row) {
    const direct = clean(row["Race Mile Rate"] || row.RaceMileRate || row["Mile Rate"] || "");
    if (direct) return direct;

    return formatMileRateFromRace(row);
}

function getTimelineStage(row, raceDateTime, now = new Date()) {
    const diffMinutes = Math.round((raceDateTime.getTime() - now.getTime()) / 60000);

    const raceKey = raceDateTime.toLocaleDateString("en-CA");

    const racingNow = new Date(now);
    if (racingNow.getHours() < 5) {
        racingNow.setDate(racingNow.getDate() - 1);
    }

    const racingTodayKey = racingNow.toLocaleDateString("en-CA");

    if (diffMinutes <= 5) {
        return { key: "5m", label: "5 min", priority: 5, icon: "🔥" };
    }

    if (diffMinutes <= 30) {
        return { key: "30m", label: "30 min", priority: 4, icon: "⏱️" };
    }

    if (diffMinutes <= 120) {
        return { key: "2h", label: "2 hours", priority: 3, icon: "⏳" };
    }

    if (raceKey === racingTodayKey) {
        return { key: "today", label: "Today", priority: 2, icon: "📅" };
    }

    return { key: "accepted", label: "Accepted", priority: 1, icon: "✅" };
}

function getTimelineSortTime(stage, raceDateTime, now = new Date()) {
    if (!stage || !raceDateTime) return 0;

    if (stage.key === "accepted") {
        const acceptedDay = new Date(raceDateTime);
        acceptedDay.setHours(5, 0, 0, 0);
        return acceptedDay.getTime();
    }

    if (stage.key === "today") {
        const todayStart = new Date(raceDateTime);
        todayStart.setHours(5, 0, 0, 0);
        return todayStart.getTime();
    }

    const offsets = {
        "2h": 2 * 60 * 60 * 1000,
        "30m": 30 * 60 * 1000,
        "5m": 5 * 60 * 1000
    };

    return raceDateTime.getTime() - (offsets[stage.key] || 0);
}

function buildTimelineMessage(item) {
    const day = timelineDayLabel(item.raceDateTime);

    const followsHorse = item.followTypes.includes("Horse");
    const followsTrainer = item.followTypes.includes("Trainer");
    const followsDriver = item.followTypes.includes("Driver");

    if (item.stage.key === "accepted") {
        const dayTime = formatAcceptedDayTime(item);
        const suffix = dayTime ? ` ${dayTime}` : "";

        if (followsHorse) return `${item.horse} accepted at ${shortVenueName(item.venue)}${suffix}`;
        if (followsTrainer) return `${item.trainer} has ${item.horse} accepted at ${shortVenueName(item.venue)}${suffix}`;
        if (followsDriver) return `${item.driver} has the drive on ${item.horse} at ${shortVenueName(item.venue)}${suffix}`;
    }

    if (item.stage.key === "today") {
        if (followsHorse) return `${item.horse} is racing today at ${shortVenueName(item.venue)}`;
        if (followsTrainer) return `${item.trainer} has ${item.horse} racing today at ${shortVenueName(item.venue)}`;
        if (followsDriver) return `${item.driver} is driving ${item.horse} today at ${shortVenueName(item.venue)}`;
    }

    if (item.stage.key === "2h") {
        if (followsHorse) return `${item.horse} is racing in two hours.`;
        if (followsTrainer) return `${item.trainer} has ${item.horse} racing in two hours`;
        if (followsDriver) return `${item.driver} is driving ${item.horse} in two hours`;
    }

    if (item.stage.key === "30m") {
        if (followsHorse) return `${item.horse} is racing in 30 minutes`;
        if (followsTrainer) return `${item.trainer} has ${item.horse} racing in 30 minutes`;
        if (followsDriver) return `${item.driver} is driving ${item.horse} in 30 minutes`;
    }

    if (followsHorse) return `${item.horse} is set to race in 5 minutes`;
    if (followsTrainer) return `${item.trainer} has ${item.horse} set to race in 5 minutes`;
    if (followsDriver) return `${item.driver} is driving ${item.horse} in 5 minutes`;

    return `${item.horse} is racing soon.`;
}


function renderTimelineItem(item) {
    const day = timelineDayLabel(item.raceDateTime).toUpperCase();
    const countdown = item.type === "result" ? "" : formatTimelineCountdown(item.raceDateTime);

    return `
        <article class="timeline-item" onclick="${item.type === "result"
            ? `openTimelineResultPopup('${escapeHtml(item.raceKey)}')`
            : `openRaceFromHomeByKey('${escapeHtml(item.key)}')`
        }">
            <div class="timeline-icon">${escapeHtml(item.stage.icon)}</div>

            <div class="timeline-body">
                <div class="timeline-meta">
                    <span>${escapeHtml(item.stage.label)}</span>
                    <span>
                        ${escapeHtml(shortVenueName(item.venue))} R${escapeHtml(item.raceNo)}
                        ${item.horseNo ? ` No ${escapeHtml(item.horseNo)}` : ""}
                    </span>
                    <span>${escapeHtml(day)}</span>
                    <span>${escapeHtml(item.time || "TBC")}</span>
                    ${(item.type === "result" ? item.matchedNames : item.followTypes).map(label => `
                        <span class="timeline-meta-tag">${escapeHtml(label)}</span>
                    `).join("")}
                </div>

                <div class="timeline-message">${escapeHtml(item.message)}</div>
            </div>

            ${countdown ? `<div class="timeline-countdown">⏱ ${escapeHtml(countdown)}</div>` : ""}
            ${countdown ? "" : `<div class="race-arrow">›</div>`}
        </article>
    `;
}

function timelineDayLabel(date) {
    if (!date) return "";

    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const dateKey = date.toLocaleDateString("en-CA");
    const todayKey = today.toLocaleDateString("en-CA");
    const tomorrowKey = tomorrow.toLocaleDateString("en-CA");

    if (dateKey === todayKey) return "today";
    if (dateKey === tomorrowKey) return "tomorrow";

    return date.toLocaleDateString("en-AU", { weekday: "long" });
}

function formatTimelineCountdown(raceDateTime) {
    if (!raceDateTime) return "";

    const diffMs = raceDateTime.getTime() - new Date().getTime();

    if (diffMs <= 0) return "Pending";

    const totalMinutes = Math.ceil(diffMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
}


async function loadLiveResults() {
    try {
        const response = await fetch(LIVE_RESULTS_URL + "?v=" + Date.now(), { cache: "no-store" });

        if (!response.ok) {
            throw new Error(`Could not load ${LIVE_RESULTS_URL}`);
        }

        const text = await response.text();
        return parseCSV(text);
    } catch (error) {
        console.log("Live results not loaded:", error);
        return [];
    }
}

async function loadTabDividends() {
    try {
        const response = await fetch(TAB_DIVIDENDS_URL + "?v=" + Date.now(), { cache: "no-store" });
        if (!response.ok) throw new Error(`Could not load ${TAB_DIVIDENDS_URL}`);
        return parseCSV(await response.text());
    } catch (error) {
        console.log("TAB dividends not loaded:", error);
        return [];
    }
}

async function loadCharityTips() {
    try {
        const response = await fetch(
            CHARITY_TIPS_URL + "?v=" + Date.now(),
            { cache: "no-store" }
        );

        if (!response.ok) {
            throw new Error(`Could not load ${CHARITY_TIPS_URL}`);
        }

        const text = await response.text();
        return parseCSV(text);

    } catch (error) {
        console.log("Charity tips not loaded:", error);
        return [];
    }
}

function getTabDividendsForRace(raceKey) {
    const key = normaliseRaceAnchor(raceKey);
    return (tabDividendRows || []).find(row =>
        normaliseRaceAnchor(row.RaceAnchorFull || "") === key
    ) || null;
}

function formatDividend(value, allowNTD = false) {
    const raw = clean(value || "");

    if (!raw) {
        return allowNTD ? "NTD" : "";
    }

    const n = Number(raw);
    if (!Number.isFinite(n)) return raw;

    return `$${n.toLocaleString("en-AU", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
}

function renderTabDividendBox(raceKey) {
    const row = getTabDividendsForRace(raceKey);
    if (!row) return "";

    const exoticItems = [
        clean(row.Q || "") ? `<span><strong>Qin</strong> ${escapeHtml(formatDividend(row.Q))}</span>` : "",
        clean(row.E || "") ? `<span><strong>Exa</strong> ${escapeHtml(formatDividend(row.E))}</span>` : "",
        clean(row.T || "") ? `<span><strong>Tri</strong> ${escapeHtml(formatDividend(row.T))}</span>` : "",
        clean(row.F4 || "") ? `<span><strong>F4</strong> ${escapeHtml(formatDividend(row.F4))}</span>` : "",
    ].filter(Boolean);

    const multiItems = [
        clean(row.RD || "") ? `<span><strong>RD</strong> ${escapeHtml(formatDividend(row.RD))}</span>` : "",
        clean(row.DD || "") ? `<span><strong>DD</strong> ${escapeHtml(formatDividend(row.DD))}</span>` : "",
        clean(row.Quad || "") ? `<span><strong>Quad</strong> ${escapeHtml(formatDividend(row.Quad))}</span>` : "",
    ].filter(Boolean);

    return `
        <div class="latest-result-sections latest-result-dividends">
            <span class="dividend-brand">SUPERTAB</span>

            <span><strong>Win</strong> ${escapeHtml(formatDividend(row.W1))}</span>
            <span><strong>Pla</strong> ${escapeHtml(formatDividend(row.P1))} | ${escapeHtml(formatDividend(row.P2))} | ${escapeHtml(formatDividend(row.P3, true))}</span>

            ${exoticItems.length ? `<span class="dividend-break">||</span>${exoticItems.join("")}` : ""}
            ${multiItems.length ? `<span class="dividend-break">||</span>${multiItems.join("")}` : ""}
        </div>
    `;
}

function startLatestResultsRefresh() {
    stopLatestResultsRefresh();

    latestResultsRefreshTimer = setInterval(async () => {
        const beforeKeys = new Set(
            getLatestResultRaces().map(race => normaliseRaceAnchor(race.raceKey))
        );

        liveResultsRows = await loadLiveResults();

        const afterRaces = getLatestResultRaces();

        latestResultNewRaceKeys = new Set(
            afterRaces
                .map(race => normaliseRaceAnchor(race.raceKey))
                .filter(key => key && !beforeKeys.has(key))
        );

        renderLatestResultsHomeTile();

        const activeView = document.querySelector(".nav-item.active")?.dataset.view;
        if (activeView === "latest-results") {
            renderLatestResultsView();
        }

        if (activeView === "timeline") {
            renderTimelineView();
        }

        setTimeout(() => {
            latestResultNewRaceKeys.clear();
        }, 1600);
    }, 60000);
}

function stopLatestResultsRefresh() {
    if (latestResultsRefreshTimer) {
        clearInterval(latestResultsRefreshTimer);
        latestResultsRefreshTimer = null;
    }
}

function showLatestResultsView() {
    resetMobileViewScroll();
    stopTimelineRefresh();
    clearNextUpTimer();

    document.querySelector(".hero").style.display = "none";
    document.querySelector(".dashboard-grid").style.display = "none";
    document.querySelector(".meetings-panel").style.display = "";

    document.querySelector(".panel-heading").innerHTML = `
        <span>🏁</span>
        <span>Latest Results</span>
    `;

    renderLatestResultsView();
}

function getLatestResultRaces() {
    const raceMap = new Map();

    (liveResultsRows || []).forEach(row => {
        const raceKey = clean(row.RaceAnchorFull || "");
        if (!raceKey) return;

        if (!raceMap.has(raceKey)) {
            raceMap.set(raceKey, {
                raceKey,
                venue: clean(row.Venue || ""),
                state: clean(row.State || ""),
                dateValue: clean(row.Date || ""),
                raceNo: clean(row["Race No"] || "").replace(/^R/i, ""),
                time: clean(row.Time || ""),
                raceName: clean(row["Race Name"] || ""),
                distance: clean(row.Distance || ""),
                gait: clean(row.Gait || ""),
                start: clean(row.Start || ""),
                videoLink: clean(row["Video Link"] || ""),
                photoLink: clean(row["Photo Link"] || ""),
                capturedAt: clean(row.LiveCapturedAtUTC || ""),
                raceDateTime: buildRaceDateTime(parseDateToKey(clean(row.Date || "")), clean(row.Time || "")),
                runners: []
            });
        }

        raceMap.get(raceKey).runners.push(row);
    });

    const todayKey = new Date().toLocaleDateString("en-CA");

    return [...raceMap.values()]
        .filter(race => {
            if (!race.capturedAt) return false;

            const captured = new Date(race.capturedAt);
            if (Number.isNaN(captured.getTime())) return false;

            return captured.toLocaleDateString("en-CA") === todayKey;
        })
        .sort((a, b) => {
            const capturedA = new Date(a.capturedAt || "").getTime() || 0;
            const capturedB = new Date(b.capturedAt || "").getTime() || 0;

            if (capturedA !== capturedB) {
                return capturedB - capturedA;
            }

            return Number(b.raceNo || 0) - Number(a.raceNo || 0);
        });

    }

async function loadResultsRecent() {
    try {
        const response = await fetch(RESULTS_RECENT_URL + "?v=" + Date.now(), { cache: "no-store" });

        if (!response.ok) {
            throw new Error(`Could not load ${RESULTS_RECENT_URL}`);
        }

        const text = await response.text();
        return parseCSV(text);
    } catch (error) {
        console.log("Recent results not loaded:", error);
        return [];
    }
}

function showResultsView() {
    stopTimelineRefresh();
    clearNextUpTimer();

    document.querySelector(".hero").style.display = "none";
    document.querySelector(".dashboard-grid").style.display = "none";
    document.querySelector(".meetings-panel").style.display = "";

    document.querySelector(".panel-heading").innerHTML = `
        <span>📋</span>
        <span>Results</span>
    `;

    renderResultsView();
}

function getResultRacesFromRows(rows, options = {}) {
    const raceMap = new Map();

    (rows || []).forEach(row => {
        const raceKey = clean(row.RaceAnchorFull || "");
        if (!raceKey) return;

        if (!raceMap.has(raceKey)) {
            raceMap.set(raceKey, {
                raceKey,
                venue: clean(row.Venue || ""),
                state: clean(row.State || ""),
                dateValue: clean(row.Date || ""),
                raceNo: clean(row["Race No"] || "").replace(/^R/i, ""),
                time: clean(row.Time || ""),
                raceName: clean(row["Race Name"] || ""),
                distance: clean(row.Distance || ""),
                gait: clean(row.Gait || ""),
                start: clean(row.Start || ""),
                videoLink: clean(row["Video Link"] || ""),
                photoLink: clean(row["Photo Link"] || ""),
                raceDateTime: buildRaceDateTime(parseDateToKey(clean(row.Date || "")), clean(row.Time || "")),
                runners: []
            });
        }

        raceMap.get(raceKey).runners.push(row);
    });

    return [...raceMap.values()].sort((a, b) => {
        const dateA = parseDateToKey(a.dateValue || "");
        const dateB = parseDateToKey(b.dateValue || "");

        if (dateA !== dateB) return dateB.localeCompare(dateA);

        const timeA = a.raceDateTime?.getTime() || 0;
        const timeB = b.raceDateTime?.getTime() || 0;

        if (timeA !== timeB) return timeB - timeA;

        return Number(b.raceNo || 0) - Number(a.raceNo || 0);
    });
}

function getRecentResultRaces() {
    return getResultRacesFromRows(resultsRecentRows || []);
}

function getResultsAvailableDates() {
    const dates = [...new Set(
        (resultsRecentRows || [])
            .map(row => parseDateToKey(clean(row.Date || "")))
            .filter(Boolean)
    )].sort((a, b) => b.localeCompare(a));

    return dates;
}

function getResultsAvailableVenues(filteredRows) {
    return [...new Set(
        (filteredRows || [])
            .map(row => clean(row.Venue || ""))
            .filter(Boolean)
    )].sort();
}

function renderResultsView() {
    let rows = resultsRecentRows || [];

    const dates = getResultsAvailableDates();

    if (!selectedResultsDate && dates.length) {
        selectedResultsDate = dates[0];
    }

    if (selectedResultsDate) {
        rows = rows.filter(row => parseDateToKey(clean(row.Date || "")) === selectedResultsDate);
    }

    if (selectedResultsState !== "ALL") {
        rows = rows.filter(row => clean(row.State || "").toUpperCase() === selectedResultsState);
    }

    const venues = getResultsAvailableVenues(rows);

    if (selectedResultsVenue !== "ALL" && !venues.includes(selectedResultsVenue)) {
        selectedResultsVenue = "ALL";
    }

    if (selectedResultsVenue !== "ALL") {
        rows = rows.filter(row => clean(row.Venue || "") === selectedResultsVenue);
    }

    const races = getResultRacesFromRows(rows).sort((a, b) => {
        const venueDiff = shortVenueName(a.venue).localeCompare(shortVenueName(b.venue));
        if (venueDiff !== 0) return venueDiff;

        return Number(a.raceNo || 999) - Number(b.raceNo || 999);
    });

    const venueGroups = groupResultsByVenue(races);

    document.getElementById("meetingStrip").innerHTML = `
        <div class="latest-results-layout">
            <div class="results-filter-row">
                <label>
                    Date
                    <select onchange="setResultsDateFilter(this.value)">
                        ${dates.map(date => `
                            <option value="${escapeHtml(date)}" ${selectedResultsDate === date ? "selected" : ""}>
                                ${escapeHtml(formatResultsDateLabel(date))}
                            </option>
                        `).join("")}
                    </select>
                </label>

                <label>
                    Venue
                    <select onchange="setResultsVenueFilter(this.value)">
                        <option value="ALL">All venues</option>
                        ${venues.map(venue => `
                            <option value="${escapeHtml(venue)}" ${selectedResultsVenue === venue ? "selected" : ""}>
                                ${escapeHtml(shortVenueName(venue))}
                            </option>
                        `).join("")}
                    </select>
                </label>
            </div>

            <div class="driver-state-filter next-up-filter">
                ${["ALL", "VIC", "NSW", "QLD", "SA", "WA", "TAS"].map(state => `
                    <button class="driver-state-button ${selectedResultsState === state ? "selected" : ""}"
                        onclick="setResultsStateFilter('${state}')">
                        ${state}
                    </button>
                `).join("")}
            </div>

            <div class="results-range-note">
                Showing results from the past ${RESULTS_LOOKBACK_DAYS} days.
            </div>

            <div class="results-venue-grid">


            <div class="results-venue-grid">
                ${venueGroups.length ? venueGroups.map(renderResultsVenueTile).join("") : `
                    <div class="coming-soon-card">
                        <div class="coming-soon-title">No results found</div>
                        <p>No results match the selected filters.</p>
                    </div>
                `}
            </div>
        </div>
    `;
}

function groupResultsByVenue(races) {
    const map = new Map();

    races.forEach(race => {
        const key = `${race.venue}|${race.state}`;

        if (!map.has(key)) {
            map.set(key, {
                venue: race.venue,
                state: race.state,
                races: []
            });
        }

        map.get(key).races.push(race);
    });

    return [...map.values()].sort((a, b) => {
        return shortVenueName(a.venue).localeCompare(shortVenueName(b.venue));
    });
}

function renderResultsVenueTile(group) {
    const races = [...group.races].sort((a, b) => {
        return Number(a.raceNo || 999) - Number(b.raceNo || 999);
    });

    const key = `${group.venue}|${group.state}`;
    const isOpen = expandedResultsVenues.has(key);

    return `
        <div class="results-venue-tile ${isOpen ? "open" : ""}">
            <button class="results-venue-header" type="button"
                onclick="toggleResultsVenue('${escapeHtml(key)}')">
                <div>
                    <div class="race-panel-eyebrow">${escapeHtml(group.state || "")}</div>
                    <h2>${escapeHtml(shortVenueName(group.venue))}</h2>
                </div>

                <div class="results-venue-summary">
                    <span>${races.length} races</span>
                    <strong>${isOpen ? "−" : "+"}</strong>
                </div>
            </button>

            ${isOpen ? `
                <div class="results-venue-races">
                    ${races.map(renderResultCard).join("")}
                </div>
            ` : ""}
        </div>
    `;
}

function toggleResultsVenue(key) {
    if (expandedResultsVenues.has(key)) {
        expandedResultsVenues.delete(key);
    } else {
        expandedResultsVenues.add(key);
    }

    renderResultsView();
}

function setResultsDateFilter(dateValue) {
    selectedResultsDate = dateValue;
    selectedResultsVenue = "ALL";
    expandedResultsVenues.clear();
    renderResultsView();
}

function setResultsStateFilter(state) {
    selectedResultsState = state;
    selectedResultsVenue = "ALL";
    expandedResultsVenues.clear();
    renderResultsView();
}

function setResultsVenueFilter(venue) {
    selectedResultsVenue = venue;
    expandedResultsVenues.clear();

    if (venue !== "ALL") {
        const rows = resultsRecentRows.filter(row =>
            parseDateToKey(clean(row.Date || "")) === selectedResultsDate &&
            clean(row.Venue || "") === venue
        );

        const first = rows[0];
        if (first) {
            expandedResultsVenues.add(`${clean(first.Venue || "")}|${clean(first.State || "")}`);
        }
    }

    renderResultsView();
}

function getAdjacentLatestResults(race) {
    const raceDateKey = parseDateToKey(clean(race.dateValue || ""));

    const meetingRaces = getLatestResultRaces()
        .filter(r =>
            clean(r.venue || "") === clean(race.venue || "") &&
            parseDateToKey(clean(r.dateValue || "")) === raceDateKey
        )
        .sort((a, b) => Number(a.raceNo) - Number(b.raceNo));

    const idx = meetingRaces.findIndex(r => r.raceKey === race.raceKey);

    return {
        prev: idx > 0 ? meetingRaces[idx - 1] : null,
        next: idx < meetingRaces.length - 1 ? meetingRaces[idx + 1] : null
    };
}

function formatResultsDateLabel(dateKey) {
    if (!dateKey) return "";

    const d = new Date(dateKey + "T00:00:00");

    if (Number.isNaN(d.getTime())) return dateKey;

    return d.toLocaleDateString("en-AU", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

function renderResultCard(race) {
    const runners = [...race.runners].sort((a, b) => {
        return resultPlacingSortValue(a.Placing) - resultPlacingSortValue(b.Placing);
    });

    const winner = runners.find(r => clean(r.Placing || "") === "1");
    const placings = runners.filter(r => ["2", "3"].includes(clean(r.Placing || "")));

    const winnerHorse = winner ? clean(winner.Horse || "").toUpperCase() : "RESULT CAPTURED";
    const winnerSp = winner ? formatSP(winner.SP, true) : "";
    const winnerTrainer = winner ? toProperCase(clean(winner.Trainer || "")) : "";
    const winnerDriver = winner ? toProperCase(clean(winner.Driver || "")) : "";

    return `
        <div class="latest-result-card">
            <div class="latest-result-time">
                ${escapeHtml(race.time || "TBC")}
            </div>

            <div class="latest-result-race">
                R${escapeHtml(race.raceNo)}
                ${race.distance ? `<span>${escapeHtml(race.distance)}m</span>` : ""}
            </div>

            <div class="latest-result-main">
                <div class="latest-result-winner">
                    🥇 ${escapeHtml(winnerHorse)}
                    ${winnerSp ? `<span>${escapeHtml(winnerSp)}</span>` : ""}
                    ${winnerTrainer || winnerDriver ? `
                        <span class="latest-result-trainer-driver">
                            ${escapeHtml(winnerTrainer)}
                            ${winnerTrainer && winnerDriver ? " • " : ""}
                            ${escapeHtml(winnerDriver)}
                        </span>
                    ` : ""}
                </div>

                <div class="latest-result-placings">
                    ${placings.map(renderLatestResultPlacing).join("")}
                </div>
            </div>

            <div class="latest-result-actions">
                <button class="latest-result-details-button"
                    onclick="openResultPopup('${escapeHtml(race.raceKey)}')">
                    Details
                </button>
            </div>
        </div>
    `;
}

function getResultByRaceAnchor(raceAnchorFull) {
    const key = normaliseRaceAnchor(raceAnchorFull);
    if (!key) return null;

    return getRecentResultRaces().find(race =>
        normaliseRaceAnchor(race.raceKey) === key
    ) || null;
}

function openResultPopup(raceKey) {
    const race = getRecentResultRaces().find(r => r.raceKey === raceKey);
    if (!race) return;

    const existing = document.getElementById("latestResultPopup");
    if (existing) existing.remove();

    document.body.insertAdjacentHTML("beforeend", renderResultPopup(race));

    // 🔥 RETRY SUPERTAB AFTER RENDER
    setTimeout(() => {
        const key = normaliseRaceAnchor(race.raceKey);
        const row = getTabDividendsForRace(key);

        const box = document.querySelector(".latest-result-dividends");

        if (box && row) {
            box.outerHTML = renderTabDividendBox(key);
        }
    }, 250);
}

function renderResultPopup(race) {
    const { prev, next } = getAdjacentResultRaces(race);

    let html = renderLatestResultPopup(race, true)
        .replaceAll("openLatestResultPopup", "openResultPopup");

    html = html.replace(
        `<div class="latest-result-popup" onclick="event.stopPropagation()">`,
        `<div class="latest-result-popup" onclick="event.stopPropagation()">
            ${prev ? `
                <button class="latest-result-nav latest-result-nav-prev"
                    onclick="event.stopPropagation(); openResultPopup('${escapeHtml(prev.raceKey)}')">
                    ‹
                </button>
            ` : ""}

            ${next ? `
                <button class="latest-result-nav latest-result-nav-next"
                    onclick="event.stopPropagation(); openResultPopup('${escapeHtml(next.raceKey)}')">
                    ›
                </button>
            ` : ""}`
    );

    return html;
}

function normaliseRaceAnchor(value) {
    return clean(value || "").toUpperCase();
}

function getLatestResultByRaceAnchor(raceAnchorFull) {
    const key = normaliseRaceAnchor(raceAnchorFull);
    if (!key) return null;

    return getLatestResultRaces().find(race =>
        normaliseRaceAnchor(race.raceKey) === key
    ) || null;
}

function getRaceAnchorForUpcomingRace(venue, state, dateValue, raceNo) {
    const row = allRows.find(row => {
        const rowVenue = clean(row.Venue || "");
        const rowState = clean(row.State || row.STATE || row["State "] || "");
        const rowDate = clean(row.Date || row.DATE || row["Meeting Date"] || "");
        const rowRaceNo = clean(row["Race No"] || row.RaceNo || row.Race || "").replace(/^R/i, "");

        return rowVenue === venue &&
            rowState === state &&
            rowDate === dateValue &&
            rowRaceNo === String(raceNo);
    });

    return normaliseRaceAnchor(row?.RaceAnchorFull || "");
}

function openFieldFromLatestResult(raceKey) {
    const targetKey = normaliseRaceAnchor(raceKey);

    const fieldRow = allRows.find(row =>
        normaliseRaceAnchor(row.RaceAnchorFull || row["RaceAnchorFull"] || "") === targetKey
    );

    if (!fieldRow) {
        console.log("Could not find matching field row for result:", raceKey);
        showUpcomingFieldsView();
        return;
    }

    const venue = clean(fieldRow.Venue || "");
    const state = clean(fieldRow.State || fieldRow.STATE || fieldRow["State "] || "");
    const dateValue = clean(fieldRow.Date || fieldRow.DATE || fieldRow["Meeting Date"] || "");
    const raceNo = clean(fieldRow["Race No"] || fieldRow.RaceNo || fieldRow.Race || "").replace(/^R/i, "");

    openRaceFromHome({
        key: `${venue}|${state}|${dateValue}|${raceNo}`,
        venue,
        state,
        dateValue,
        raceNo,
        time: getRaceDisplayTime(fieldRow),
        raceDateTime: getRaceDateTime(fieldRow)
    });
}

function openLatestResultFromField(raceAnchorFull) {
    const race = getLatestResultByRaceAnchor(raceAnchorFull);
    if (!race) return;

    openLatestResultPopup(race.raceKey);
}

function formatDisplayTime(capturedAt, fallbackTime) {
    if (capturedAt) {
        const d = new Date(capturedAt);

        if (!isNaN(d.getTime())) {
            return d.toLocaleTimeString("en-AU", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false
            });
        }
    }

    return fallbackTime || "TBC";
}

function renderLatestResultsView() {
    const allRaces = getLatestResultRaces();

    const races = selectedLatestResultsState === "ALL"
        ? allRaces
        : allRaces.filter(race => clean(race.state || "").toUpperCase() === selectedLatestResultsState);

    document.getElementById("meetingStrip").innerHTML = `
        <div class="latest-results-layout">
            <div style="height: 4px;"></div>

            <div class="driver-state-filter next-up-filter">
                ${["ALL", "VIC", "NSW", "QLD", "SA", "WA", "TAS"].map(state => `
                    <button class="driver-state-button ${selectedLatestResultsState === state ? "selected" : ""}"
                        onclick="setLatestResultsStateFilter('${state}')">
                        ${state}
                    </button>
                `).join("")}
            </div>

            <div class="latest-results-list">
                ${races.length ? races.map(renderLatestResultCard).join("") : `
                    <div class="coming-soon-card">
                        <div class="coming-soon-title">No live results captured today</div>
                        <p>No results match the selected state filter.</p>
                    </div>
                `}
            </div>
        </div>
    `;
}

function setLatestResultsStateFilter(state) {
    selectedLatestResultsState = state;
    renderLatestResultsView();
}

function renderLatestResultCard(race) {
    const runners = [...race.runners].sort((a, b) => {
        return resultPlacingSortValue(a.Placing) - resultPlacingSortValue(b.Placing);
    });

    const winner = runners.find(r => clean(r.Placing || "") === "1");
    const placings = runners.filter(r => ["2", "3"].includes(clean(r.Placing || "")));

    const winnerHorse = winner
        ? clean(winner.Horse || "").toUpperCase()
        : "RESULT CAPTURED";

    const winnerSp = winner
        ? formatSP(winner.SP, true)
        : "";

    const winnerTrainer = winner
        ? toProperCase(clean(winner.Trainer || ""))
        : "";

    const winnerDriver = winner
        ? toProperCase(clean(winner.Driver || ""))
        : "";

    const isNewResult =
        latestResultNewRaceKeys.has(
            normaliseRaceAnchor(race.raceKey)
        );

    const isMobile = window.innerWidth <= 700;

    return `
        <div
            class="latest-result-card ${isNewResult ? "latest-result-card-new" : ""} ${isMobile ? "latest-result-card-mobile" : ""}"
            ${isMobile
                ? `onclick="openLatestResultPopup('${escapeHtml(race.raceKey)}')"`
                : ""
            }
        >
            <div class="latest-result-time">
                ${race.time || "TBC"}
            </div>

            <div class="latest-result-race">
                ${escapeHtml(shortVenueName(race.venue))}
                R${escapeHtml(race.raceNo)}

                ${race.state
                    ? `<span>${escapeHtml(race.state)}</span>`
                    : ""
                }
            </div>

            <div class="latest-result-main">

                <div class="latest-result-winner">
                    🥇 ${escapeHtml(winnerHorse)}

                    ${winnerSp
                        ? `<span>${escapeHtml(winnerSp)}</span>`
                        : ""
                    }
                </div>

                ${isMobile && (winnerTrainer || winnerDriver) ? `
                    <div class="latest-result-mobile-people">
                        (
                        ${escapeHtml(winnerTrainer)}
                        ${winnerTrainer && winnerDriver ? " - " : ""}
                        ${escapeHtml(winnerDriver)}
                        )
                    </div>
                ` : ""}

                ${!isMobile && (winnerTrainer || winnerDriver) ? `
                    <div class="latest-result-trainer-driver">
                        ${escapeHtml(winnerTrainer)}
                        ${winnerTrainer && winnerDriver ? " • " : ""}
                        ${escapeHtml(winnerDriver)}
                    </div>
                ` : ""}

                <div class="latest-result-placings">
                    ${placings.map(renderLatestResultPlacing).join("")}
                </div>
            </div>

            ${!isMobile ? `
                <div class="latest-result-actions">

                    <button
                        class="latest-result-details-button"
                        onclick="openLatestResultPopup('${escapeHtml(race.raceKey)}')">
                        Details
                    </button>

                    <button
                        class="latest-result-details-button"
                        onclick="openFieldFromLatestResult('${escapeHtml(race.raceKey)}')">
                        Field
                    </button>

                </div>
            ` : ""}
        </div>
    `;
}

function renderLatestResultPlacing(row) {
    const placing = clean(row.Placing || "");
    const medal = placing === "2" ? "🥈" : "🥉";
    const horse = clean(row.Horse || "").toUpperCase();
    const sp = formatSP(row.SP, true);

    return `
        <div>
            <span>${medal}</span>
            <strong>${escapeHtml(horse)}</strong>
            ${sp ? `<em>${escapeHtml(sp)}</em>` : ""}
        </div>
    `;
}

function ordinal(value) {
    const n = Number(clean(value || ""));
    if (!Number.isFinite(n)) return clean(value || "");

    const mod100 = n % 100;
    if ([11, 12, 13].includes(mod100)) return `${n}th`;

    const mod10 = n % 10;
    if (mod10 === 1) return `${n}st`;
    if (mod10 === 2) return `${n}nd`;
    if (mod10 === 3) return `${n}rd`;

    return `${n}th`;
}

function resultPlacingSortValue(value) {
    const raw = clean(value || "").toLowerCase();

    const n = parseInt(raw, 10);

    if (Number.isFinite(n)) {
        return n;
    }

    // r / TO / DQ / retired / non-numeric outcomes always bottom
    return 999;
}

function parseSectionalNumber(value) {
    const raw = clean(value || "");
    const num = parseFloat(raw);
    return Number.isFinite(num) ? num : null;
}

function formatMileRateFromRace(first) {
    let leadTime = parseSectionalNumber(first.LeadTime);
    const q1 = parseSectionalNumber(first["1st Quarter"]);
    const q2 = parseSectionalNumber(first["2nd Quarter"]);
    const q3 = parseSectionalNumber(first["3rd Quarter"]);
    const q4 = parseSectionalNumber(first["Fourth Quarter"] || first["4th Quarter"]);
    const distance = parseSectionalNumber(first.Distance);

    if (distance === 1609 && !Number.isFinite(leadTime)) {
        leadTime = 0;
    }

    if (![leadTime, q1, q2, q3, q4, distance].every(Number.isFinite)) {
        return "";
    }

    const totalSeconds = leadTime + q1 + q2 + q3 + q4;
    const mileRateSeconds = totalSeconds / distance * 1609;

    const totalTenths = Math.round(mileRateSeconds * 10);
    const minutes = Math.floor(totalTenths / 600);
    const remainingTenths = totalTenths % 600;

    const seconds = Math.floor(remainingTenths / 10);
    const tenths = remainingTenths % 10;

    return `${minutes}:${String(seconds).padStart(2, "0")}.${tenths}`;
}

function formatMargin(value) {
    const margin = clean(value || "");

    if (!margin) return "";

    // Already formatted
    if (margin.toLowerCase().includes("m")) {
        return margin;
    }

    // Ignore textual margins
    if (/[a-z]/i.test(margin)) {
        return margin;
    }

    const num = parseFloat(margin);

    if (Number.isNaN(num)) {
        return margin;
    }

    return `${num.toFixed(1)}m`;
}

function openTimelineResultPopup(raceKey) {
    const historicalRace = getResultByRaceAnchor(raceKey);

    if (historicalRace) {
        openResultPopup(historicalRace.raceKey);
        return;
    }

    openLatestResultPopup(raceKey);
}

function openLatestResultPopup(raceKey) {
    const race = getLatestResultRaces().find(r => r.raceKey === raceKey);
    if (!race) return;

    const existing = document.getElementById("latestResultPopup");
    if (existing) existing.remove();

    document.body.insertAdjacentHTML("beforeend", renderLatestResultPopup(race, false));
}

function closeLatestResultPopup() {
    document.getElementById("latestResultPopup")?.remove();
}

function getAdjacentResultRaces(race) {
    const raceDateKey = parseDateToKey(clean(race.dateValue || ""));

    const meetingRaces = getRecentResultRaces()
        .filter(r =>
            clean(r.venue || "") === clean(race.venue || "") &&
            parseDateToKey(clean(r.dateValue || "")) === raceDateKey
        )
        .sort((a, b) => Number(a.raceNo) - Number(b.raceNo));

    const idx = meetingRaces.findIndex(r => r.raceKey === race.raceKey);

    return {
        prev: idx > 0 ? meetingRaces[idx - 1] : null,
        next: idx < meetingRaces.length - 1 ? meetingRaces[idx + 1] : null
    };
}

function formatQuarter(value) {
    const num = parseFloat(value);

    if (Number.isNaN(num)) {
        return value || "";
    }

    return num.toFixed(1);
}

function formatSP(sp, includeDollar = false) {
    const n = Number(sp);
    if (!Number.isFinite(n)) return "";

    const formatted = n.toFixed(2);
    return includeDollar ? `$${formatted}` : formatted;
}

function renderLatestResultPopup(race, showBSP = false) {
    const runners = [...race.runners].sort((a, b) => {
        return resultPlacingSortValue(a.Placing) - resultPlacingSortValue(b.Placing);
    });

    const first = runners[0] || {};
    const raceTitle = clean(race.raceName || first["Race Name"] || "");
    const distance = clean(race.distance || first.Distance || "");
    const start = clean(race.start || first.Start || "");
    const gait = formatGait(race.gait || first.Gait || "");

    const leadTime = clean(first.LeadTime || "");
    const q1 = clean(first["1st Quarter"] || "");
    const q2 = clean(first["2nd Quarter"] || "");
    const q3 = clean(first["3rd Quarter"] || "");
    const q4 = clean(first["4th Quarter"] || "");
    const mileRate = formatMileRateFromRace(first);

    const { prev, next } = getAdjacentLatestResults(race);

    const isMobile = window.innerWidth <= 700;

    return `
        <div class="latest-result-popup-backdrop" id="latestResultPopup" onclick="closeLatestResultPopup()">

            <div class="latest-result-popup ${isMobile ? "latest-result-popup-mobile" : ""}" onclick="event.stopPropagation()">

                ${prev ? `
                    <button class="latest-result-nav latest-result-nav-prev"
                        onclick="event.stopPropagation(); openLatestResultPopup('${escapeHtml(prev.raceKey)}')">
                        ‹
                    </button>
                ` : ""}

                ${next ? `
                    <button class="latest-result-nav latest-result-nav-next"
                        onclick="event.stopPropagation(); openLatestResultPopup('${escapeHtml(next.raceKey)}')">
                        ›
                    </button>
                ` : ""}

                <div class="latest-result-popup-header">
                    <div>
                        <div class="race-panel-eyebrow">
                            Full result
                        </div>

                        <h2>
                            ${escapeHtml(shortVenueName(race.venue))} R${escapeHtml(race.raceNo)}
                            ${race.dateValue
                                ? ` • ${escapeHtml(formatResultDate(race.dateValue))}`
                                : ""
                            }
                        </h2>

                        <p>
                            ${escapeHtml(race.time || "TBC")}
                            ${raceTitle
                                ? ` • ${escapeHtml(raceTitle)}`
                                : ""
                            }
                        </p>

                        <p>
                            ${distance
                                ? `${escapeHtml(distance)}m`
                                : ""
                            }

                            ${start
                                ? ` • ${escapeHtml(start)}`
                                : ""
                            }

                            ${gait
                                ? ` • ${escapeHtml(gait)}`
                                : ""
                            }
                        </p>
                    </div>

                    <button onclick="closeLatestResultPopup()">×</button>
                </div>


                ${isMobile ? `

                    <div class="mobile-result-runner-list">

                        ${runners.map(row => {

                            let bellPosition = clean(
                                row.BellPosition ||
                                row["Bell Position"] ||
                                row["Bell Pos"] ||
                                ""
                            );

                            if (bellPosition === "0") {
                                bellPosition = "";
                            }

                            const placing =
                                ordinal(row.Placing);

                            const horse =
                                clean(row.Horse || "").toUpperCase();

                            const barrier =
                                clean(row.Barrier || "");

                            const trainer =
                                toProperCase(row.Trainer || "");

                            const driver =
                                toProperCase(row.Driver || "");

                            const marginRaw = formatMargin(row.Margin);

                            const margin =
                                marginRaw ? `btn ${marginRaw}` : "";

                            const sp =
                                formatSP(row.SP, true);

                            const indHalf =
                                row["Ind Half"] &&
                                !isNaN(parseFloat(row["Ind Half"]))
                                    ? `ELH ${parseFloat(row["Ind Half"]).toFixed(1)}`
                                    : "";

                            const lowerParts = [
                                bellPosition,
                                margin,
                                indHalf
                            ].filter(Boolean);

                            return `
                                <div class="mobile-result-runner-row">

                                    <div class="mobile-result-runner-top">

                                        <span class="mobile-result-placing">
                                            ${escapeHtml(placing)}
                                        </span>

                                        <span class="mobile-result-horse">
                                            ${escapeHtml(horse)}
                                        </span>

                                        ${barrier ? `
                                            <span class="mobile-result-barrier">
                                                (${escapeHtml(barrier)})
                                            </span>
                                        ` : ""}

                                        <span class="mobile-result-sp">
                                            ${escapeHtml(sp)}
                                        </span>

                                    </div>

                                    ${(trainer || driver) ? `
                                        <div class="mobile-result-people">
                                            ${escapeHtml(trainer)}
                                            ${trainer && driver ? " • " : ""}
                                            ${escapeHtml(driver)}
                                        </div>
                                    ` : ""}

                                    ${lowerParts.length ? `
                                        <div class="mobile-result-race-detail">
                                            ${lowerParts
                                                .map(part => escapeHtml(part))
                                                .join(" • ")
                                            }
                                        </div>
                                    ` : ""}

                                </div>
                            `;

                        }).join("")}

                    </div>

                ` : `

                    <div class="latest-result-popup-table-wrap">

                        <table class="latest-result-popup-table">

                            <thead>
                                <tr>
                                    <th>Pl</th>
                                    <th>Horse</th>
                                    <th>Br</th>
                                    <th>Bell</th>
                                    <th>Trainer</th>
                                    <th>Driver</th>
                                    <th>Margin</th>
                                    <th>SP</th>

                                    ${showBSP ? `
                                        <th class="table-divider"></th>
                                        <th class="runner-bsp">BSP(W)</th>
                                        <th class="runner-bsp">BSP(P)</th>
                                        <th class="table-divider"></th>
                                    ` : ""}

                                    <th>E.Half</th>
                                </tr>
                            </thead>

                            <tbody>

                                ${runners.map(row => {

                                    let bellPosition = clean(
                                        row.BellPosition ||
                                        row["Bell Position"] ||
                                        row["Bell Pos"] ||
                                        ""
                                    );

                                    if (bellPosition === "0") {
                                        bellPosition = "";
                                    }

                                    return `
                                        <tr>
                                            <td>
                                                ${escapeHtml(ordinal(row.Placing))}
                                            </td>

                                            <td>
                                                ${escapeHtml(clean(row.Horse || "").toUpperCase())}
                                            </td>

                                            <td>
                                                ${escapeHtml(row.Barrier || "")}
                                            </td>

                                            <td class="latest-result-bell">
                                                ${escapeHtml(bellPosition)}
                                            </td>

                                            <td>
                                                ${escapeHtml(toProperCase(row.Trainer || ""))}
                                            </td>

                                            <td>
                                                ${escapeHtml(toProperCase(row.Driver || ""))}
                                            </td>

                                            <td>
                                                ${escapeHtml(formatMargin(row.Margin))}
                                            </td>

                                            <td class="latest-result-sp">
                                                ${formatSP(row.SP, true)}
                                            </td>

                                            ${showBSP ? `
                                                <td class="table-divider"></td>

                                                <td class="runner-bsp">
                                                    ${row.BSP_Win != null && row.BSP_Win !== ""
                                                        ? `$${parseFloat(row.BSP_Win).toFixed(2)}`
                                                        : ""
                                                    }
                                                </td>

                                                <td class="runner-bsp">
                                                    ${row.BSP_Place != null && row.BSP_Place !== ""
                                                        ? `$${parseFloat(row.BSP_Place).toFixed(2)}`
                                                        : ""
                                                    }
                                                </td>

                                                <td class="table-divider"></td>
                                            ` : ""}

                                            <td>
                                                ${
                                                    row["Ind Half"] &&
                                                    !isNaN(parseFloat(row["Ind Half"]))
                                                        ? escapeHtml(
                                                            parseFloat(row["Ind Half"]).toFixed(1)
                                                        )
                                                        : ""
                                                }
                                            </td>
                                        </tr>
                                    `;

                                }).join("")}

                            </tbody>

                        </table>

                    </div>

                `}


                ${leadTime || q1 || q2 || q3 || q4 || mileRate ? `
                    <div class="latest-result-sections">

                        ${leadTime
                            ? `<span><strong>Lead Time:</strong> ${escapeHtml(leadTime)}</span>`
                            : ""
                        }

                        ${q1
                            ? `<span><strong>Q1:</strong> ${escapeHtml(formatQuarter(q1))}</span>`
                            : ""
                        }

                        ${q2
                            ? `<span><strong>Q2:</strong> ${escapeHtml(formatQuarter(q2))}</span>`
                            : ""
                        }

                        ${q3
                            ? `<span><strong>Q3:</strong> ${escapeHtml(formatQuarter(q3))}</span>`
                            : ""
                        }

                        ${q4
                            ? `<span><strong>Q4:</strong> ${escapeHtml(formatQuarter(q4))}</span>`
                            : ""
                        }

                        ${mileRate
                            ? `<span><strong>Mile Rate:</strong> ${escapeHtml(mileRate)}</span>`
                            : ""
                        }

                    </div>
                ` : ""}

                ${renderTabDividendBox(
                    normaliseRaceAnchor(race.raceKey)
                )}

            </div>

        </div>
    `;
}
function formatResultDate(dateStr) {
    if (!dateStr) return "";

    const [day, month, year] = dateStr.split("/").map(Number);

    const date = new Date(year, month - 1, day);

    const weekday = date.toLocaleDateString("en-AU", { weekday: "long" });
    const monthName = date.toLocaleDateString("en-AU", { month: "long" });

    return `${weekday} ${day} ${monthName} ${year}`;
}

function renderLatestResultsHomeTile() {
    const countEl = document.getElementById("latestResultsCount");
    const previewEl = document.getElementById("latestResultsPreview");
    const button = document.getElementById("viewLatestResultsButton");

    if (!countEl || !previewEl) return;

    const races = getLatestResultRaces();

    countEl.textContent = races.length || "—";

    previewEl.innerHTML = races.length
        ? races.slice(0, 4).map(race => {
            const winner = race.runners.find(r => clean(r.Placing || "") === "1");
            const winnerHorse = winner ? clean(winner.Horse || "") : "RESULT CAPTURED";

            const winnerTrainer = winner
                ? toProperCase(clean(winner.Trainer || ""))
                : "";

            const winnerDriver = winner
                ? toProperCase(clean(winner.Driver || ""))
                : "";

            return `
                <div class="latest-result-preview-row">
                    <span>${escapeHtml(shortVenueName(race.venue))} R${escapeHtml(race.raceNo)}</span>

                    <div>
                        <strong>${escapeHtml(winnerHorse)}</strong>

                        ${(winnerTrainer || winnerDriver) ? `
                            <span class="latest-results-preview-meta">
                                (${escapeHtml(winnerTrainer)} • ${escapeHtml(winnerDriver)})
                            </span>
                        ` : ""}
                    </div>
                </div>
            `;
        }).join("")
        : `<div class="latest-result-preview-empty">No live results yet.</div>`;

    if (button) {
        button.onclick = function (e) {
            e.preventDefault();

            document.querySelectorAll(".nav-item").forEach(i => i.classList.remove("active"));
            document.querySelector('.nav-item[data-view="latest-results"]')?.classList.add("active");

            showLatestResultsView();
        };
    }
}


function showNextUpView() {
    stopTimelineRefresh();
    document.querySelector(".hero").style.display = "none";
    document.querySelector(".dashboard-grid").style.display = "none";
    document.querySelector(".meetings-panel").style.display = "";

    document.querySelector(".panel-heading").innerHTML = `
        <span>🟢</span>
        <span>Next Up</span>
    `;

    renderNextUpView();

    if (nextUpPageTimer) {
        clearInterval(nextUpPageTimer);
    }

    nextUpPageTimer = setInterval(renderNextUpView, 30000);
}

function renderNextUpView() {
    const allRaces = findUpcomingRaces(allRows);

    const races = selectedNextUpState === "ALL"
        ? allRaces.slice(0, 15)
        : allRaces.filter(race => race.state === selectedNextUpState).slice(0, 15);

    document.getElementById("meetingStrip").innerHTML = `
        <div class="next-up-layout">
            <div style="height: 4px;"></div>

            <div class="driver-state-filter next-up-filter">
                ${["ALL", "VIC", "NSW", "QLD", "SA", "WA", "TAS"].map(state => `
                    <button class="driver-state-button ${selectedNextUpState === state ? "selected" : ""}"
                        onclick="setNextUpStateFilter('${state}')">
                        ${state}
                    </button>
                `).join("")}
            </div>

            <div class="next-up-race-list">
                ${races.length ? races.map(renderNextUpRaceCard).join("") : `
                    <div class="coming-soon-card">
                        <div class="coming-soon-title">No upcoming races found</div>
                        <p>No future races match the selected filter.</p>
                    </div>
                `}
            </div>
        </div>
    `;
}

function setNextUpStateFilter(state) {
    selectedNextUpState = state;
    renderNextUpView();
}

function clearNextUpTimer() {
    if (nextUpPageTimer) {
        clearInterval(nextUpPageTimer);
        nextUpPageTimer = null;
    }
}

function renderNextUpRaceCard(race) {
    const details = getRaceDetailsForNextToGo(race);
    const countdown = formatNextUpCountdown(race.raceDateTime);

    return `
        <button class="next-up-race-card" onclick="openRaceFromHomeByKey('${escapeHtml(race.key)}')">
            <div class="next-up-countdown">${escapeHtml(countdown)}</div>

            <div class="next-up-main">
                <div class="next-up-title">
                    ${escapeHtml(shortVenueNameHomeNext10(race.venue))} R${escapeHtml(race.raceNo)}
                    ${race.state ? `<span>${escapeHtml(race.state)}</span>` : ""}
                </div>

                <div class="next-up-meta">
                    ${escapeHtml(race.time || "TBC")}
                    ${details.meta ? ` • ${escapeHtml(details.meta)}` : ""}
                </div>
            </div>

            <div class="next-up-race-name">
                ${escapeHtml(details.raceName || `Race ${race.raceNo}`)}
            </div>

            <div class="race-arrow">›</div>
        </button>
    `;
}

function formatNextUpCountdown(raceDateTime) {
    if (!raceDateTime) return "TBC";

    const diffMs = raceDateTime.getTime() - new Date().getTime();

    if (diffMs <= 0) return "🔥 NOW";

    const totalSeconds = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    if (days > 0) return `📅 ${days}d ${hours}h`;

    if (hours > 0) {
        if (window.innerWidth <= 700) return `⏱ ${hours}h`;
        return `⏱ ${hours}h ${minutes}m`;
    }

    if (minutes <= 5) return `🔥 ${minutes}m`;

    return `⚡ ${minutes}m`;
}

function formatTimeUntil(raceDateTime, now = new Date()) {
    const diffMs = raceDateTime.getTime() - now.getTime();

    if (diffMs <= 0) return "Now";

    const totalMinutes = Math.round(diffMs / 60000);
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;

    if (days > 0) {
        if (hours > 0) return `${days}d ${hours}h`;
        return `${days}d`;
    }

    if (hours <= 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;

    return `${hours}h ${minutes}m`;
}

function showFeatureRacesView() {
    stopTimelineRefresh();
    clearNextUpTimer();

    document.querySelector(".hero").style.display = "none";
    document.querySelector(".dashboard-grid").style.display = "none";
    document.querySelector(".meetings-panel").style.display = "";

    document.querySelector(".panel-heading").innerHTML = `
        <span>🏆</span>
        <span>Feature Races</span>
    `;

    renderFeatureRacesView();
}

function renderFeatureRacesView() {
    const allRaces = getFeatureRaces(allRows);

    const races = selectedFeatureRaceState === "ALL"
        ? allRaces
        : allRaces.filter(race => race.state === selectedFeatureRaceState);

    document.getElementById("meetingStrip").innerHTML = `
        <div class="next-up-layout">
            <div style="height: 4px;"></div>

            <div class="driver-state-filter next-up-filter">
                ${["ALL", "VIC", "NSW", "QLD", "SA", "WA", "TAS"].map(state => `
                    <button class="driver-state-button ${selectedFeatureRaceState === state ? "selected" : ""}"
                        onclick="setFeatureRaceStateFilter('${state}')">
                        ${state}
                    </button>
                `).join("")}
            </div>

            <div class="next-up-race-list">
                ${races.length ? races.map(renderFeatureRaceCard).join("") : `
                    <div class="coming-soon-card">
                        <div class="coming-soon-title">No feature races found</div>
                        <p>No future races match the selected filter.</p>
                    </div>
                `}
            </div>
        </div>
    `;
}

function setFeatureRaceStateFilter(state) {
    selectedFeatureRaceState = state;
    renderFeatureRacesView();
}

const FEATURE_RACE_MIN = 50000;

function getFeatureRaces(rows) {
    const raceMap = new Map();
    const now = new Date();

    rows.forEach(row => {
        const venue = clean(row.Venue || "");
        const state = clean(row.State || row.STATE || row["State "] || "").toUpperCase();
        const dateValue = clean(row.Date || row.DATE || row["Meeting Date"] || "");
        const raceNo = clean(row["Race No"] || row.RaceNo || row.Race || "").replace(/^R/i, "");
        const raceDateTime = getRaceDateTime(row);
        const prizemoney = parseNumber(row.Prizemoney || row.PrizeMoney || row["Prize Money"] || "");

        if (!venue || !raceNo || !raceDateTime) return;
        if (raceDateTime.getTime() < now.getTime() - 5 * 60 * 1000) return;
        if (!Number.isFinite(prizemoney) || prizemoney < FEATURE_RACE_MIN) return;

        const key = `${venue}|${state}|${dateValue}|${raceNo}`;

        if (!raceMap.has(key)) {
            raceMap.set(key, {
                key,
                venue,
                state,
                dateValue,
                raceNo,
                time: getRaceDisplayTime(row),
                raceDateTime,
                prizemoney
            });
        }
    });

    return [...raceMap.values()].sort((a, b) => a.raceDateTime - b.raceDateTime);
}

function getFirstRowForRaceKey(key) {
    return allRows.find(row => {
        const venue = clean(row.Venue || "");
        const state = clean(row.State || row.STATE || row["State "] || "").toUpperCase();
        const dateValue = clean(row.Date || row.DATE || row["Meeting Date"] || "");
        const raceNo = clean(row["Race No"] || row.RaceNo || row.Race || "").replace(/^R/i, "");

        return `${venue}|${state}|${dateValue}|${raceNo}` === key;
    }) || null;
}

function formatPrizeMoney(value) {
    const num = Number(value);

    if (!Number.isFinite(num)) return "";

    return `$${Math.round(num).toLocaleString("en-AU")}`;
}

function getPrizeClass(value) {
    const num = Number(value);

    if (num >= 200000) return "feature-prize mega";
    if (num >= 100000) return "feature-prize major";
    if (num >= 50000) return "feature-prize strong";

    return "feature-prize";
}

function renderFeatureRaceCard(race) {
    const details = getRaceDetailsForNextToGo(race);
    const countdown = formatNextUpCountdown(race.raceDateTime);
    const prize = formatPrizeMoney(race.prizemoney);

    return `
        <button class="next-up-race-card" onclick="openRaceFromHomeByKey('${escapeHtml(race.key)}')">
            <div class="next-up-countdown">${escapeHtml(countdown)}</div>

            <div class="next-up-main">
                <div class="next-up-title">
                    ${escapeHtml(shortVenueNameHomeNext10(race.venue))} R${escapeHtml(race.raceNo)}
                    ${race.state ? `<span>${escapeHtml(race.state)}</span>` : ""}
                </div>

                <div class="next-up-meta">
                    ${escapeHtml(race.time || "TBC")}
                    ${details.meta ? ` • ${escapeHtml(details.meta)}` : ""}
                </div>
            </div>

            <div class="next-up-race-name">
                ${prize ? `<span class="${escapeHtml(getPrizeClass(race.prizemoney))}">${escapeHtml(prize)}</span> • ` : ""}
                ${escapeHtml(details.raceName || `Race ${race.raceNo}`)}
            </div>

            <div class="race-arrow">›</div>
        </button>
    `;
}

function showComingSoonView(title) {
    document.querySelector(".hero").style.display = "none";
    document.querySelector(".dashboard-grid").style.display = "none";
    document.querySelector(".meetings-panel").style.display = "";

    document.querySelector(".panel-heading").innerHTML = `
        <span>✨</span>
        <span>${escapeHtml(title)}</span>
    `;

    document.getElementById("meetingStrip").innerHTML = `
        <div class="coming-soon-card">
            <div class="coming-soon-title">${escapeHtml(title)}</div>
            <p>This section is ready to be wired into the Trotify dashboard.</p>
        </div>
    `;
}

function renderDashboard(rows) {
    const todayRows = rows.filter(isTodayRow);
    const dashboardRows = todayRows.length ? todayRows : rows;

    const meetings = groupMeetings(dashboardRows);
    const races = uniqueRaceCount(dashboardRows);
    const raceList = findUpcomingRaces(dashboardRows);
    const next = raceList[0] || null;
    const nextFour = raceList.slice(1, 11);
    const leaders = countGoodLeaders(dashboardRows);

    document.getElementById("meetingCount").textContent = meetings.length || "—";
    document.getElementById("raceCount").textContent = races || "—";
    const leaderCountEl = document.getElementById("leaderCount");
    if (leaderCountEl) {
        leaderCountEl.textContent = leaders || "—";
    }

    renderNextToGoCard(next, nextFour);

    renderTodayRacingTile(dashboardRows);
    renderStableChangesHomeTile();
    renderGoodLeadersHomeTile();
    renderLatestResultsHomeTile();

    renderMeetings(meetings.slice(0, 6));
}

function refreshNextToGoCard() {
    console.log("REFRESH FIRED", new Date());
    if (!allRows || !allRows.length) return;

    const todayRows = allRows.filter(isTodayRow);
    const dashboardRows = todayRows.length ? todayRows : allRows;

    const raceList = findUpcomingRaces(dashboardRows);
    const next = raceList[0] || null;
    const nextFour = raceList.slice(1, 11);

    renderNextToGoCard(next, nextFour);
}

function renderTodayRacingTile(rows) {
    const todayMeetingListEl = document.getElementById("todayMeetingList");
    const nextDaysListEl = document.getElementById("nextDaysList");
    const upcomingButton = document.getElementById("viewUpcomingFieldsButton");

    if (!todayMeetingListEl || !nextDaysListEl) return;

    const todayRows = rows.filter(isTodayRow);
    const todayMeetings = groupMeetings(todayRows.length ? todayRows : rows);

    todayMeetingListEl.innerHTML = todayMeetings.length
        ? todayMeetings.map(m => `
            <div class="today-meeting-line">
                <span class="today-meeting-name">
                    ${escapeHtml(m.venue)}
                    ${m.state ? `<span class="today-meeting-state">(${escapeHtml(m.state)})</span>` : ""}
                </span>
                <span class="today-meeting-time">${escapeHtml(m.firstTime || "TBC")}</span>
            </div>
        `).join("")
        : `<div class="today-meeting-line">No meetings found</div>`;

    const groupedDays = groupMeetingsByDay(groupMeetings(allRows))
        .filter(group => group.key !== todayIso())
        .slice(0, 4);

    nextDaysListEl.innerHTML = groupedDays.length
        ? groupedDays.map(group => {
            const meetingQty = group.meetings.length;
            const raceQty = group.meetings.reduce((sum, meeting) => sum + meeting.races.size, 0);

            const venues = group.meetings
                .map(m => `${m.venue}${m.state ? ` (${m.state})` : ""}`)
                .join(", ");

            return `
                <div class="next-day-row-rich">
                    <div class="next-day-main">
                        <span class="next-day-label">${escapeHtml(group.label)}</span>
                        <span class="next-day-venues-inline">${escapeHtml(venues)}</span>
                    </div>
                    <div class="next-day-counts">
                        <span>${meetingQty}M</span>
                        <span>${raceQty}R</span>
                    </div>
                </div>
            `;
        }).join("")
        : "";

    if (upcomingButton) {
        upcomingButton.onclick = function (e) {
            e.preventDefault();

            document.querySelectorAll(".nav-item").forEach(i => i.classList.remove("active"));
            document.querySelector('.nav-item[data-view="upcoming"]').classList.add("active");

            showUpcomingFieldsView();
        };
    }
}

function renderStableChangesHomeTile() {
    const todayEl = document.getElementById("stableChangesToday");
    const tomorrowEl = document.getElementById("stableChangesTomorrow");
    const futureEl = document.getElementById("stableChangesFuture");
    const button = document.getElementById("viewStableChangesButton");

    if (!todayEl || !tomorrowEl || !futureEl) return;

    const changes = getStableChanges(allRows);
    const today = todayIso();
    const tomorrow = addDaysIso(1);

    const todayCount = changes.filter(change => change.dateKey === today).length;
    const tomorrowCount = changes.filter(change => change.dateKey === tomorrow).length;
    const futureCount = changes.filter(change =>
        change.dateKey &&
        change.dateKey !== today &&
        change.dateKey !== tomorrow
    ).length;

    todayEl.textContent = todayCount;
    tomorrowEl.textContent = tomorrowCount;
    futureEl.textContent = futureCount;

    if (button) {
        button.onclick = function (e) {
            e.preventDefault();

            document.querySelectorAll(".nav-item").forEach(i => i.classList.remove("active"));
            document.querySelector('.nav-item[data-view="stable-changes"]').classList.add("active");

            showStableChangesView();
        };
    }
}

function renderGoodLeadersHomeTile() {
    const todayEl = document.getElementById("goodLeadersToday");
    const tomorrowEl = document.getElementById("goodLeadersTomorrow");
    const futureEl = document.getElementById("goodLeadersFuture");
    const button = document.getElementById("viewGoodLeadersButton");

    if (!todayEl || !tomorrowEl || !futureEl) return;

    const leaders = getGoodLeaders(allRows);
    const today = todayIso();
    const tomorrow = addDaysIso(1);

    const leaderCountEl = document.getElementById("leaderCount");
    if (leaderCountEl) {
        leaderCountEl.textContent = leaders.length || "—";
    }

    const todayCount = leaders.filter(item => item.dateKey === today).length;
    const tomorrowCount = leaders.filter(item => item.dateKey === tomorrow).length;
    const futureCount = leaders.filter(item =>
        item.dateKey &&
        item.dateKey !== today &&
        item.dateKey !== tomorrow
    ).length;

    todayEl.textContent = todayCount;
    tomorrowEl.textContent = tomorrowCount;
    futureEl.textContent = futureCount;

    if (button) {
        button.onclick = function (e) {
            e.preventDefault();

            document.querySelectorAll(".nav-item").forEach(i => i.classList.remove("active"));
            document.querySelector('.nav-item[data-view="good-leaders"]').classList.add("active");

            showGoodLeadersView();
        };
    }
}

function getRaceDetailsForNextToGo(race) {
    const matchingRow = allRows.find(row => {
        const venue = clean(row.Venue);
        const state = clean(row.State || row.STATE || row["State "] || "");
        const dateValue = clean(row.Date || row.DATE || row["Meeting Date"] || "");
        const raceNo = clean(row["Race No"] || row.RaceNo || row.Race || "").replace(/^R/i, "");

        return venue === race.venue &&
            state === race.state &&
            dateValue === race.dateValue &&
            raceNo === race.raceNo;
    });

    if (!matchingRow) {
        return {
            raceName: "",
            meta: ""
        };
    }

    const raceName = clean(matchingRow["Race Name"] || matchingRow.RaceName || "");
    const distance = clean(matchingRow.Distance || matchingRow.DISTANCE || "");
    const start = clean(matchingRow.Start || matchingRow.START || "");
    const gait = clean(matchingRow.Gait || matchingRow.GAIT || "");

    return {
        raceName,
        meta: [
            distance ? `${distance}m` : "",
            start,
            gait
        ].filter(Boolean).join(" • ")
    };
}

function renderNextToGoCard(next, nextFour) {
    const nextRaceEl = document.getElementById("nextRace");
    const nextTimeEl = document.getElementById("nextTime");
    const nextCountdownEl = document.getElementById("nextCountdown");
    const nextRaceNameEl = document.getElementById("nextRaceName");
    const nextRaceMetaEl = document.getElementById("nextRaceMeta");
    const nextFourListEl = document.getElementById("nextFourList");
    const viewButton = document.getElementById("viewNextRaceButton");

    if (nextRaceCountdownTimer) {
        clearTimeout(nextRaceCountdownTimer);
        nextRaceCountdownTimer = null;
    }

    if (!next) {
        nextRaceEl.textContent = "No upcoming races";
        nextTimeEl.textContent = "";
        nextCountdownEl.textContent = "";
        nextRaceNameEl.textContent = "";
        nextRaceMetaEl.textContent = "";
        nextFourListEl.innerHTML = `<div class="next-list-empty">No remaining races today</div>`;
        viewButton.onclick = e => e.preventDefault();
        return;
    }

    nextRaceEl.textContent = `${next.venue || "Venue"} R${next.raceNo}`;
    nextTimeEl.textContent = next.time || "Time TBC";

    const nextRaceDetails = getRaceDetailsForNextToGo(next);

    nextRaceNameEl.textContent = nextRaceDetails.raceName;
    nextRaceMetaEl.textContent = nextRaceDetails.meta;

    updateNextCountdown(next);

    viewButton.onclick = function (e) {
        e.preventDefault();
        openRaceFromHome(next);
    };

    nextFourListEl.innerHTML = nextFour.length
        ? nextFour.map(race => `
            <button class="next-list-item"
                onclick="openRaceFromHomeByKey('${escapeHtml(race.key)}')">
                <span class="next-list-race">${escapeHtml(shortVenueNameHomeNext10(race.venue))} R${escapeHtml(race.raceNo)}</span>
                <span class="next-list-time">${escapeHtml(race.time || "TBC")}</span>
            </button>
        `).join("")
        : `<div class="next-list-empty">No later races found</div>`;
}

function updateNextCountdown(race) {
    const el = document.getElementById("nextCountdown");
    if (!el || !race.raceDateTime) return;

    const now = new Date();
    const diffMs = race.raceDateTime.getTime() - now.getTime();

    if (diffMs <= 0) {
        el.textContent = "Jumping now";
        el.classList.add("urgent");
        return;
    }

    const totalSeconds = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    el.classList.toggle("urgent", totalSeconds <= 300);

    if (hours >= 1) {
        el.textContent = `⏱ ${hours}h ${minutes}m`;
        nextRaceCountdownTimer = setTimeout(() => updateNextCountdown(race), 60000);
    } else if (minutes >= 10) {
        el.textContent = `⏱ ${minutes}m ${seconds}s`;
        nextRaceCountdownTimer = setTimeout(() => updateNextCountdown(race), 10000);
    } else {
        el.textContent = `⏱ ${minutes}m ${pad2(seconds)}s`;
        nextRaceCountdownTimer = setTimeout(() => updateNextCountdown(race), 1000);
    }
}

function getRaceDisplayTime(row) {
    const utc = clean(row.RaceStartUTC || row["RaceStartUTC"] || row["Race Start UTC"] || "");

    if (utc) {
        const date = new Date(utc);

        if (!Number.isNaN(date.getTime())) {
            return date.toLocaleTimeString("en-AU", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true
            }).replace(" ", "");
        }
    }

    return clean(row.Time || row.TIME || row["Race Time"] || "");
}

function getRaceDateTime(row) {
    const utc = clean(row.RaceStartUTC || row["RaceStartUTC"] || row["Race Start UTC"] || "");

    if (utc) {
        const date = new Date(utc);
        if (!Number.isNaN(date.getTime())) return date;
    }

    const dateValue = clean(row.Date || row.DATE || row["Meeting Date"] || "");
    const time = clean(row.Time || row.TIME || row["Race Time"] || "");
    return buildRaceDateTime(parseDateToKey(dateValue), time);
}

function findUpcomingRaces(rows) {
    const raceMap = new Map();

    rows.forEach(row => {
        const venue = clean(row.Venue);
        const state = clean(row.State || row.STATE || row["State "] || "");
        const dateValue = clean(row.Date || row.DATE || row["Meeting Date"] || "");
        const raceNoRaw = clean(row["Race No"] || row.RaceNo || row.Race || "");
        const time = getRaceDisplayTime(row);

        if (!venue || !raceNoRaw || !time) return;

        const raceNo = raceNoRaw.replace(/^R/i, "");
        const dateKey = parseDateToKey(dateValue);
        const raceDateTime = getRaceDateTime(row);

        if (!raceDateTime) return;

        const key = `${venue}|${state}|${dateValue}|${raceNo}`;

        if (!raceMap.has(key)) {
            raceMap.set(key, {
                key,
                venue,
                state,
                dateValue,
                dateKey,
                raceNo,
                time,
                raceDateTime,
                sortTime: raceDateTime.getTime()
            });
        }
    });

    const now = new Date();

    return [...raceMap.values()]
        .filter(race => race.raceDateTime.getTime() >= now.getTime() - 2 * 60 * 1000)
        .sort((a, b) => a.sortTime - b.sortTime);
}

function findNextRace(rows) {
    return findUpcomingRaces(rows)[0] || null;
}

function buildRaceDateTime(dateKey, timeValue) {
    if (!dateKey || !timeValue) return null;

    const minutes = timeToMinutes(timeValue);
    if (minutes === null) return null;

    const date = new Date(`${dateKey}T00:00:00`);
    date.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);

    return date;
}

function openRaceFromHomeByKey(key) {
    const race = findUpcomingRaces(allRows).find(r => r.key === key);
    if (race) {
        openRaceFromHome(race);
    }
}

function openRaceFromHome(race) {
    document.querySelectorAll(".nav-item").forEach(i => i.classList.remove("active"));
    document.querySelector('.nav-item[data-view="upcoming"]').classList.add("active");

    showUpcomingFieldsView();

    setTimeout(() => {
        const meetingKey = `${race.venue}|${race.state}|${race.dateValue}`;

        document.querySelectorAll(".upcoming-meeting-button").forEach(button => {
            button.classList.toggle("selected", button.dataset.meetingKey === meetingKey);
        });

        const meetings = groupMeetings(allRows);
        const meeting = meetings.find(m =>
            m.venue === race.venue &&
            m.state === race.state &&
            m.dateValue === race.dateValue
        );

        if (meeting) {
            selectedRaceNo = race.raceNo;
            renderRaceListForMeeting(allRows, meeting);
        }

        setTimeout(() => {
            renderRaceDetail(race.venue, race.state, race.dateValue, race.raceNo);
            enterUpcomingRaceFocus();
        }, 0);
    }, 0);
}

function renderUpcomingFields(rows) {
    const today = todayIso();

    const currentRows = rows.filter(row => {
        const dateValue = clean(
            row.Date ||
            row.DATE ||
            row["Meeting Date"] ||
            ""
        );

        const dateKey = parseDateToKey(dateValue);

        return dateKey && dateKey >= today;
    });

    const meetings = groupMeetings(currentRows);
    const grouped = groupMeetingsByDay(meetings);

    if (!grouped.length) {
        document.getElementById("meetingStrip").innerHTML = `
            <div class="coming-soon-card">
                <div class="coming-soon-title">No upcoming fields found</div>
                <p>Check that upcoming_fields.csv is sitting in your Trotify dashboard folder.</p>
            </div>
        `;
        return;
    }

    const firstMeeting = grouped[0].meetings[0];
    const isMobile = window.innerWidth <= 700;

    document.getElementById("meetingStrip").innerHTML = `
        <div class="upcoming-fields-layout" id="upcomingFieldsLayout">
            <button class="fields-drawer-button" type="button" onclick="openUpcomingFieldsDrawer(event)">
                ☰ Meeting
            </button>

            <div class="fields-drawer-backdrop" onclick="closeUpcomingFieldsDrawer()"></div>

            <div class="upcoming-meetings-column">
                ${grouped.map(group => `
                    <div class="day-group">
                        <div class="day-heading">
                            <span></span>
                            <strong>${escapeHtml(group.label)}</strong>
                            <span></span>
                        </div>

                        <div class="upcoming-list">
                            ${group.meetings.map((m) => `
                                <button class="upcoming-meeting-button ${!isMobile && m === firstMeeting ? "selected" : ""}"
                                    data-meeting-key="${escapeHtml(`${m.venue}|${m.state}|${m.dateValue}`)}">
                                    <span class="meeting-main">
                                        ${escapeHtml(m.venue)}
                                        ${m.state ? `<span class="state-pill">${escapeHtml(m.state)}</span>` : ""}
                                    </span>
                                    <span class="meeting-time-pill">${escapeHtml(m.firstTime || "Time TBC")}</span>
                                </button>
                            `).join("")}
                        </div>
                    </div>
                `).join("")}
            </div>

            <div class="race-list-panel" id="raceListPanel"></div>
            <div class="race-detail-panel" id="raceDetailPanel">
                <div class="empty-detail-card">
                    <div class="coming-soon-title">Select a race</div>
                    <p>Choose a race from the middle panel to view the field.</p>
                </div>
            </div>
        </div>
    `;

    // attach meeting clicks
    document.querySelectorAll(".upcoming-meeting-button").forEach(button => {
        button.addEventListener("click", () => {
            document.querySelectorAll(".upcoming-meeting-button").forEach(b => b.classList.remove("selected"));
            button.classList.add("selected");

            const key = button.dataset.meetingKey;
            const meeting = meetings.find(m => `${m.venue}|${m.state}|${m.dateValue}` === key);

            if (meeting) {
                const isMobile = window.innerWidth <= 700;

                if (isMobile) {
                    selectedRaceNo = "1";

                    const layout = document.getElementById("upcomingFieldsLayout");
                    layout?.classList.add("mobile-meeting-selected");

                    renderRaceListForMeeting(rows, meeting);

                    renderRaceDetail(
                        meeting.venue,
                        meeting.state,
                        meeting.dateValue,
                        "1"
                    );
                } else {
                    selectedRaceNo = "1";
                    renderRaceListForMeeting(rows, meeting);
                    renderRaceDetail(meeting.venue, meeting.state, meeting.dateValue, "1");
                    enterUpcomingRaceFocus?.();
                }
            }


        });
    });

    // Desktop keeps current behaviour.
    // Mobile starts at the meeting-selection screen.
    if (!isMobile) {
        renderRaceListForMeeting(rows, firstMeeting);

        setTimeout(() => {
            if (!firstMeeting) return;
            selectedRaceNo = "1";
            renderRaceDetail(firstMeeting.venue, firstMeeting.state, firstMeeting.dateValue, "1");
            enterUpcomingRaceFocus?.();
        }, 0);
    } else {
        selectedRaceNo = null;

        document.getElementById("raceListPanel").innerHTML = "";
        document.getElementById("raceDetailPanel").innerHTML = "";
    }

}

function renderRaceListForMeeting(rows, meeting) {
    const matchingRows = rows.filter(row => {
        const venue = clean(row.Venue);
        const state = clean(row.State || row.STATE || row["State "] || "");
        const dateValue = clean(row.Date || row.DATE || row["Meeting Date"] || "");

        return venue === meeting.venue &&
               state === meeting.state &&
               dateValue === meeting.dateValue;
    });

    const raceMap = new Map();

    matchingRows.forEach(row => {
        const raceNoRaw = clean(row["Race No"] || row.RaceNo || row.Race || "");
        if (!raceNoRaw) return;

        const raceKey = raceNoRaw.replace(/^R/i, "");

        if (!raceMap.has(raceKey)) {
            raceMap.set(raceKey, {
                raceNo: raceKey,
                time: getRaceDisplayTime(row),
                distance: clean(row.Distance || row.DISTANCE || ""),
                start: clean(row.Start || row.START || ""),
                gait: clean(row.Gait || row.GAIT || ""),
                raceName: clean(row["Race Name"] || row.RaceName || ""),
                sortTime: getRaceDateTime(row)?.getTime() ?? 9999999999999,

                recordMR: clean(row.RecordMR || row["Record MR"] || ""),
                recordHorse: clean(row.RecordHorse || row["Record Horse"] || ""),
                recordDate: clean(row.RecordDate || row["Record Date"] || ""),
                recordBM: clean(row.RecordBM || row["Record BM"] || ""),

                recordLT: clean(row.RecordLT || ""),
                recordLTHorse: clean(row.RecordLTHorse || ""),
                recordLTDate: clean(row.RecordLTDate || ""),

                record1Q: clean(row.Record1Q || ""),
                record1QHorse: clean(row.Record1QHorse || ""),
                record1QDate: clean(row.Record1QDate || ""),

                record2Q: clean(row.Record2Q || ""),
                record2QHorse: clean(row.Record2QHorse || ""),
                record2QDate: clean(row.Record2QDate || ""),

                record3Q: clean(row.Record3Q || ""),
                record3QHorse: clean(row.Record3QHorse || ""),
                record3QDate: clean(row.Record3QDate || ""),

                record4Q: clean(row.Record4Q || ""),
                record4QHorse: clean(row.Record4QHorse || ""),
                record4QDate: clean(row.Record4QDate || ""),

                recordFH: clean(row.RecordFH || ""),
                recordFHHorse: clean(row.RecordFHHorse || ""),
                recordFHDate: clean(row.RecordFHDate || ""),

                recordLH: clean(row.RecordLH || ""),
                recordLHHorse: clean(row.RecordLHHorse || ""),
                recordLHDate: clean(row.RecordLHDate || ""),

                recordLM: clean(row.RecordLM || ""),
                recordLMHorse: clean(row.RecordLMHorse || ""),
                recordLMDate: clean(row.RecordLMDate || "")
            });
        }
    });

    const races = [...raceMap.values()].sort((a, b) => {
        return (a.sortTime ?? 99999) - (b.sortTime ?? 99999);
    });

    const lastRace = races[races.length - 1];

    document.getElementById("raceListPanel").innerHTML = `
        <div class="race-panel-header">
            <div>
                <div class="race-panel-eyebrow">Selected meeting</div>
                <h2>${escapeHtml(meeting.venue)} ${meeting.state ? `<span>(${escapeHtml(meeting.state)})</span>` : ""}</h2>
                <p>
                    ${escapeHtml(dayLabelFromDateKey(meeting.sortDate, meeting.dateValue))}
                    • ${races.length} races
                    ${meeting.firstTime ? `• First ${escapeHtml(meeting.firstTime)}` : ""}
                    ${lastRace?.time ? `• Last ${escapeHtml(lastRace.time)}` : ""}
                </p>
            </div>
        </div>

        <div class="race-list">
            ${races.map(race => `
                <button class="race-button ${String(race.raceNo) === String(selectedRaceNo) ? "selected" : ""}" onclick="selectRace('${escapeHtml(meeting.venue)}', '${escapeHtml(meeting.state)}', '${escapeHtml(meeting.dateValue)}', '${escapeHtml(race.raceNo)}')">
                    <div class="race-left">
                        <div class="race-number">R${escapeHtml(race.raceNo)}</div>

                        <div>
                            <div class="race-name">
                                ${race.raceName || `Race ${escapeHtml(race.raceNo)}`}
                            </div>

                            <div class="race-meta">
                                ${escapeHtml(race.time || "Time TBC")}
                                ${race.distance ? ` • ${escapeHtml(race.distance)}m` : ""}
                                ${race.start ? ` • ${escapeHtml(abbrevStart(race.start))}` : ""}
                                ${race.gait ? ` • ${escapeHtml(formatRaceGaitShort(race.gait))}` : ""}
                            </div>
                        </div>
                    </div>

                    <div class="race-arrow">›</div>
                </button>
            `).join("")}
        </div>
    `;
}

function formatRaceGaitShort(value) {
    const gait = clean(value || "").toUpperCase();

    if (gait.includes("TROT")) return "Trot";
    if (gait.includes("PACE")) return "Pace";

    return toProperCase(value);
}

function renderRecordTooltip(race) {
    return `
        <span class="record-tooltip">
            <span class="record-tooltip-title">
                Records: ${escapeHtml(race.venue)} • ${escapeHtml(race.distance)}m • ${escapeHtml(abbrevStart(race.start))} • ${escapeHtml(toTitleCase(race.gait))}
            </span>

            ${renderRecordRow("LT", race.recordLT, race.recordLTHorse, race.recordLTDate)}
            ${renderRecordRow("1Q", race.record1Q, race.record1QHorse, race.record1QDate)}
            ${renderRecordRow("2Q", race.record2Q, race.record2QHorse, race.record2QDate)}
            ${renderRecordRow("3Q", race.record3Q, race.record3QHorse, race.record3QDate)}
            ${renderRecordRow("4Q", race.record4Q, race.record4QHorse, race.record4QDate)}
            ${renderRecordRow("FH", race.recordFH, race.recordFHHorse, race.recordFHDate)}
            ${renderRecordRow("LH", race.recordLH, race.recordLHHorse, race.recordLHDate)}
            ${renderRecordRow("LM", race.recordLM, race.recordLMHorse, race.recordLMDate)}
            ${renderRecordRow("MR", race.recordMR, race.recordMRHorse, race.recordMRDate)}
        </span>
    `;
}

function resetUpcomingFieldsMobile() {
    if (window.innerWidth > 700) return;

    selectedRaceNo = null;

    const layout = document.getElementById("upcomingFieldsLayout");
    if (!layout) return;

    layout.classList.remove("mobile-meeting-selected");
    layout.classList.remove("race-focus");

    document
        .querySelectorAll(".upcoming-meeting-button")
        .forEach(button => button.classList.remove("selected"));

    const raceListPanel = document.getElementById("raceListPanel");
    const raceDetailPanel = document.getElementById("raceDetailPanel");

    if (raceListPanel) raceListPanel.innerHTML = "";
    if (raceDetailPanel) raceDetailPanel.innerHTML = "";
}

function abbrevStart(start) {
    const value = clean(start || "").toLowerCase();

    if (value.includes("mobile")) return "MS";
    if (value.includes("stand")) return "SS";

    return clean(start || "");
}

function toTitleCase(text) {
    return clean(text || "")
        .toLowerCase()
        .replace(/\b\w/g, c => c.toUpperCase());
}

function renderRecordRow(label, value, horse, date) {
    if (!value) return "";

    return `
        <span class="record-tooltip-row ${["LT", "4Q", "LH", "LM"].includes(label) ? "record-heavy-line" : ""}">
            <span class="record-label">${escapeHtml(label)}</span>
            <span class="record-value">${escapeHtml(formatRecordTime(value))}</span>
            <span class="record-horse">${escapeHtml(toProperCase(horse || ""))}</span>
            <span class="record-date">${escapeHtml(date || "")}</span>
        </span>
    `;
}

function formatRecordTime(value) {
    const raw = clean(value);
    const num = parseFloat(raw);

    if (isNaN(num)) return raw;
    if (num < 60) return num.toFixed(1);

    const mins = Math.floor(num / 60);
    const secs = num - (mins * 60);

    return `${mins}:${secs.toFixed(1).padStart(4, "0")}`;
}

function getStandMetresFromBarrier(barrier) {
    const text = clean(barrier || "").toUpperCase();

    // Old format: 10m, 20m, 30m etc
    let match = text.match(/^(\d+)\s*M\b/);

    if (match) {
        return match[1];
    }

    // New HRA format: 10 Fr1, 20 Fr1, 30 Fr1 etc
    match = text.match(/^(\d+)\s+FR\d+\b/);

    if (match) {
        return match[1];
    }

    return "";
}

function renderMobileVenueStats(row) {

    function statLine(label, prefix) {
        const starts = formatWholeNumber(row[`${prefix} Sts`] || "");
        const wins = formatWholeNumber(row[`${prefix} W`] || "");
        const places = formatWholeNumber(row[`${prefix} P`] || "");
        const roi = formatVenueStatRoi(row[`${prefix} ROI %`] || "");

        if (!starts && !wins && !places && !roi) {
            return "";
        }

        return `
            <div class="mobile-runner-venue-stat">
                <span class="mobile-runner-venue-label">
                    ${escapeHtml(label)}
                </span>

                <span class="mobile-runner-venue-record">
                    ${escapeHtml(starts || "0")}:
                    ${escapeHtml(wins || "0")}-${escapeHtml(places || "0")}
                </span>

                <span class="mobile-runner-venue-roi">
                    ${escapeHtml(roi)}
                </span>
            </div>
        `;
    }

    const rows = [
        statLine("Horse", "Venue Horse"),
        statLine("Trainer", "Venue Trainer"),
        statLine("Driver", "Venue Driver")
    ].filter(Boolean);

    if (!rows.length) return "";

    return `
        <div class="mobile-runner-venue-stats">
            <div class="mobile-runner-detail-heading">
                VENUE STATS
            </div>

            ${rows.join("")}
        </div>
    `;
}

function toggleMobileRunnerDetail(el) {
    if (window.innerWidth > 700) return;

    const row = el.closest(".runner-row");
    if (!row) return;

    const wasOpen =
        row.classList.contains("mobile-runner-expanded");

    // Close every runner first
    document
        .querySelectorAll(".runner-row.mobile-runner-expanded")
        .forEach(otherRow => {
            otherRow.classList.remove("mobile-runner-expanded");
        });

    // Re-open tapped runner unless it was already open
    if (!wasOpen) {
        row.classList.add("mobile-runner-expanded");
    }
}

function truncateMobileName(value, maxLength = 18) {
    const text = clean(value || "");

    if (text.length <= maxLength) {
        return text;
    }

    return text.slice(0, maxLength - 1).trimEnd() + "…";
}

function renderRaceDetail(venue, state, dateValue, raceNo) {
    const raceRows = allRows.filter(row => {
        const rowVenue = clean(row.Venue);
        const rowState = clean(row.State || row.STATE || row["State "] || "");
        const rowDate = clean(row.Date || row.DATE || row["Meeting Date"] || "");
        const rowRaceNo = clean(row["Race No"] || row.RaceNo || row.Race || "").replace(/^R/i, "");

        return rowVenue === venue &&
            rowState === state &&
            rowDate === dateValue &&
            rowRaceNo === raceNo;
    });

    const meetingRaceNav = buildRaceNumberNav(venue, state, dateValue, raceNo);
    const raceAnchorFull = getRaceAnchorForUpcomingRace(venue, state, dateValue, raceNo);
    const hraAvailable = hraAnalysisRows.some(
        r => r.RaceAnchorFull === raceAnchorFull
    );

    const raceMedia = getRaceMedia(raceAnchorFull);

    const latestResultRace = getLatestResultByRaceAnchor(raceAnchorFull);

    if (!raceRows.length) {
        document.getElementById("raceDetailPanel").innerHTML = `
            <div class="coming-soon-card">
                <div class="coming-soon-title">Race not found</div>
                <p>No runners were found for this race.</p>
            </div>
        `;
        return;
    }

    const first = raceRows[0];

    const time = getRaceDisplayTime(first);
    const raceName = clean(first["Race Name"] || first.RaceName || "");
    const distance = clean(first.Distance || first.DISTANCE || "");
    const start = clean(first.Start || first.START || "");
    const gait = clean(first.Gait || first.GAIT || "");

    const first100Race = findFirst100Race(venue, state, dateValue, raceNo);
    const showFirst100 = runnerDisplayMode === "first100" && first100Race;

    const bmParts = [
        clean(first["BM LT"]),
        clean(first["BM Q1"]),
        clean(first["BM Q2"]),
        clean(first["BM Q3"]),
        clean(first["BM Q4"])
    ].filter(Boolean);

    const bmSample = clean(first["VenDistGaitStart Sample"] || first["VenDist Sample"] || first["Sample"] || "");
    const bmLabel = bmSample ? `BM (${bmSample})` : "BM";

    const sortedRows = [...raceRows].sort((a, b) => {
        return Number(clean(a["Horse No"] || a.HorseNo || a.Tab || 999)) -
               Number(clean(b["Horse No"] || b.HorseNo || b.Tab || 999));
    });

    let secondRowDividerShown = false;

    console.log("Race lookup:", raceAnchorFull);
    console.log("HRA sample:", hraAnalysisRows.slice(0,5));

    document.getElementById("raceDetailPanel").innerHTML = `
        <div class="race-detail" onclick="closeSizePopupAndRender('${escapeHtml(venue)}', '${escapeHtml(state)}', '${escapeHtml(dateValue)}', '${escapeHtml(raceNo)}')">
            <div class="race-title-actions">

                <h3>
                    ${escapeHtml(time)} • Race ${escapeHtml(raceNo)}${raceName ? ` • ${escapeHtml(raceName)}` : ""}
                </h3>

                ${meetingRaceNav}

                ${hraAvailable
                    ? (
                        window.innerWidth <= 700
                            ? `
                                <button
                                    type="button"
                                    class="field-result-button"
                                    onclick="event.stopPropagation(); openHraAnalysisPopup('${escapeHtml(raceAnchorFull)}')">
                                    HRA Analysis
                                </button>
                            `
                            : renderHraAnalysisHover(raceAnchorFull)
                      )
                    : ""
                }

                ${raceMedia.map(media => `
                    <button class="field-result-button"
                        onclick="event.stopPropagation(); openRaceMedia('${escapeHtml(media.MediaID)}')">
                        🎧 ${escapeHtml(media.Title)}
                    </button>
                `).join("")}

                ${latestResultRace ? `
                    <button class="field-result-button"
                        onclick="event.stopPropagation(); openLatestResultFromField('${escapeHtml(raceAnchorFull)}')">
                        Results
                    </button>
                ` : ""}

            </div>


                <div class="race-meta-line">
                    ${window.innerWidth <= 700 ? `
                        <div class="race-meta-main mobile-race-summary">
                            ${venue ? `${escapeHtml(venue)} • ` : ""}
                            ${distance ? `${escapeHtml(distance)}m` : ""}
                            ${start ? ` • ${escapeHtml(start)}` : ""}
                            ${gait ? ` • ${escapeHtml(gait)}` : ""}

                            ${renderRaceSummaryTooltip(first)}
                        </div>
                    ` : `
                        <div class="race-meta-main">
                            ${distance ? `${escapeHtml(distance)}m` : ""}
                            ${start ? ` • ${escapeHtml(start)}` : ""}
                            ${gait ? ` • ${escapeHtml(gait)}` : ""}
                        </div>
                    `}

                    ${bmParts.length ? `
                        <div class="race-meta-bm">
                            ${escapeHtml(bmLabel)}: ${bmParts.map(escapeHtml).join(" | ")}
                        </div>
                    ` : ""}

                    <div class="race-meta-record">
                        ${renderRaceRecordInline(first)}
                    </div>
                </div>

                <div class="venue-stat-toggle">

                    ${window.innerWidth > 700 ? `
                        <span>Venue Stats</span>

                        ${["off", "horse", "trainer", "driver"].map(mode => `
                            <button class="${selectedVenueStatMode === mode ? "selected" : ""}"
                                onclick="setVenueStatMode('${mode}', '${escapeHtml(venue)}', '${escapeHtml(state)}', '${escapeHtml(dateValue)}', '${escapeHtml(raceNo)}')">
                                ${mode === "off"
                                    ? "Off"
                                    : mode.charAt(0).toUpperCase() + mode.slice(1)}
                            </button>
                        `).join("")}
                    ` : ""}

                    ${window.innerWidth > 700 ? `
                        <span class="race-summary-hover">
                            <button type="button">Bell</button>
                            ${renderRaceSummaryTooltip(first)}
                        </span>
                    ` : ""}

                    ${window.innerWidth > 700 ? `
                        <span class="fieldsize-click" onclick="event.stopPropagation()">
                            <button type="button" onclick="openSizePopup(event, '${escapeHtml(venue)}', '${escapeHtml(state)}', '${escapeHtml(dateValue)}', '${escapeHtml(raceNo)}')">
                                Size
                            </button>

                            ${sizePopupOpen ? renderFieldSizeTooltip(first, sortedRows, venue, state, dateValue, raceNo) : ""}
                        </span>
                    ` : ""}

                    <span class="toggle-divider"></span>

                    <button class="${runnerDisplayMode === "trials" ? "selected" : ""}"
                        onclick="setRunnerDisplayMode('trials', '${escapeHtml(venue)}', '${escapeHtml(state)}', '${escapeHtml(dateValue)}', '${escapeHtml(raceNo)}')">
                        Trials
                    </button>

                    <button class="${runnerDisplayMode === "map" ? "selected" : ""}"
                        onclick="setRunnerDisplayMode('map', '${escapeHtml(venue)}', '${escapeHtml(state)}', '${escapeHtml(dateValue)}', '${escapeHtml(raceNo)}')">
                        Map
                    </button>

                    ${first100Race ? `
                        <button class="${runnerDisplayMode === "first100" ? "selected" : ""}"
                            onclick="setRunnerDisplayMode('first100', '${escapeHtml(venue)}', '${escapeHtml(state)}', '${escapeHtml(dateValue)}', '${escapeHtml(raceNo)}')">
                            First100
                        </button>
                    ` : ""}

                    <span class="toggle-divider"></span>

                    <span class="race-roi-hover">
                        <button type="button">ROI+</button>
                        ${renderRaceRoiTooltip(sortedRows)}
                    </span>

            </div>

            ${showFirst100 ? renderFirst100RacePanel(first100Race) : ""}

            <div class="runner-list ${showFirst100 ? "first100-hide-runners" : ""}">

                ${sortedRows.map((row, index) => {
                    const horseNo = formatWholeNumber(row["Horse No"] || row.HorseNo || row.Tab || "");
                    const horse = clean(row.Horse || row.HORSE || "");
                    const barrier = clean(row.Barrier || row.BARRIER || "");
                    const trainer = clean(row.Trainer || row.TRAINER || "");
                    const driver = clean(row.Driver || row.DRIVER || "");
                    const fairOdds = formatNearestOdds(row["Fair Odds"] || row.FairOdds || row["FairOdds"] || "");
                    const leadPct = parseNumber(row["Ld %"] || row["Ld%"] || row["Lead %"] || "");
                    const behindLeadPct = parseNumber(row["BL %"] || row["BL%"] || row["Behind Lead %"] || "");
                    const deathPct = parseNumber(row["Dth %"] || row["Dth%"] || row["Death %"] || "");

                    const barrierUpper = barrier.toUpperCase();
                    const isScratched = barrierUpper.startsWith("SCR") || barrierUpper.includes("SCRATCH");


                    let dividerLabel = "";

                    const showSecondRowDivider =
                        start.toLowerCase() === "mobile" &&
                        !isScratched &&
                        barrierUpper.includes("SR") &&
                        !secondRowDividerShown;

                    if (showSecondRowDivider) {
                        dividerLabel = "SECOND ROW";
                        secondRowDividerShown = true;
                    }

                    if (start.toLowerCase().includes("stand") && !isScratched) {
                        const currentMetres = getStandMetresFromBarrier(barrier);

                        const prevRow = sortedRows[index - 1];
                        const prevBarrier = prevRow ? clean(prevRow.Barrier || prevRow.BARRIER || "") : "";
                        const prevBarrierUpper = prevBarrier.toUpperCase();
                        const prevIsScratched = prevBarrierUpper.startsWith("SCR") || prevBarrierUpper.includes("SCRATCH");
                        const prevMetres = prevIsScratched ? "" : getStandMetresFromBarrier(prevBarrier);

                        if (currentMetres && currentMetres !== prevMetres) {
                            dividerLabel = `${currentMetres} METRES`;
                        }
                    }

                    const fadeScratchedOnly = false;


                    const fullComment = buildRunnerComment(row, raceRows);

                    const previewComment = fullComment;

                    const runnerInfoHtml = isScratched
                        ? ""
                        : runnerDisplayMode === "trials"
                            ? renderRunnerTrialsInline(row)
                            : runnerDisplayMode === "map"
                                ? renderRunnerSpeedMapInline(row)
                                : renderRunnerCommentInline(fullComment, previewComment);

                    return `
                        ${dividerLabel ? `
                            <div class="second-row-divider">
                                <span></span>
                                <strong>${escapeHtml(dividerLabel)}</strong>
                                <span></span>
                            </div>
                        ` : ""}

                        <div
                            class="runner-row ${isScratched ? "scratched" : ""} ${fadeScratchedOnly ? "scratched-no-line" : ""}"
                        >

                            <div
                                class="runner-number saddlecloth-${escapeHtml(horseNo)} mobile-runner-toggle"
                                onclick="event.stopPropagation(); toggleMobileRunnerDetail(this)"
                            >
                                ${escapeHtml(horseNo)}
                            </div>


                            <!-- DESKTOP RUNNER -->
                            <div class="runner-desktop-content">

                                <div class="runner-main ${fadeScratchedOnly ? "scratched-fade-extra" : ""}">
                                    <div class="runner-left">

                                        <div class="runner-horse horse-hover">
                                            ${escapeHtml(horse)}
                                            ${renderPositionStatsTooltip(row)}
                                        </div>

                                        <div class="runner-meta">
                                            ${barrier ? `
                                                <span class="barrier-hover">
                                                    ${escapeHtml(barrier)}
                                                    ${renderBarrierStatsTooltip(row, first)}
                                                </span>
                                            ` : ""}

                                            ${trainer ? `
                                                • <span class="stat-hover">
                                                    ${escapeHtml(trainer)}
                                                    ${renderPersonStatsTooltip(row, "trainer")}
                                                </span>
                                            ` : ""}

                                            ${driver ? `
                                                • <span class="stat-hover">
                                                    ${escapeHtml(driver)}
                                                    ${renderPersonStatsTooltip(row, "driver")}
                                                </span>
                                            ` : ""}
                                        </div>
                                    </div>

                                    ${runnerInfoHtml}
                                </div>

                                <div class="runner-side">
                                    ${!isScratched && selectedVenueStatMode !== "off"
                                        ? renderVenueStatBlock(row)
                                        : ""}

                                    ${!isScratched
                                        ? renderTrafficLights(leadPct, behindLeadPct, deathPct)
                                        : ""}

                                    ${fairOdds && !isScratched
                                        ? `<div class="runner-odds">${escapeHtml(fairOdds)}</div>`
                                        : ""}
                                </div>

                            </div>


                            <!-- MOBILE RUNNER -->
                            <div class="runner-mobile-content">

                                ${runnerDisplayMode === "trials" && !isScratched ? `

                                    ${renderRunnerTrialsMobile(row)}

                                ` : runnerDisplayMode === "map" ? `

                                    ${renderRunnerSpeedMapMobile(row)}

                                ` : `

                                    <div class="runner-mobile-top">

                                        <span class="runner-mobile-horse horse-hover">
                                            ${escapeHtml(horse)}
                                            ${renderPositionStatsTooltip(row)}
                                        </span>

                                        ${!isScratched ? `
                                            <span class="runner-mobile-traffic">
                                                ${renderTrafficLights(
                                                    leadPct,
                                                    behindLeadPct,
                                                    deathPct
                                                )}
                                            </span>
                                        ` : ""}

                                    </div>

                                    <div class="runner-mobile-bottom">

                                        <span class="runner-mobile-people">

                                            ${barrier ? `
                                                <span class="barrier-hover">
                                                    ${escapeHtml(barrier)}
                                                    ${renderBarrierStatsTooltip(row, first)}
                                                </span>
                                            ` : ""}

                                            ${trainer ? `
                                                <span class="runner-mobile-trainer">
                                                    • <span class="stat-hover">
                                                        ${escapeHtml(truncateMobileName(trainer, 12))}
                                                        ${renderPersonStatsTooltip(row, "trainer")}
                                                    </span>
                                                </span>
                                            ` : ""}

                                            ${driver ? `
                                                <span class="runner-mobile-driver">
                                                    • <span class="stat-hover">
                                                        ${escapeHtml(truncateMobileName(driver, 12))}
                                                        ${renderPersonStatsTooltip(row, "driver")}
                                                    </span>
                                                </span>
                                            ` : ""}

                                        </span>

                                        ${fairOdds && !isScratched ? `
                                            <span class="runner-mobile-price">
                                                ${escapeHtml(fairOdds)}
                                            </span>
                                        ` : ""}

                                    </div>

                                    ${!isScratched ? `
                                        <div class="mobile-runner-detail">

                                            ${fullComment ? `
                                                <div class="mobile-runner-comment">
                                                    ${escapeHtml(fullComment)}
                                                </div>
                                            ` : ""}

                                            ${renderMobileVenueStats(row)}

                                        </div>
                                    ` : ""}

                                `}

                            </div>



                        </div>
                    `;
                }).join("")}
                            </div>
                        </div>
                    `;
                }

function buildRaceNumberNav(venue, state, dateValue, activeRaceNo) {
    const raceMap = new Map();

    allRows.forEach(row => {
        const rowVenue = clean(row.Venue);
        const rowState = clean(row.State || row.STATE || row["State "] || "");
        const rowDate = clean(row.Date || row.DATE || row["Meeting Date"] || "");
        const rowRaceNo = clean(row["Race No"] || row.RaceNo || row.Race || "").replace(/^R/i, "");

        if (
            rowVenue !== venue ||
            rowState !== state ||
            rowDate !== dateValue ||
            !rowRaceNo
        ) {
            return;
        }

        if (!raceMap.has(rowRaceNo)) {
            raceMap.set(rowRaceNo, {
                raceNo: rowRaceNo,
                time: getRaceDisplayTime(row),
                raceName: clean(row["Race Name"] || row.RaceName || ""),
                sortTime: getRaceDateTime(row)?.getTime() ?? 9999999999999
            });
        }
    });

    const races = [...raceMap.values()].sort((a, b) => a.sortTime - b.sortTime);

    if (races.length <= 1) return "";

    return `
        <div class="race-number-nav">
            ${races.map(race => {
                const isActive = String(race.raceNo) === String(activeRaceNo);

                return `
                    <button
                        type="button"
                        class="race-number-nav-button ${isActive ? "active" : ""}"
                        title="${escapeHtml(race.time || "")}${race.raceName ? ` • ${escapeHtml(race.raceName)}` : ""}"
                        ${isActive ? "disabled" : ""}
                        onclick="event.stopPropagation(); selectRace('${escapeHtml(venue)}', '${escapeHtml(state)}', '${escapeHtml(dateValue)}', '${escapeHtml(race.raceNo)}')">
                        ${escapeHtml(race.raceNo)}
                    </button>
                `;
            }).join("")}
        </div>
    `;
}

function renderRaceSummaryTooltip(row) {
    const titleParts = [
        clean(row.Venue || ""),
        clean(row.Distance || "") ? `${clean(row.Distance)}m` : "",
        abbrevStart(row.Start || ""),
        toTitleCase(row.Gait || "")
    ].filter(Boolean);

    const sections = [
        { title: "VDSG", prefix: "VDSG" },
        { title: "Venue", prefix: "Venue" },
        { title: "All", prefix: "All" }
    ];

    return `
        <div class="race-summary-tooltip">
            <div class="race-summary-title">${escapeHtml(titleParts.join(" • "))}</div>

            <div class="race-summary-table">
                <div class="race-summary-head">
                    <span></span>
                    <span>Sts</span>
                    <span>W%</span>
                    <span>P%</span>
                    <span>ROI</span>
                    <span>Δ</span>
                </div>

                ${sections.map(section => `
                    <div class="race-summary-section-title">${escapeHtml(section.title)}</div>
                    ${renderRaceSummaryRow(row, section.prefix, "Lead", "Lead")}
                    ${renderRaceSummaryRow(row, section.prefix, "BL", "B/L")}
                    ${renderRaceSummaryRow(row, section.prefix, "Dth", "Dth")}
                `).join("")}
            </div>
        </div>
    `;
}

function renderFieldSizeTooltip(row, raceRows, venue, state, dateValue, raceNo) {
    const titleParts = [
        clean(row.Venue || ""),
        clean(row.Distance || "") ? `${clean(row.Distance)}m` : "",
        clean(row.Start || ""),
        toTitleCase(row.Gait || "")
    ].filter(Boolean);

    const currentFieldSize = raceRows.filter(r => {
        const barrier = clean(r.Barrier || r.BARRIER || "").toUpperCase();
        const horseNo = parseNumber(r["Horse No"] || "");

        return !barrier.startsWith("SCR") && horseNo <= 12;
    }).length;

    const stats = getFieldSizeStatsForRace(row, selectedSizePosition);
    const globalRoi = stats.globalRow ? parseNumber(stats.globalRow.ROI) : null;

    return `
        <div class="fieldsize-tooltip">
            <div class="fieldsize-title">${escapeHtml(titleParts.join(" • "))}</div>

            <div class="fieldsize-position-toggle">
                ${[
                    { key: "LEAD", label: "Lead" },
                    { key: "B/LEAD", label: "B/Lead" },
                    { key: "DEATH", label: "Death" }
                ].map(item => `
                    <button type="button"
                        class="${selectedSizePosition === item.key ? "selected" : ""}"
                        onclick="event.stopPropagation(); setSizePosition('${item.key}', '${escapeHtml(venue)}', '${escapeHtml(state)}', '${escapeHtml(dateValue)}', '${escapeHtml(raceNo)}')">${item.label}</button>
                `).join("")}
            </div>

            <div class="fieldsize-table">
                <div class="fieldsize-head">
                    <span>Field Size</span>
                    <span>Sts</span>
                    <span>W</span>
                    <span>SR</span>
                    <span>ROI</span>
                    <span>Edge</span>
                </div>

                ${stats.fieldRows.length ? stats.fieldRows.map(item => renderFieldSizeRow(item, currentFieldSize, globalRoi)).join("") : `
                    <div class="fieldsize-empty">No matching size stats found.</div>
                `}

                ${stats.vdsgRow ? renderFieldSizeBenchmarkRow("VDSG", stats.vdsgRow, stats.globalRow) : ""}
                ${stats.venueRow ? renderFieldSizeBenchmarkRow("Venue", stats.venueRow, stats.globalRow) : ""}
                ${stats.globalRow ? renderFieldSizeBenchmarkRow("Global", stats.globalRow, null) : ""}
            </div>
        </div>
    `;
}

function getFieldSizeStatsForRace(row, position) {
    const venue = normaliseSizeKey(row.Venue || "");
    const distance = parseNumber(row.Distance || "");
    const start = normaliseSizeKey(row.Start || "");
    const gait = normaliseSizeKey(row.Gait || "");

    const fieldRows = (fieldSizeStatsRows || [])
        .filter(item => {
            return clean(item.StatLevel || "") === "FieldSize" &&
                normaliseSizeKey(item.Venue || "") === venue &&
                parseNumber(item.Distance || "") === distance &&
                normaliseSizeKey(item.Start || "") === start &&
                normaliseSizeKey(item.Gait || "") === gait &&
                clean(item.Position || "").toUpperCase() === position;
        })
        .sort((a, b) => parseNumber(a.FieldSize) - parseNumber(b.FieldSize));

    const vdsgRow = (fieldSizeStatsRows || []).find(item => {
        return clean(item.StatLevel || "") === "VDSG" &&
            normaliseSizeKey(item.Venue || "") === venue &&
            parseNumber(item.Distance || "") === distance &&
            normaliseSizeKey(item.Start || "") === start &&
            normaliseSizeKey(item.Gait || "") === gait &&
            clean(item.Position || "").toUpperCase() === position;
    });

    const venueRow = (fieldSizeStatsRows || []).find(item => {
        return clean(item.StatLevel || "") === "Venue" &&
            normaliseSizeKey(item.Venue || "") === venue &&
            clean(item.Position || "").toUpperCase() === position;
    });

    const globalRow = (fieldSizeStatsRows || []).find(item => {
        return clean(item.StatLevel || "") === "Global" &&
            clean(item.Position || "").toUpperCase() === position;
    });

    return {
        fieldRows,
        vdsgRow,
        venueRow,
        globalRow
    };
}


function renderFieldSizeRow(item, currentFieldSize, globalRoi) {
    const fs = parseNumber(item.FieldSize);
    const sts = parseNumber(item.Sts);
    const wins = parseNumber(item.W);
    const sr = parseNumber(item.SR);
    const roi = parseNumber(item.ROI);

    const isCurrent = fs === currentFieldSize;
    const edgeBadge = renderFieldSizeEdgeBadge(roi, globalRoi, sts);

    return `
        <div class="fieldsize-row ${isCurrent ? "current" : ""}">
            <span>${escapeHtml(formatWholeNumber(fs))}</span>
            <span>${escapeHtml(formatWholeNumber(sts))}</span>
            <span>${escapeHtml(formatWholeNumber(wins))}</span>
            <span>${escapeHtml(formatWholeNumber(sr))}%</span>
            <span class="${roiClass(roi)}">${escapeHtml(formatSignedWhole(roi))}%</span>
            <span>${edgeBadge}</span>
        </div>
    `;
}

function renderFieldSizeBenchmarkRow(label, item, globalRow) {
    const sts = parseNumber(item.Sts);
    const wins = parseNumber(item.W);
    const sr = parseNumber(item.SR);
    const roi = parseNumber(item.ROI);

    const globalRoi = globalRow
        ? parseNumber(globalRow.ROI)
        : null;

    const edgeBadge = renderFieldSizeEdgeBadge(
        roi,
        globalRoi,
        sts
    );

    return `
        <div class="fieldsize-row benchmark">
            <span>${escapeHtml(label)}</span>
            <span>${escapeHtml(formatWholeNumber(sts))}</span>
            <span>${escapeHtml(formatWholeNumber(wins))}</span>
            <span>${escapeHtml(formatWholeNumber(sr))}%</span>
            <span class="${roiClass(roi)}">${escapeHtml(formatSignedWhole(roi))}%</span>
            <span>${edgeBadge}</span>
        </div>
    `;
}

function renderFieldSizeEdgeBadge(roi, globalRoi, sts) {
    if (!Number.isFinite(roi) || !Number.isFinite(globalRoi)) return "";
    if (!Number.isFinite(sts) || sts < 10) return "";

    const edge = roi - globalRoi;

    if (edge >= 15) {
        return `<span class="fieldsize-edge edge-strong">★★★</span>`;
    }

    if (edge >= 8) {
        return `<span class="fieldsize-edge edge-good">★★</span>`;
    }

    if (edge >= 3) {
        return `<span class="fieldsize-edge edge-slight">★</span>`;
    }

    return "";
}

function setSizePosition(position, venue, state, dateValue, raceNo) {
    selectedSizePosition = position;
    sizePopupOpen = true;
    renderRaceDetail(venue, state, dateValue, raceNo);
}

function openSizePopup(event, venue, state, dateValue, raceNo) {
    event.stopPropagation();

    selectedSizePosition = "LEAD";
    sizePopupOpen = true;

    renderRaceDetail(venue, state, dateValue, raceNo);
}

function closeSizePopupAndRender(venue, state, dateValue, raceNo) {

    // Nothing to close = don't rebuild the whole race
    if (!sizePopupOpen) return;

    sizePopupOpen = false;
    renderRaceDetail(venue, state, dateValue, raceNo);
}

function normaliseSizeKey(value) {
    return clean(value)
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();
}

function renderRaceSummaryRow(row, prefix, key, label) {
    const starts = parseNumber(row[`${prefix} ${key} All`]);
    const wins = parseNumber(row[`${prefix} ${key} W`]);
    const places = parseNumber(row[`${prefix} ${key} P`]);
    const roi = parseNumber(row[`${prefix} ${key} ROI %`]);

    const allRoi = parseNumber(row[`All ${key} ROI %`]);

    const winPct = starts > 0 ? (wins / starts) * 100 : NaN;
    const placePct = starts > 0 ? ((wins + places) / starts) * 100 : NaN;

    const diff = !Number.isNaN(roi) && !Number.isNaN(allRoi)
        ? Math.round(roi - allRoi)
        : NaN;

    const diffToShow = prefix === "All" ? NaN : diff;

    return `
        <div class="race-summary-row">
            <span>${escapeHtml(label)}</span>
            <span>${escapeHtml(formatCompactStarts(starts))}</span>
            <span>${escapeHtml(formatWholeNumber(winPct))}</span>
            <span>${escapeHtml(formatWholeNumber(placePct))}</span>
            <span class="${roiClass(roi)}">${escapeHtml(formatSignedWhole(roi))}</span>
            <span>${formatSummaryDiff(diffToShow)}</span>
        </div>
    `;
}

function formatCompactStarts(value) {
    const n = parseNumber(value);
    if (Number.isNaN(n)) return "";

    if (n >= 1000) {
        const k = n / 1000;
        return `${k.toFixed(k >= 10 ? 0 : 1)}k`;
    }

    return formatWholeNumber(n);
}

function formatSignedWhole(value) {
    const n = parseNumber(value);
    if (Number.isNaN(n)) return "";

    const rounded = Math.round(n);
    return `${rounded > 0 ? "+" : ""}${rounded}`;
}

function formatSummaryDiff(value) {
    if (Number.isNaN(value)) return "";

    const cls = value > 0
        ? "summary-diff-positive"
        : value < 0
            ? "summary-diff-negative"
            : "summary-diff-neutral";

    const arrow = value > 0 ? "▲" : value < 0 ? "▼" : "";
    const text = value > 0 ? `+${value}` : `${value}`;

    return `<span class="summary-diff ${cls}">${escapeHtml(text)}${arrow ? `<em>${arrow}</em>` : ""}</span>`;
}

function setVenueStatMode(mode, venue, state, dateValue, raceNo) {
    selectedVenueStatMode = mode;
    renderRaceDetail(venue, state, dateValue, raceNo);
}

function setRunnerDisplayMode(mode, venue, state, dateValue, raceNo) {
    if (runnerDisplayMode === mode) {
        runnerDisplayMode = "comments";
    } else {
        runnerDisplayMode = mode;
    }

    renderRaceDetail(venue, state, dateValue, raceNo);
}

function renderVenueStatBlock(row) {
    if (selectedVenueStatMode === "off") {
        return "";
    }

    let prefix = "Venue Horse";

    if (selectedVenueStatMode === "trainer") {
        prefix = "Venue Trainer";
    } else if (selectedVenueStatMode === "driver") {
        prefix = "Venue Driver";
    }

    const starts = formatWholeNumber(row[`${prefix} Sts`] || "");
    const wins = formatWholeNumber(row[`${prefix} W`] || "");
    const places = formatWholeNumber(row[`${prefix} P`] || "");
    const roi = formatVenueStatRoi(row[`${prefix} ROI %`] || "");

    if (!starts && !wins && !places && !roi) return "";

    return `
        <div class="venue-stat-block">
            ${escapeHtml(starts || "0")}: ${escapeHtml(wins || "0")}-${escapeHtml(places || "0")}
            <span>|</span>
            ${escapeHtml(roi)}
        </div>
    `;
}

function renderRaceRecordInline(row) {
    const recordMR = clean(row["relevant winner Mile Rate"] || row.RecordMR || row["Record MR"] || row["MR Record"] || "");
    const recordHorse = clean(row["relevant winner Mile Rate Horse"] || row.RecordHorse || row["Record Horse"] || row["MR Horse"] || "");
    const recordDate = clean(row["relevant winner Mile Rate Date"] || row.RecordDate || row["Record Date"] || row["MR Date"] || "");

    if (!recordMR) return "";

    function formatMileRate(seconds) {
        const total = parseFloat(seconds);
        if (isNaN(total)) return seconds;

        const mins = Math.floor(total / 60);
        const secs = total - (mins * 60);

        return `${mins}:${secs.toFixed(1).padStart(4, "0")}`;
    }

    function toProperCase(text) {
        return text.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
    }

    return `
        <span class="race-meta-divider">|</span>
        <span class="record-hover">
            Race rec: ${escapeHtml(formatMileRate(recordMR))} ${escapeHtml(toProperCase(recordHorse))} (${escapeHtml(recordDate)})
            ${renderRecordTooltip({
                venue: clean(row.Venue || row.VENUE || ""),
                distance: clean(row.Distance || row.DISTANCE || ""),
                start: clean(row.Start || row.START || ""),
                gait: clean(row.Gait || row.GAIT || ""),
                recordBM: clean(row.RecordBM || row["Record BM"] || ""),

                recordLT: clean(row["relevant leader Lead Time"] || ""),
                recordLTHorse: clean(row["relevant leader Lead Time Horse"] || ""),
                recordLTDate: clean(row["relevant leader Lead Time Date"] || ""),

                record1Q: clean(row["relevant leader First Quarter"] || ""),
                record1QHorse: clean(row["relevant leader First Quarter Horse"] || ""),
                record1QDate: clean(row["relevant leader First Quarter Date"] || ""),

                record2Q: clean(row["relevant leader Second Quarter"] || ""),
                record2QHorse: clean(row["relevant leader Second Quarter Horse"] || ""),
                record2QDate: clean(row["relevant leader Second Quarter Date"] || ""),

                record3Q: clean(row["relevant winner Third Quarter"] || ""),
                record3QHorse: clean(row["relevant winner Third Quarter Horse"] || ""),
                record3QDate: clean(row["relevant winner Third Quarter Date"] || ""),

                record4Q: clean(row["relevant winner Fourth Quarter"] || ""),
                record4QHorse: clean(row["relevant winner Fourth Quarter Horse"] || ""),
                record4QDate: clean(row["relevant winner Fourth Quarter Date"] || ""),

                recordFH: clean(row["relevant leader First Half"] || ""),
                recordFHHorse: clean(row["relevant leader First Half Horse"] || ""),
                recordFHDate: clean(row["relevant leader First Half Date"] || ""),

                recordLH: clean(row["relevant winner Last Half"] || ""),
                recordLHHorse: clean(row["relevant winner Last Half Horse"] || ""),
                recordLHDate: clean(row["relevant winner Last Half Date"] || ""),

                recordLM: clean(row["relevant winner Last Mile"] || ""),
                recordLMHorse: clean(row["relevant winner Last Mile Horse"] || ""),
                recordLMDate: clean(row["relevant winner Last Mile Date"] || ""),

                recordMR: clean(row["relevant winner Mile Rate"] || ""),
                recordMRHorse: clean(row["relevant winner Mile Rate Horse"] || ""),
                recordMRDate: clean(row["relevant winner Mile Rate Date"] || "")
            })}
        </span>
    `;}



function formatVenueStatRoi(value) {
    const num = parseNumber(value);
    if (Number.isNaN(num)) return "";

    const rounded = Math.round(num);
    return `${rounded > 0 ? "+" : ""}${rounded}%`;
}

function renderPersonStatsTooltip(row, type) {
    const prefix = type === "trainer" ? "Tr" : "Dr";

    const personName = type === "trainer"
        ? clean(row.Trainer || row.TRAINER || "")
        : clean(row.Driver || row.DRIVER || "");

    const title = type === "trainer"
        ? `Trainer: ${personName}`
        : `Driver: ${personName}`;


    const rows = [
        personTooltipRow("Month", row[`${prefix} 30 Sts`], row[`${prefix} 30 Win`], row[`${prefix} 30 Pla`], row[`${prefix} 30 Win %`], row[`${prefix} 30 Pla %`], row[`${prefix} 30 ROI %`]),
        personTooltipRow("Quarter", row[`${prefix} 90 Sts`], row[`${prefix} 90 Win`], row[`${prefix} 90 Pla`], row[`${prefix} 90 Win %`], row[`${prefix} 90 Pla %`], row[`${prefix} 90 ROI %`]),
        personTooltipRow("Half Year", row[`${prefix} 180 Sts`], row[`${prefix} 180 Win`], row[`${prefix} 180 Pla`], row[`${prefix} 180 Win %`], row[`${prefix} 180 Pla %`], row[`${prefix} 180 ROI %`]),
        personTooltipRow("Year", row[`${prefix} 365 Sts`], row[`${prefix} 365 Win`], row[`${prefix} 365 Pla`], row[`${prefix} 365 Win %`], row[`${prefix} 365 Pla %`], row[`${prefix} 365 ROI %`]),
        personTooltipRow("All", row[`${prefix} All Sts`], row[`${prefix} All Win`], row[`${prefix} All Pla`], row[`${prefix} All Win %`], row[`${prefix} All Pla %`], row[`${prefix} All ROI %`]),
        personTooltipRow("100s", row[`${prefix} L/100 Sts`], row[`${prefix} L/100 Win`], row[`${prefix} L/100 Pla`], row[`${prefix} L/100 Win %`], row[`${prefix} L/100 Pla %`], row[`${prefix} L/100 ROI %`])
    ].join("");

    return `
        <div class="person-stats-tooltip">

            <div class="barrier-tooltip-title">
                ${escapeHtml(title)}
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Last</th>
                        <th>Sts</th>
                        <th>W</th>
                        <th>P</th>
                        <th>W%</th>
                        <th>P%</th>
                        <th>ROI%</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        </div>
    `;
}

function personTooltipRow(label, sts, wins, places, winPct, plaPct, roiPct) {
    const rowClass = label === "All" ? "barrier-total-row" : "";

    return `
        <tr class="${rowClass}">
            <td>${escapeHtml(label)}</td>
            <td>${formatWholeNumber(sts)}</td>
            <td>${formatWholeNumber(wins)}</td>
            <td>${formatWholeNumber(places)}</td>
            <td>${formatPercent0(winPct)}</td>
            <td>${formatPercent0(plaPct)}</td>
            <td class="${roiClass(roiPct)}">${formatPercent0(roiPct)}</td>
        </tr>
    `;
}

function renderRunnerCommentInline(fullComment, previewComment) {
    if (!fullComment) return "";

    return `
        <div class="runner-comment-hover runner-comment-inline" onmouseenter="toggleCommentTooltip(this)">
            <div class="runner-comment">
                ${escapeHtml(previewComment)}
            </div>
            <div class="runner-comment-tooltip">
                ${escapeHtml(fullComment)}
            </div>
        </div>
    `;
}

function toggleCommentTooltip(el) {
    const comment = el.querySelector(".runner-comment");

    if (!comment) return;

    const isTruncated =
        comment.scrollHeight > comment.clientHeight ||
        comment.scrollWidth > comment.clientWidth;

    el.classList.toggle("comment-is-truncated", isTruncated);
}

function renderRunnerTrialsInline(row) {
    const trialRunner = findTrialRunnerForRow(row);

    if (!trialRunner || !hasAnyTrialForRunner(trialRunner)) {
        return `
            <div class="runner-trials-inline">
                <div class="runner-trials-empty">No trials found</div>
            </div>
        `;
    }

    const lines = [1, 2, 3]
        .map(n => buildRunnerTrialLineHtml(trialRunner, n))
        .filter(Boolean);

    if (!lines.length) {
        return `
            <div class="runner-trials-inline">
                <div class="runner-trials-empty">No trials found</div>
            </div>
        `;
    }

    return `
        <div class="runner-trials-inline">
            ${lines.join("")}
        </div>
    `;
}

function renderRunnerTrialsMobile(row) {
    const trialRunner = findTrialRunnerForRow(row);

    if (!trialRunner || !hasAnyTrialForRunner(trialRunner)) {
        return `
            <div class="mobile-trials-list">
                <div class="mobile-trial-empty">
                    No trials found
                </div>
            </div>
        `;
    }

    const lines = [1, 2, 3]
        .map(n => buildMobileTrialLineHtml(trialRunner, n))
        .filter(Boolean);

    if (!lines.length) {
        return `
            <div class="mobile-trials-list">
                <div class="mobile-trial-empty">
                    No trials found
                </div>
            </div>
        `;
    }

    return `
        <div class="mobile-trials-list">
            ${lines.join("")}
        </div>
    `;
}

function buildMobileTrialLineHtml(runner, n) {
    const p = `T${n}`;

    const venue = clean(runner[`${p} Venue`] || "");
    const date = clean(runner[`${p} Date`] || "");
    const posRaw = clean(runner[`${p} Pos`] || "");
    const runnersRaw = clean(runner[`${p} Runners`] || "");
    const mgnRaw = clean(runner[`${p} Mgn`] || "");
    const distRaw = clean(runner[`${p} Dist`] || "");
    const rateRaw = clean(runner[`${p} Rate`] || "");
    const halfRaw = clean(runner[`${p} Half`] || "");
    const vision = clean(runner[`${p} Vision`] || "");
    const sinceRaw = clean(runner[`${p} SinceLR`] || "");

    if (!venue && !date && !posRaw) {
        return "";
    }

    const pos = formatTrialOrdinal(posRaw);
    const runners = cleanIntish(runnersRaw);

    const venueText =
        venue ? venue.substring(0, 4).toUpperCase() : "";

    const dateText = formatTrialDate(date);

    const distText =
        distRaw
            ? `${cleanIntish(distRaw).replace(/m$/i, "")}m`
            : "";

    const rateText = formatTrialRate(rateRaw);

    const halfText =
        halfRaw
            ? formatOneDecimal(halfRaw)
            : "";

    let marginText = "";

    const marginNumber = Number(mgnRaw);

    if (
        mgnRaw &&
        Number.isFinite(marginNumber) &&
        marginNumber > 0
    ) {
        marginText = ` (${Math.round(marginNumber)}m)`;
    }

    const placingText =
        `${pos}${runners ? `/${runners}` : ""}${marginText}`;

    const mainText = [
        placingText,
        venueText,
        dateText
    ]
        .filter(Boolean)
        .join(" ");

    const timingText = [
        distText,
        [rateText, halfText]
            .filter(Boolean)
            .join(", ")
    ]
        .filter(Boolean)
        .join(" · ");

    const sinceVal = Number(sinceRaw);

    const isPostRaceTrial =
        Number.isFinite(sinceVal) &&
        sinceVal > 0;

    const freshBadge = isPostRaceTrial
        ? `
            <span style="
                display:inline-block;
                margin-right:3px;
                padding:1px 3px;
                border-radius:3px;
                background:#63ffb0;
                color:#04140d;
                font-size:6px;
                line-height:1;
                font-weight:900;
                vertical-align:middle;
            ">
                SINCE RACE
            </span>
        `
        : "";

    const visionClean = vision.toUpperCase();

    const hasVision =
        vision &&
        visionClean !== "_NOVISION";

    const textHtml = `
        <span style="
            color:rgba(255,255,255,0.78);
            font-size:8.5px;
            line-height:1.1;
            font-weight:700;
            white-space:nowrap;
        ">
            ${freshBadge}
            ${escapeHtml(mainText)}
            ${timingText
                ? ` · ${escapeHtml(timingText)}`
                : ""
            }
        </span>
    `;

    if (hasVision) {
        return `
            <a
                href="${escapeHtml(vision)}"
                target="_blank"
                rel="noopener noreferrer"
                onclick="event.stopPropagation()"
                style="
                    display:block;
                    width:100%;
                    padding:1px 0;
                    color:rgba(255,255,255,0.78);
                    text-decoration:none;
                    font-size:8.5px;
                    line-height:1.1;
                    white-space:nowrap;
                    overflow:hidden;
                    text-overflow:ellipsis;
                "
            >
                <span style="
                    color:#74ff8f;
                    font-size:8.5px;
                    margin-right:3px;
                ">▶</span>
                ${textHtml}
            </a>
        `;
    }

    return `
        <div
            style="
                display:block;
                width:100%;
                padding:1px 0;
                color:rgba(255,255,255,0.78);
                font-size:8.5px;
                line-height:1.1;
                white-space:nowrap;
                overflow:hidden;
                text-overflow:ellipsis;
            "
        >
            ${textHtml}
        </div>
    `;
}


function buildTrialRunnerMap(payload) {
    const map = new Map();

    if (!payload || !Array.isArray(payload.meetings)) {
        return map;
    }

    for (const meeting of payload.meetings) {
        for (const race of (meeting.races || [])) {
            for (const runner of (race.runners || [])) {
                const horse = normaliseTrialText(runner.Horse || "");
                if (!horse) continue;

                const raceAnchorFull = normaliseTrialText(runner.RaceAnchorFull || runner["RaceAnchorFull"] || "");

                // RaceAnchorFull is race-level, so include horse as well
                if (raceAnchorFull) {
                    map.set(`ANCHOR|${raceAnchorFull}|${horse}`, runner);
                }

                const venue = normaliseTrialText(runner.Venue || race.venue || meeting.venue || "");
                const state = normaliseTrialText(runner.State || meeting.state || "");
                const date = normaliseDateKey(runner.Date || race.date || meeting.date || "");
                const raceNo = cleanRaceNumber(runner["Race No"] || race.raceNo || "");

                if (venue && state && date && raceNo) {
                    map.set(`RACE|${horse}|${venue}|${state}|${date}|${raceNo}`, runner);
                }
            }
        }
    }

    return map;
}

function findTrialRunnerForRow(row) {

    // If upcoming_fields.csv already contains trial data,
    // use that row directly.
    if (hasAnyTrialForRunner(row)) {
        return row;
    }

    // Otherwise fall back to trials.json
    if (!trialRunnerMap || !trialRunnerMap.size) {
        return null;
    }

    const rowHorse = normaliseTrialText(
        row.Horse ||
        row.HORSE ||
        ""
    );

    const rowRaceAnchorFull = normaliseTrialText(
        row.RaceAnchorFull ||
        row["RaceAnchorFull"] ||
        row["Race Anchor Full"] ||
        ""
    );

    if (rowRaceAnchorFull && rowHorse) {
        const anchorMatch = trialRunnerMap.get(
            `ANCHOR|${rowRaceAnchorFull}|${rowHorse}`
        );

        if (anchorMatch) {
            return anchorMatch;
        }
    }

    const rowVenue = normaliseTrialText(
        row.Venue || ""
    );

    const rowState = normaliseTrialText(
        row.State ||
        row.STATE ||
        row["State "] ||
        ""
    );

    const rowDate = normaliseDateKey(
        row.Date ||
        row.DATE ||
        row["Meeting Date"] ||
        ""
    );

    const rowRaceNo = cleanRaceNumber(
        row["Race No"] ||
        row.RaceNo ||
        row.Race ||
        ""
    );

    return trialRunnerMap.get(
        `RACE|${rowHorse}|${rowVenue}|${rowState}|${rowDate}|${rowRaceNo}`
    ) || null;
}

function renderRunnerSpeedMapInline(row) {
    const barrier = clean(row.Barrier || row.BARRIER || "").toUpperCase();

    if (
        barrier.includes("SR") ||
        barrier.includes("SCR")
    ) {
        return "";
    }
    const leadPct = parsePercentValue(row["Ld %"] || row["Lead %"] || row["Lead%"] || row["LD %"]);
    const blPct = parsePercentValue(row["BL %"] || row["B/L %"] || row["Behind Leader %"] || row["BehindLeader %"]);
    const deathPct = parsePercentValue(row["Dth %"] || row["Death %"] || row["Death%"] || row["DTH %"]);

    const leadWidth = speedMapPercentToPosition(leadPct);
    const blLeft = speedMapPercentToPosition(blPct);
    const deathLeft = speedMapPercentToPosition(deathPct);

    const hasAny =
        leadPct > 0 ||
        blPct > 0 ||
        deathPct > 0;

    if (!hasAny) {
        return `
            <div class="runner-speed-map-inline">
                <div class="speed-map-empty">No map data</div>
            </div>
        `;
    }

    return `
        <div class="runner-speed-map-inline">
            <div class="speed-map-track">
                <div class="speed-map-lead-fill" style="width: ${leadWidth}%;"></div>

                ${blPct > 0 ? `
                    <div class="speed-map-dot speed-map-dot-bl" style="left: ${blLeft}%;" title="Behind leader: ${blPct.toFixed(0)}%"></div>
                ` : ""}

                ${deathPct > 0 ? `
                    <div class="speed-map-dot speed-map-dot-death" style="left: ${deathLeft}%;" title="Death seat: ${deathPct.toFixed(0)}%"></div>
                ` : ""}

            </div>

        </div>
    `;
}

function renderRunnerSpeedMapMobile(row) {
    const barrier = clean(
        row.Barrier ||
        row.BARRIER ||
        ""
    ).toUpperCase();

    if (
        barrier.includes("SR") ||
        barrier.includes("SCR")
    ) {
        return "";
    }

    const leadPct = parsePercentValue(
        row["Ld %"] ||
        row["Lead %"] ||
        row["Lead%"] ||
        row["LD %"]
    );

    const blPct = parsePercentValue(
        row["BL %"] ||
        row["B/L %"] ||
        row["Behind Leader %"] ||
        row["BehindLeader %"]
    );

    const deathPct = parsePercentValue(
        row["Dth %"] ||
        row["Death %"] ||
        row["Death%"] ||
        row["DTH %"]
    );

    const leadWidth = speedMapPercentToPosition(leadPct);
    const blLeft = speedMapPercentToPosition(blPct);
    const deathLeft = speedMapPercentToPosition(deathPct);

    const hasAny =
        leadPct > 0 ||
        blPct > 0 ||
        deathPct > 0;

    if (!hasAny) {
        return `
            <div style="
                color:rgba(255,255,255,0.38);
                font-size:9px;
                font-style:italic;
                padding:8px 0;
            ">
                No map data
            </div>
        `;
    }

    return `
        <div
            onclick="event.stopPropagation(); openMobileSpeedMapPopup(this)"
            data-horse="${escapeHtml(clean(row.Horse || row.HORSE || ""))}"

            data-lead="${leadPct}"
            data-lead-sts="${safeNum(parseNumber(row["Bell Pos Lead"] || row["Lead Sts"] || ""))}"
            data-lead-w="${safeNum(parseNumber(row["Ld Win"] || ""))}"
            data-lead-p="${safeNum(parseNumber(row["Ld Pla"] || ""))}"

            data-bl="${blPct}"
            data-bl-sts="${safeNum(parseNumber(row["Bell Pos BL"] || row["B/Lead Sts"] || row["BL Sts"] || ""))}"
            data-bl-w="${safeNum(parseNumber(row["BL Win"] || ""))}"
            data-bl-p="${safeNum(parseNumber(row["BL Pla"] || ""))}"

            data-death="${deathPct}"
            data-death-sts="${safeNum(parseNumber(row["Bell Pos Dth"] || row["Death Sts"] || row["Dth Sts"] || ""))}"
            data-death-w="${safeNum(parseNumber(row["Dth Win"] || ""))}"
            data-death-p="${safeNum(parseNumber(row["Dth Pla"] || ""))}"
            style="
                width:100%;
                min-width:0;
                padding:12px 0;
                cursor:pointer;
                touch-action:manipulation;
            "
        >
            <div style="
                position:relative;
                width:100%;
                height:8px;
                border-radius:999px;
                background:rgba(255,255,255,0.14);
                overflow:visible;
            ">

                <div style="
                    width:${leadWidth}%;
                    height:100%;
                    border-radius:999px;
                    background:rgba(120,190,90,0.95);
                "></div>

                ${blPct > 0 ? `
                    <div style="
                        position:absolute;
                        left:${blLeft}%;
                        top:50%;
                        width:2px;
                        height:16px;
                        transform:translate(-50%,-50%);
                        background:#d8b14a;
                    "></div>
                ` : ""}

                ${deathPct > 0 ? `
                    <div style="
                        position:absolute;
                        left:${deathLeft}%;
                        top:50%;
                        width:2px;
                        height:16px;
                        transform:translate(-50%,-50%);
                        background:#c9605a;
                    "></div>
                ` : ""}

            </div>
        </div>
    `;
}

function openMobileSpeedMapPopup(el) {
    if (window.innerWidth > 700) return;

    document
        .querySelector(".mobile-speed-map-popup")
        ?.remove();

    const horse = el.dataset.horse || "Speed Map";

    const leadPct = Number(el.dataset.lead || 0);
    const leadSts = Number(el.dataset.leadSts || 0);
    const leadW = Number(el.dataset.leadW || 0);
    const leadP = Number(el.dataset.leadP || 0);

    const blPct = Number(el.dataset.bl || 0);
    const blSts = Number(el.dataset.blSts || 0);
    const blW = Number(el.dataset.blW || 0);
    const blP = Number(el.dataset.blP || 0);

    const deathPct = Number(el.dataset.death || 0);
    const deathSts = Number(el.dataset.deathSts || 0);
    const deathW = Number(el.dataset.deathW || 0);
    const deathP = Number(el.dataset.deathP || 0);

    const popup = document.createElement("div");

    popup.className = "mobile-speed-map-popup";

    popup.innerHTML = `
        <div style="
            color:#00e6bf;
            font-size:14px;
            font-weight:950;
            text-align:center;
            margin-bottom:10px;
            text-transform:uppercase;
        ">
            ${escapeHtml(horse)}
        </div>

        <div style="
            border-top:1px solid rgba(255,255,255,0.12);
            margin-bottom:4px;
        "></div>

        <div style="
            display:grid;
            grid-template-columns:14px 1fr 70px 42px;
            gap:8px;
            align-items:center;
            padding:7px 0;
            font-size:12px;
            color:#f4f7fb;
        ">
            <span style="
                width:9px;
                height:9px;
                border-radius:50%;
                background:#78be5a;
            "></span>

            <span>Lead</span>

            <strong style="text-align:center;">
                ${leadSts}: ${leadW}-${leadP}
            </strong>

            <strong style="text-align:right;">
                ${leadPct.toFixed(0)}%
            </strong>
        </div>

        <div style="
            display:grid;
            grid-template-columns:14px 1fr 70px 42px;
            gap:8px;
            align-items:center;
            padding:7px 0;
            font-size:12px;
            color:#f4f7fb;
        ">
            <span style="
                width:9px;
                height:9px;
                border-radius:50%;
                background:#d8b14a;
            "></span>

            <span>Behind leader</span>

            <strong style="text-align:center;">
                ${blSts}: ${blW}-${blP}
            </strong>

            <strong style="text-align:right;">
                ${blPct.toFixed(0)}%
            </strong>
        </div>

        <div style="
            display:grid;
            grid-template-columns:14px 1fr 70px 42px;
            gap:8px;
            align-items:center;
            padding:7px 0;
            font-size:12px;
            color:#f4f7fb;
        ">
            <span style="
                width:9px;
                height:9px;
                border-radius:50%;
                background:#c9605a;
            "></span>

            <span>Death seat</span>

            <strong style="text-align:center;">
                ${deathSts}: ${deathW}-${deathP}
            </strong>

            <strong style="text-align:right;">
                ${deathPct.toFixed(0)}%
            </strong>
        </div>
    `;

    popup.style.setProperty("position", "fixed", "important");
    popup.style.setProperty("left", "36px", "important");
    popup.style.setProperty("right", "36px", "important");
    popup.style.setProperty("top", "50%", "important");

    popup.style.setProperty(
        "transform",
        "translateY(-50%)",
        "important"
    );

    popup.style.setProperty("z-index", "9999999", "important");

    popup.style.setProperty(
        "background",
        "#0b1721",
        "important"
    );

    popup.style.setProperty(
        "border",
        "1px solid rgba(0,230,191,0.5)",
        "important"
    );

    popup.style.setProperty(
        "border-radius",
        "14px",
        "important"
    );

    popup.style.setProperty(
        "padding",
        "14px 16px",
        "important"
    );

    popup.style.setProperty(
        "box-shadow",
        "0 18px 45px rgba(0,0,0,0.75)",
        "important"
    );

    document.body.appendChild(popup);
}

document.addEventListener("click", function (e) {
    if (window.innerWidth > 700) return;

    if (e.target.closest(".mobile-speed-map-popup")) {
        return;
    }

    document
        .querySelector(".mobile-speed-map-popup")
        ?.remove();
});

function parsePercentValue(value) {
    const raw = clean(value || "").replace("%", "");
    const n = Number(raw);

    if (!Number.isFinite(n)) return 0;

    return Math.max(0, n);
}

function speedMapPercentToPosition(value) {
    const capped = Math.min(Math.max(value, 0), 50);
    return (capped / 50) * 100;
}

function hasAnyTrialForRunner(runner) {
    return [1, 2, 3].some(n => {
        return clean(runner[`T${n} Venue`] || "") ||
               clean(runner[`T${n} Date`] || "") ||
               clean(runner[`T${n} URL`] || "");
    });
}

function buildRunnerTrialLineHtml(runner, n) {
    const p = `T${n}`;

    const venue = clean(runner[`${p} Venue`] || "");
    const date = clean(runner[`${p} Date`] || "");
    const posRaw = clean(runner[`${p} Pos`] || "");
    const runnersRaw = clean(runner[`${p} Runners`] || "");
    const distRaw = clean(runner[`${p} Dist`] || "");
    const mgnRaw = clean(runner[`${p} Mgn`] || "");
    const winner = clean(runner[`${p} Winner`] || "");
    const start = clean(runner[`${p} Start`] || "");
    const rateRaw = clean(runner[`${p} Rate`] || "");
    const halfRaw = clean(runner[`${p} Half`] || "");
    const trialNoRaw = clean(runner[`${p} Trial No`] || "");
    const url = clean(runner[`${p} URL`] || "");
    const vision = clean(runner[`${p} Vision`] || "");
    const sinceRaw = clean(runner[`${p} SinceLR`] || "");
    const trialTrainer = clean(runner[`${p} Trainer`] || "");
    const trialDriver = clean(runner[`${p} Driver`] || "");

    if (!venue && !date && !posRaw && !url) return "";

    const pos = formatTrialOrdinal(posRaw);
    const runners = cleanIntish(runnersRaw);

    const posText = pos || "";
    const runnersText = runners ? `(of ${runners})` : "";

    const venueText = venue ? venue.substring(0, 4).toUpperCase() : "";
    const dateText = formatTrialDate(date);
    const trialNo = cleanIntish(trialNoRaw);
    const trialLabel = trialNo ? `(Trial ${trialNo})` : "";

    const distText = distRaw ? `${cleanIntish(distRaw).replace(/m$/i, "")}m` : "";
    const startText = start.toLowerCase().includes("stand")
        ? "SS"
        : start.toLowerCase().includes("mobile")
            ? "MS"
            : "";

    const distStartText = [distText, startText].filter(Boolean).join(" ");

    const rateText = formatTrialRate(rateRaw);
    const halfText = halfRaw ? escapeHtml(formatOneDecimal(halfRaw)) : "";

    const isWin = pos === "1st";
    const sinceVal = Number(sinceRaw);
    const isPostRaceTrial = Number.isFinite(sinceVal) && sinceVal > 0;

    const detailParts = [];

    if (trialTrainer || trialDriver) {
        detailParts.push(`(${[trialTrainer, trialDriver].filter(Boolean).join(" / ")})`);
    }

    if (mgnRaw) detailParts.push(`btn ${mgnFmtTrial(mgnRaw)}`);
    if (winner && !isWin) detailParts.push(`wnr ${winner.toUpperCase()}`);
    if (rateText) detailParts.push(rateText);
    if (halfText) detailParts.push(halfText);

    const mainParts = [posText, runnersText, venueText, dateText].filter(Boolean);
    const extraParts = [trialLabel, distStartText].filter(Boolean);

    const visionClean = vision.toUpperCase();
    const visionHtml =
        vision && visionClean !== "_NOVISION"
            ? `<a class="runner-trial-play" href="${escapeHtml(vision)}" target="_blank" rel="noopener noreferrer" title="Watch vision">▶</a>`
            : "";

    const freshBadge = isPostRaceTrial
        ? `<span class="trial-fresh-badge">SINCE RACE</span>`
        : "";

    const lineInner = `
        ${freshBadge}
        <span class="runner-trial-main">
            ${escapeHtml(mainParts.join("  "))}
        </span>
        ${extraParts.length ? `<span class="runner-trial-extra">${escapeHtml(extraParts.join("  "))}</span>` : ""}
        ${detailParts.length ? `<span class="runner-trial-detail">, ${escapeHtml(detailParts.join(", "))}</span>` : ""}
        ${visionHtml}
    `;

    if (url) {
        return `
            <div class="runner-trial-line ${isPostRaceTrial ? "post-race-trial" : ""}">
                ${visionHtml}
                <a class="runner-trial-link" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">
                    ${lineInner.replace(visionHtml, "")}
                </a>
            </div>
        `;
    }

    return `
        <div class="runner-trial-line ${isPostRaceTrial ? "post-race-trial" : ""}">
            ${visionHtml}
            <span class="runner-trial-link">
                ${lineInner.replace(visionHtml, "")}
            </span>
        </div>
    `;
}

function normaliseTrialText(value) {
    return clean(value || "")
        .toUpperCase()
        .replace(/\s+/g, " ")
        .trim();
}

function cleanRaceNumber(value) {
    return clean(value || "")
        .replace(/^R/i, "")
        .replace(/\.0$/, "")
        .trim();
}

function normaliseDateKey(value) {
    const text = clean(value || "");
    if (!text) return "";

    const isoMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoMatch) return text;

    const slashMatch = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (slashMatch) {
        const dd = slashMatch[1].padStart(2, "0");
        const mm = slashMatch[2].padStart(2, "0");
        const yyyy = slashMatch[3];
        return `${yyyy}-${mm}-${dd}`;
    }

    return text;
}

function formatTrialOrdinal(value) {
    const raw = clean(value || "");
    const n = parseInt(raw.split(".")[0], 10);

    if (!Number.isFinite(n)) return raw;

    if (n % 100 >= 11 && n % 100 <= 13) return `${n}th`;

    if (n % 10 === 1) return `${n}st`;
    if (n % 10 === 2) return `${n}nd`;
    if (n % 10 === 3) return `${n}rd`;

    return `${n}th`;
}

function formatTrialDate(value) {
    const text = clean(value || "");
    const parts = text.split("/");

    if (parts.length === 3) {
        const dd = parts[0].padStart(2, "0");
        const mm = parts[1].padStart(2, "0");
        const yy = parts[2].slice(-2);

        const months = {
            "01": "Jan",
            "02": "Feb",
            "03": "Mar",
            "04": "Apr",
            "05": "May",
            "06": "Jun",
            "07": "Jul",
            "08": "Aug",
            "09": "Sep",
            "10": "Oct",
            "11": "Nov",
            "12": "Dec"
        };

        return `${dd}${months[mm] || mm}${yy}`;
    }

    return text;
}

function formatTrialRate(value) {
    const raw = clean(value || "");
    const n = Number(raw);

    if (!Number.isFinite(n) || n <= 0) return raw;

    const mins = Math.floor(n / 60);
    const secs = n - mins * 60;

    return `${mins}:${secs.toFixed(1).padStart(4, "0")}`;
}

function formatOneDecimal(value) {
    const n = Number(clean(value || ""));
    if (!Number.isFinite(n)) return clean(value || "");
    return n.toFixed(1);
}

function cleanIntish(value) {
    return clean(value || "").replace(/\.0$/, "");
}

function mgnFmtTrial(value) {
    const raw = clean(value || "");
    const n = Number(raw);

    if (!Number.isFinite(n)) return raw;

    return `${cleanIntish(raw)}m`;
}

function pluraliseWins(value) {
    return Number(value) === 1 ? "win" : "wins";
}

function buildRunnerComment(row, raceRows) {
    const parts = [];

    const horseNo = formatWholeNumber(row["Horse No"] || row.HorseNo || row.Tab || "");
    const horse = clean(row.Horse || "");
    const barrier = clean(row.Barrier || "").toUpperCase();
    const trainer = clean(row.Trainer || "");
    const driver = clean(row.Driver || "");

    const manual = clean(row.Comment || "");
    if (manual) return manual;

    // #1 Stablemate comment
    if (trainer) {
        const stablemateNos = raceRows
            .filter(r => {
                const otherTrainer = clean(r.Trainer || r.TRAINER || "");
                const otherHorseNo = formatWholeNumber(r["Horse No"] || r.HorseNo || r.Tab || "");
                const otherBarrier = clean(r.Barrier || r.BARRIER || "").toUpperCase();

                return normaliseName(otherTrainer) === normaliseName(trainer) &&
                    otherHorseNo &&
                    otherHorseNo !== horseNo &&
                    otherBarrier !== "SCR";
            })
            .map(r => formatWholeNumber(r["Horse No"] || r.HorseNo || r.Tab || ""))
            .filter(Boolean);

        if (stablemateNos.length) {
            parts.push(`Stablemate of ${sentenceJoinNoOxford(stablemateNos)}.`);
        }
    }

    const leadPct = parseNumber(row["Ld %"]);
    const deathPct = parseNumber(row["Dth %"]);
    const fairOdds = parseNumber(row["Fair Odds"]);

    const lrTrainer = clean(row["LR Trainer"] || "");
    const lrDriver = clean(row["LR Driver"] || "");

    if (lrTrainer && trainer && normaliseName(lrTrainer) !== normaliseName(trainer)) {
        parts.push(seededPick([
            `Trainer change from ${lrTrainer}.`,
            `Switched stables from ${lrTrainer}.`,
            `First run for new stable after leaving ${lrTrainer}.`,
            `Changed barns from ${lrTrainer}.`,
            `Now with ${trainer} after previously being with ${lrTrainer}.`
        ], `${horse}|${row.Venue}|${row.Date}|${row["Race No"]}|trainer-change`));
    }

    if (lrDriver && driver && normaliseName(lrDriver) !== normaliseName(driver)) {
        parts.push(seededPick([
            `Driver change from ${lrDriver}.`,
            `New driver on after ${lrDriver} last time.`,
            `Driver switch from ${lrDriver}.`,
            `Changes reinsperson from ${lrDriver}.`,
            `Different driver after ${lrDriver} last start.`
        ], `${horse}|${row.Venue}|${row.Date}|${row["Race No"]}|driver-change`));
    }

    if (barrier.startsWith("FR") && leadPct > 15) {
        const goForwardComments = [
            "Go forward horse.",
            "Can go forward.",
            "Likely to press forward early.",
            "Expected to settle prominently.",
            "Has the speed to be in the firing line.",
            "Should be prominent in the early stages."
        ];

        const commentKey = [
            horse,
            row.Venue,
            row.Date,
            row["Race No"]
        ].map(normaliseName).join("|");

        const commentIndex = commentKey.length % goForwardComments.length;

        parts.push(goForwardComments[commentIndex]);
    }

    if (!barrier.includes("FR1") && deathPct >= 20) {
        parts.push("Comfortable working outside the leader.");
    } else if (!barrier.includes("FR1") && deathPct >= 15) {
        parts.push("Can death seat if required.");
    }


    // #3 Latest run comment
    const lrPlacing = clean(row["LR Placing"] || "");
    const lrVenue = clean(row["LR Venue"] || "");
    const lrBarrier = clean(row["LR Br"] || "");
    const lrDistance = clean(row["LR Dist"] || "");
    const lrMargin = formatLatestRunMargin(row["LR Mgn"]);
    const lrWinner = clean(row["LR Winner"] || "");
    const lrDate = formatShortRaceDate(row["LR Date"]);
    const lrSp = formatLatestRunSp(row["LR SP"]);
    const lrPos = clean(row["LR Pos"] || "");

    if (lrPlacing && lrVenue) {
        const latestKey = [
            horse,
            row.Venue,
            row.Date,
            row["Race No"],
            "latest-run"
        ].map(normaliseName).join("|");

        const intro = seededPick([
            "Latest run",
            "Last time out",
            "At latest engagement",
            "Most recently",
            "Last start"
        ], latestKey);

        const posPhrase = latestRunPositionPhrase(lrPos, latestKey);

        const bits = [];

        const placingNum = parseInt(lrPlacing, 10);

        if (placingNum === 1) {
            const winPhrases = [
                "won at",
                "scored at",
                "was successful at",
                "saluted at",
                "took out"
            ];

            const winPhrase = seededPick(winPhrases, latestKey);

            bits.push(
                `${intro} ${winPhrase}${lrVenue ? ` ${lrVenue}` : ""}`
            );
        } else {
            bits.push(
                `${intro} ${toOrdinal(lrPlacing)}${lrVenue ? ` at ${lrVenue}` : ""}`
            );
        }

        if (lrBarrier) bits.push(`(${lrBarrier.toUpperCase()})`);
        if (lrDistance) bits.push(`over ${formatWholeNumber(lrDistance)}m`);
        if (placingNum === 1) {
            if (lrMargin) bits.push(`by ${lrMargin}`);
        } else {
            if (lrMargin) bits.push(`beaten ${lrMargin}`);
        }
        if (placingNum !== 1 && lrWinner) {
            bits.push(`by ${toProperCase(lrWinner)}`);
        }
        if (lrDate) bits.push(`on ${lrDate}`);
        if (lrSp) bits.push(`at ${lrSp}`);
        if (posPhrase) bits.push(`when ${posPhrase}`);

        parts.push(`${bits.join(" ")}.`);
    }

    // #4 Positive trainer/driver recent ROI
    const recentRoiComments = buildPositiveRecentRoiComments(row, horse);

    recentRoiComments.forEach(comment => {
        parts.push(comment);
    });


    // #5 Positive trainer/driver venue ROI
    const trainerWins = parseNumber(row["Venue Trainer W"]);
    const trainerStarts = parseNumber(row["Venue Trainer Sts"]);
    const trainerRoi = parseNumber(row["Venue Trainer ROI %"]);

    if (
        trainerWins >= 5 &&
        !Number.isNaN(trainerRoi) &&
        trainerRoi > 0
    ) {
        const trainerRecord =
            `${formatWholeNumber(trainerWins)} ${pluraliseWins(trainerWins)} from ${formatWholeNumber(trainerStarts)} @ +${Math.round(trainerRoi)}% ROI`;

        parts.push(seededPick([
            `Trainer has positive venue ROI (${trainerRecord}).`,
            `Trainer has performed profitably here (${trainerRecord}).`,
            `Stable has returned a positive venue ROI (${trainerRecord}).`,
            `Trainer boasts profitable venue figures (${trainerRecord}).`,
            `Stable has a positive return at this track (${trainerRecord}).`
        ], `${horse}|${trainer}|${row.Venue}|trainer-venue-roi`));
    }

    const driverWins = parseNumber(row["Venue Driver W"]);
    const driverStarts = parseNumber(row["Venue Driver Sts"]);
    const driverRoi = parseNumber(row["Venue Driver ROI %"]);

    if (
        driverWins >= 5 &&
        !Number.isNaN(driverRoi) &&
        driverRoi > 0
    ) {
        const driverRecord =
            `${formatWholeNumber(driverWins)} ${pluraliseWins(driverWins)} from ${formatWholeNumber(driverStarts)} @ +${Math.round(driverRoi)}% ROI`;

        parts.push(seededPick([
            `Driver has positive venue ROI (${driverRecord}).`,
            `Driver has performed profitably here (${driverRecord}).`,
            `Reinsperson has a positive venue return (${driverRecord}).`,
            `Driver boasts profitable venue figures (${driverRecord}).`,
            `Driver has generated a positive return at this track (${driverRecord}).`
        ], `${horse}|${driver}|${row.Venue}|driver-venue-roi`));
    }


    // #6 Best venue record among this field
    const venueRecordComments = buildVenueLeaderComments(row, raceRows);

    venueRecordComments.forEach(comment => {
        parts.push(comment);
    });

    if (!Number.isNaN(fairOdds)) {
        const oddsKey = `${horse}|${row.Venue}|${row.Date}|${row["Race No"]}|fair-odds`;

        if (fairOdds < 2) {
            parts.push(seededPick([
                "Clear top pick.",
                "The one to beat.",
                "Looks the standout.",
                "Sets the benchmark."
            ], `${oddsKey}|elite`));
        }
        else if (fairOdds < 5) {
            parts.push(seededPick([
                "Huge chance.",
                "Major winning chance.",
                "Must be respected.",
                "Expected to feature prominently."
            ], `${oddsKey}|strong`));
        }
        else if (fairOdds < 10) {
            parts.push(seededPick([
                "Each way.",
                "Worth an each-way look.",
                "Not without claims.",
                "Can make its presence felt."
            ], `${oddsKey}|ew`));
        }
        else if (fairOdds < 25) {
            parts.push(seededPick([
                "Rough hope.",
                "Needs things to go right.",
                "Not completely hopeless.",
                "Could surprise with the right run."
            ], `${oddsKey}|rough`));
        }
        else {
            parts.push(seededPick([
                "Prefer others.",
                "Would need significant improvement.",
                "Faces a difficult task.",
                "Looks up against it."
            ], `${oddsKey}|outsider`));
        }
    }

        return parts.join(" ");
    }

function buildPositiveRecentRoiComments(row, horse) {
    const comments = [];

    const checks = [
        { label: "Driver", prefix: "Dr", name: clean(row.Driver || "") },
        { label: "Trainer", prefix: "Tr", name: clean(row.Trainer || "") }
    ];

    const periods = [
        { label: "last 30 days", key: "30", priority: 1 },
        { label: "last 90 days", key: "90", priority: 2 },
        { label: "last 180 days", key: "180", priority: 3 },
        { label: "last 365 days", key: "365", priority: 4 },
        { label: "last 100", key: "L/100", priority: 5 },
        { label: "all runs", key: "All", priority: 6 }
    ];

    checks.forEach(check => {
        const candidates = periods.map(period => {
            const starts = parseNumber(row[`${check.prefix} ${period.key} Sts`]);
            const wins = parseNumber(row[`${check.prefix} ${period.key} Win`]);
            const roi = parseNumber(row[`${check.prefix} ${period.key} ROI %`]);

            return {
                ...period,
                starts,
                wins,
                roi
            };
        }).filter(item => {
            if (
                Number.isNaN(item.starts) ||
                Number.isNaN(item.wins) ||
                Number.isNaN(item.roi)
            ) {
                return false;
            }

            return item.starts >= 20 && item.wins >= 1 && item.roi > 0;
        });

        if (!candidates.length) return;

        candidates.sort((a, b) => {
            const roiDiff = b.roi - a.roi;
            if (roiDiff !== 0) return roiDiff;

            const startsDiff = b.starts - a.starts;
            if (startsDiff !== 0) return startsDiff;

            return a.priority - b.priority;
        });

        const best = candidates[0];

        comments.push(seededPick([
            `${check.label} has +${Math.round(best.roi)}% ROI in ${best.label} (${formatWholeNumber(best.wins)} from ${formatWholeNumber(best.starts)}).`,
            `${check.label} is profitable in ${best.label} figures (+${Math.round(best.roi)}% ROI, ${formatWholeNumber(best.wins)} from ${formatWholeNumber(best.starts)}).`,
            `${check.label} has returned +${Math.round(best.roi)}% ROI in ${best.label} (${formatWholeNumber(best.wins)} from ${formatWholeNumber(best.starts)}).`
        ], `${horse}|${check.name}|${check.label}|${best.key}|recent-roi-best`));
    });

    return comments;
}

function buildVenueLeaderComments(row, raceRows) {
    const comments = [];

    const checks = [
        {
            label: "Horse",
            prefix: "Venue Horse",
            name: clean(row.Horse || "")
        },
        {
            label: "Trainer",
            prefix: "Venue Trainer",
            name: clean(row.Trainer || "")
        },
        {
            label: "Driver",
            prefix: "Venue Driver",
            name: clean(row.Driver || "")
        }
    ];

    checks.forEach(check => {
        const winsCol = `${check.prefix} W`;
        const startsCol = `${check.prefix} Sts`;
        const roiCol = `${check.prefix} ROI %`;

        const rowWins = parseNumber(row[winsCol]);
        const rowStarts = parseNumber(row[startsCol]);
        const rowRoi = parseNumber(row[roiCol]);

        if (Number.isNaN(rowWins) || rowWins <= 0) return;

        const maxWins = Math.max(
            ...raceRows
                .map(r => parseNumber(r[winsCol]))
                .filter(v => !Number.isNaN(v))
        );

        if (rowWins !== maxWins) return;

        const roiText = Number.isNaN(rowRoi)
            ? ""
            : `${rowRoi > 0 ? "+" : ""}${Math.round(rowRoi)}% ROI`;

        const recordText =
            `${formatWholeNumber(rowWins)} ${pluraliseWins(rowWins)} from ${formatWholeNumber(rowStarts)}${roiText ? ` @ ${roiText}` : ""}`;

        if (check.label === "Horse") {
            comments.push(
                seededPick([
                    `Best venue horse record in the race (${recordText}).`,
                    `Has the strongest runner record here (${recordText}).`,
                    `Owns the leading horse record at this venue (${recordText}).`
                ], `${check.label}|${check.name}|${recordText}`)
            );
        }

        if (check.label === "Trainer") {
            comments.push(
                seededPick([
                    `Trainer has the leading record here (${recordText}).`,
                    `Trainer brings the best venue record in the race (${recordText}).`,
                    `Stable has the strongest local record among these runners (${recordText}).`
                ], `${check.label}|${check.name}|${recordText}`)
            );
        }

        if (check.label === "Driver") {
            comments.push(
                seededPick([
                    `Driver has the leading record here (${recordText}).`,
                    `Driver brings the best venue record in the race (${recordText}).`,
                    `Reinsperson has the strongest local record among these runners (${recordText}).`
                ], `${check.label}|${check.name}|${recordText}`)
            );
        }
    });

    return comments;
}

function renderRaceRoiTooltip(raceRows) {
    const items = buildRaceRoiItems(raceRows).slice(0, 10);

    if (!items.length) {
        return `
            <div class="race-roi-tooltip">
                <div class="race-roi-title">ROI+ Angles</div>
                <div class="race-roi-empty">No positive ROI angles found.</div>
            </div>
        `;
    }

    return `
        <div class="race-roi-tooltip">
            <div class="race-roi-title">ROI+ Angles</div>

            ${items.map(item => `
                <div class="race-roi-row">
                    <div class="race-roi-pct">+${escapeHtml(Math.round(item.roi))}%</div>
                    <div class="race-roi-type">${escapeHtml(item.type)}</div>
                    <div class="race-roi-main">
                        <strong>${escapeHtml(item.subject)}</strong>
                        <span>${escapeHtml(item.horse)}</span>
                    </div>
                    <div class="race-roi-record">
                        (${escapeHtml(formatWholeNumber(item.starts))}:${escapeHtml(formatWholeNumber(item.wins))}-${escapeHtml(formatWholeNumber(item.places))})
                    </div>
                </div>
            `).join("")}
        </div>
    `;
}

function buildRaceRoiItems(raceRows) {
    const items = [];

    const periods = [
        { label: "30", key: "30" },
        { label: "90", key: "90" },
        { label: "180", key: "180" },
        { label: "365", key: "365" },
        { label: "All", key: "All" },
        { label: "100", key: "L/100" }
    ];

    raceRows.forEach(row => {
        const horse = clean(row.Horse || "");
        const barrier = clean(row.Barrier || "").toUpperCase();
        const trainer = clean(row.Trainer || "");
        const driver = clean(row.Driver || "");

        periods.forEach(period => {
            addRoiItem(items, {
                row,
                horse,
                subject: barrier,
                prefix: "Br",
                label: `Br ${period.label}`,
                key: period.key
            });

            addRoiItem(items, {
                row,
                horse,
                subject: trainer,
                prefix: "Tr",
                label: `Tr ${period.label}`,
                key: period.key
            });

            addRoiItem(items, {
                row,
                horse,
                subject: driver,
                prefix: "Dr",
                label: `Dr ${period.label}`,
                key: period.key
            });
        });
    });

    const bestOnlyMap = new Map();

    items.forEach(item => {
        const key = `${item.type.substring(0, 2)}|${normaliseName(item.subject)}`;

        const existing = bestOnlyMap.get(key);

        if (!existing || item.roi > existing.roi) {
            bestOnlyMap.set(key, item);
        }
    });

    return [...bestOnlyMap.values()].sort((a, b) => b.roi - a.roi);
    }

function addRoiItem(items, config) {
    const starts = parseNumber(config.row[`${config.prefix} ${config.key} Sts`]);
    const wins = parseNumber(config.row[`${config.prefix} ${config.key} Win`]);
    const places = parseNumber(config.row[`${config.prefix} ${config.key} Pla`]);
    const roi = parseNumber(config.row[`${config.prefix} ${config.key} ROI %`]);

    if (!config.subject) return;
    if (Number.isNaN(starts) || Number.isNaN(wins) || Number.isNaN(places) || Number.isNaN(roi)) return;
    if (roi <= 0 || starts < 10 || wins < 1) return;

    items.push({
        roi,
        type: config.label,
        subject: config.subject,
        horse: config.horse,
        starts,
        wins,
        places
    });
}

function toOrdinal(value) {
    const n = parseInt(value, 10);

    if (isNaN(n)) {
        return value;
    }

    const mod100 = n % 100;

    if (mod100 >= 11 && mod100 <= 13) {
        return `${n}th`;
    }

    switch (n % 10) {
        case 1: return `${n}st`;
        case 2: return `${n}nd`;
        case 3: return `${n}rd`;
        default: return `${n}th`;
    }
}

function sentenceJoinNoOxford(items) {
    const values = items.filter(Boolean);

    if (!values.length) return "";
    if (values.length === 1) return values[0];
    if (values.length === 2) return `${values[0]} and ${values[1]}`;

    return `${values.slice(0, -1).join(", ")} and ${values[values.length - 1]}`;
}

function seededPick(options, key) {
    if (!options.length) return "";
    const safeKey = clean(key || "");
    let total = 0;

    for (let i = 0; i < safeKey.length; i++) {
        total += safeKey.charCodeAt(i);
    }

    return options[total % options.length];
}

function formatShortRaceDate(value) {
    const raw = clean(value || "");
    if (!raw) return "";

    const dateKey = parseDateToKey(raw);
    if (!dateKey) return raw;

    const d = new Date(`${dateKey}T12:00:00`);
    const day = d.getDate();
    const month = d.toLocaleDateString("en-AU", { month: "short" });

    const currentYear = new Date().getFullYear();
    const year = d.getFullYear();

    return year === currentYear
        ? `${day} ${month}`
        : `${day} ${month} ${year}`;
}

function formatLatestRunMargin(value) {
    const raw = clean(value || "");
    if (!raw) return "";

    const n = Number(raw);
    if (!Number.isFinite(n)) return raw;

    return `${Math.round(n)}m`;
}

function formatLatestRunSp(value) {
    const n = parseNumber(value);
    if (Number.isNaN(n) || n <= 0) return "";

    return Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`;
}

function latestRunPositionPhrase(pos, key) {
    const p = clean(pos || "").toUpperCase();

    const groups = {
        "LEAD": ["led", "led them up", "found the front", "controlled it in front"],
        "B/LEAD": ["trailed the leader", "sat behind the leader", "took the trail", "followed the leader"],
        "3PEGS": ["sat three back on the pegs", "landed three back on the rails", "settled three pegs"],
        "DEATH": ["sat outside the leader", "landed in the death seat", "worked in the death", "raced without cover"],
        "1X1": ["sat one-one", "landed one out one back", "had the 1x1 trail"],
        "BACKPEG": ["settled back along the pegs", "was back on the rails", "ended up back along the inside"],
        "BACKLINE": ["settled back in the running line", "was back in the field", "settled well back", "was out the back"]
    };

    if (groups[p]) return seededPick(groups[p], key);

    if (["4PEGS", "5PEGS", "6PEGS", "7PEGS", "8PEGS", "9PEGS"].includes(p)) {
        return seededPick(groups.BACKPEG, key);
    }

    if (["1X2", "1X3", "1X4", "1X5", "1X6", "1X7"].includes(p)) {
        return seededPick(groups.BACKLINE, key);
    }

    return "";
}

function renderPositionStatsTooltip(row) {
    const leaderSts = parseNumber(row["Bell Pos Lead"] || row["Lead Sts"] || "");
    const leaderWins = parseNumber(row["Ld Win"] || "");
    const leaderPlaces = parseNumber(row["Ld Pla"] || "");
    const leaderPct = parseNumber(row["Bell Pos Lead %"] || row["Lead %"] || "");

    const blSts = parseNumber(row["Bell Pos BL"] || row["B/Lead Sts"] || row["BL Sts"] || "");
    const blWins = parseNumber(row["BL Win"] || "");
    const blPlaces = parseNumber(row["BL Pla"] || "");
    const blPct = parseNumber(row["Bell Pos BL %"] || row["B/Lead %"] || row["BL %"] || "");

    const deathSts = parseNumber(row["Bell Pos Dth"] || row["Death Sts"] || row["Dth Sts"] || "");
    const deathWins = parseNumber(row["Dth Win"] || "");
    const deathPlaces = parseNumber(row["Dth Pla"] || "");
    const deathPct = parseNumber(row["Bell Pos Dth %"] || row["Death %"] || row["Dth %"] || "");

    const totalSts = parseNumber(row["Bell Pos Sts"] || row["Starts"] || "");
    const totalWins = parseNumber(row["Horse W"] || "");
    const totalPlaces = parseNumber(row["Horse P"] || row["Pl"] || "");

    const usedSts = safeNum(leaderSts) + safeNum(blSts) + safeNum(deathSts);
    const usedWins = safeNum(leaderWins) + safeNum(blWins) + safeNum(deathWins);
    const usedPlaces = safeNum(leaderPlaces) + safeNum(blPlaces) + safeNum(deathPlaces);

    const otherSts = Math.max(0, safeNum(totalSts) - usedSts);
    const otherWins = Math.max(0, safeNum(totalWins) - usedWins);
    const otherPlaces = Math.max(0, safeNum(totalPlaces) - usedPlaces);
    const otherPct = totalSts > 0 ? (otherSts / totalSts) * 100 : 0;

    return `
        <div class="horse-stats-tooltip">

            <div class="barrier-tooltip-title">
                ${escapeHtml(clean(row.Horse || row.HORSE || ""))}
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Pos</th>
                        <th>Sts</th>
                        <th>W</th>
                        <th>P</th>
                        <th>%</th>
                    </tr>
                </thead>
                <tbody>
                    ${positionTooltipRow("Leader", leaderSts, leaderWins, leaderPlaces, leaderPct)}
                    ${positionTooltipRow("B/Lead", blSts, blWins, blPlaces, blPct)}
                    ${positionTooltipRow("Death", deathSts, deathWins, deathPlaces, deathPct)}
                    ${positionTooltipRow("Other", otherSts, otherWins, otherPlaces, otherPct)}
                    ${positionTooltipRow("Total", totalSts, totalWins, totalPlaces, 100, true)}
                </tbody>
            </table>
        </div>
    `;
}

function renderBarrierStatsTooltip(row, race) {
    const barrier = clean(row.Barrier || row.BARRIER || "");
    const venue = clean(race.Venue || "");
    const distance = clean(race.Distance || "");
    const start = clean(race.Start || "");
    const gait = clean(race.Gait || "");

    const title = `${barrier} | ${venue} | ${distance}m | ${start} | ${gait}`;

    const rows = [
        barrierTooltipRow("Month",
            row["Br 30 Sts"],
            row["Br 30 Win"],
            row["Br 30 Pla"],
            row["Br 30 Win %"],
            row["Br 30 Pla %"],
            row["Br 30 ROI %"]
        ),

        barrierTooltipRow("Quarter",
            row["Br 90 Sts"],
            row["Br 90 Win"],
            row["Br 90 Pla"],
            row["Br 90 Win %"],
            row["Br 90 Pla %"],
            row["Br 90 ROI %"]
        ),

        barrierTooltipRow("Half Year",
            row["Br 180 Sts"],
            row["Br 180 Win"],
            row["Br 180 Pla"],
            row["Br 180 Win %"],
            row["Br 180 Pla %"],
            row["Br 180 ROI %"]
        ),

        barrierTooltipRow("Year",
            row["Br 365 Sts"],
            row["Br 365 Win"],
            row["Br 365 Pla"],
            row["Br 365 Win %"],
            row["Br 365 Pla %"],
            row["Br 365 ROI %"]
        ),

        barrierTooltipRow("All",
            row["Br Sts"],
            row["Br Wins"],
            row["Br Places"],
            row["Br Win %"],
            row["Br Pla %"],
            row["Br ROI %"]
        ),

        barrierTooltipRow("100",
            row["Br L/100 Sts"],
            row["Br L/100 Win"],
            row["Br L/100 Pla"],
            row["Br L/100 Win %"],
            row["Br L/100 Pla %"],
            row["Br L/100 ROI %"]
        )
    ].join("");

    return `
        <div class="barrier-stats-tooltip">
            <div class="barrier-tooltip-title">${escapeHtml(title)}</div>
            <table>
                <thead>
                    <tr>
                        <th>Last</th>
                        <th>Sts</th>
                        <th>W</th>
                        <th>P</th>
                        <th>W%</th>
                        <th>P%</th>
                        <th>ROI%</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        </div>
    `;
}

function barrierTooltipRow(label, sts, wins, places, winPct, plaPct, roiPct) {
    const rowClass = label === "All" ? "barrier-total-row" : "";

    return `
        <tr class="${rowClass}">
            <td>${escapeHtml(label)}</td>
            <td>${formatWholeNumber(sts)}</td>
            <td>${formatWholeNumber(wins)}</td>
            <td>${formatWholeNumber(places)}</td>
            <td>${formatPercent0(winPct)}</td>
            <td>${formatPercent0(plaPct)}</td>
            <td class="${roiClass(roiPct)}">${formatPercent0(roiPct)}</td>
        </tr>
    `;
}

function formatPercent0(value) {
    const num = parseNumber(value);
    if (Number.isNaN(num)) return "";
    return `${Math.round(num)}%`;
}

function roiClass(value) {
    const num = parseNumber(value);

    if (Number.isNaN(num)) return "";
    if (num > 0) return "roi-positive";
    if (num < -20) return "roi-negative";

    return "roi-neutral";
}

function positionTooltipRow(label, sts, wins, places, pct, isTotal = false) {
    const pctNum = parseNumber(pct);

    let positionClass = "";

    if (!isTotal && pctNum >= 14.5) {
        if (label === "Leader") {
            positionClass = "position-hot-leader";
        } else if (label === "B/Lead") {
            positionClass = "position-hot-blead";
        } else if (label === "Death") {
            positionClass = "position-hot-death";
        }
    }

    const rowClasses = [
        isTotal ? "tooltip-total-row" : "",
        positionClass
    ].filter(Boolean).join(" ");

    return `
        <tr class="${rowClasses}">
            <td class="position-label">
                ${positionClass ? `<span class="position-match-dot"></span>` : ""}
                ${escapeHtml(label)}
            </td>
            <td>${formatWholeNumber(sts)}</td>
            <td>${formatWholeNumber(wins)}</td>
            <td>${formatWholeNumber(places)}</td>
            <td class="position-pct">${formatWholeNumber(pct)}%</td>
        </tr>
    `;
}

function safeNum(value) {
    const num = Number(value);
    return Number.isNaN(num) ? 0 : num;
}

function returnToMeeting(venue, state, dateValue) {
    const meetings = groupMeetings(allRows);
    const meeting = meetings.find(m =>
        m.venue === venue &&
        m.state === state &&
        m.dateValue === dateValue
    );

    if (meeting) {
        renderRaceListForMeeting(allRows, meeting);
    }
}

function renderTrafficLights(leadPct, behindLeadPct, deathPct) {
    return `
        <div class="traffic-lights">
            <span class="traffic-dot green ${leadPct >= 14.5 ? "filled" : ""}" title="Lead ${formatOneDecimal(leadPct)}%"></span>
            <span class="traffic-dot amber ${behindLeadPct >= 14.5 ? "filled" : ""}" title="Behind Lead ${formatOneDecimal(behindLeadPct)}%"></span>
            <span class="traffic-dot red ${deathPct >= 14.5 ? "filled" : ""}" title="Death Seat ${formatOneDecimal(deathPct)}%"></span>
        </div>
    `;
}

function formatOneDecimal(value) {
    const num = parseNumber(value);
    if (Number.isNaN(num)) return clean(value);
    return num.toFixed(1);
}

function formatNearestOdds(value) {
    const num = parseNumber(value);
    if (Number.isNaN(num) || num <= 0) return "";

    const oddsList = [
        1.10, 1.20, 1.30, 1.40, 1.50, 1.60, 1.70, 1.80, 1.90,
        2.00, 2.50, 3.00, 3.50, 4.00, 5.00, 6.00, 8.00, 10.00,
        12.00, 15.00, 21.00, 26.00, 31.00, 41.00, 51.00, 67.00,
        101.00, 201.00, 501.00
    ];

    let nearest = oddsList[0];

    oddsList.forEach(odds => {
        if (Math.abs(odds - num) < Math.abs(nearest - num)) {
            nearest = odds;
        }
    });

    return `$${nearest.toFixed(2)}`;
}

function formatWholeNumber(value) {
    const raw = clean(value);
    const num = Number(raw);

    if (!Number.isNaN(num)) {
        return String(Math.round(num));
    }

    return raw;
}

async function showDriversView() {
    resetMobileViewScroll();
    stopTimelineRefresh();

    document.querySelector(".hero").style.display = "none";
    document.querySelector(".dashboard-grid").style.display = "none";
    document.querySelector(".meetings-panel").style.display = "";

    document.querySelector(".panel-heading").innerHTML = `
        <span>👤</span>
        <span>Drivers</span>
    `;

    const isMobile = window.innerWidth <= 700;

    document.getElementById("meetingStrip").innerHTML = `
        <div class="drivers-layout">

            ${isMobile ? `
                <div class="mobile-driver-table-selector">
                    <select
                        id="mobileDriverTableSelect"
                        onchange="changeMobileDriverTable(this.value)"
                    >
                        ${DRIVER_TABLES.map((table, index) => `
                            <option
                                value="${escapeHtml(table.file)}"
                                ${index === 0 ? "selected" : ""}
                            >
                                ${escapeHtml(table.title)}
                            </option>
                        `).join("")}
                    </select>
                </div>
            ` : `
                <div class="drivers-menu">
                    ${DRIVER_TABLES.map((table, index) => `
                        <button
                            class="driver-table-tile ${index === 0 ? "selected" : ""}"
                            data-file="${escapeHtml(table.file)}"
                        >
                            <span>${escapeHtml(table.title)}</span>
                        </button>
                    `).join("")}
                </div>
            `}

            <div class="drivers-table-panel" id="driversTablePanel">
                <div class="coming-soon-card">
                    <div class="coming-soon-title">
                        Loading driver table...
                    </div>
                </div>
            </div>

        </div>
    `;

    if (!isMobile) {
        document
            .querySelectorAll(".driver-table-tile")
            .forEach(button => {
                button.addEventListener("click", async () => {

                    document
                        .querySelectorAll(".driver-table-tile")
                        .forEach(b =>
                            b.classList.remove("selected")
                        );

                    button.classList.add("selected");

                    const table =
                        DRIVER_TABLES.find(
                            t => t.file === button.dataset.file
                        );

                    await renderSelectedDriverTable(table);
                });
            });
    }

    await renderSelectedDriverTable(DRIVER_TABLES[0]);
}

async function loadMergedMeta() {
    try {
        const response = await fetch(
            "merged_meta.json?v=" + Date.now(),
            { cache: "no-store" }
        );

        if (!response.ok) {
            throw new Error("Could not load merged_meta.json");
        }

        return await response.json();

    } catch (error) {
        console.error("Failed to load merged metadata:", error);
        return null;
    }
}

async function changeMobileDriverTable(file) {
    const table =
        DRIVER_TABLES.find(t => t.file === file);

    if (!table) return;

    await renderSelectedDriverTable(table);
}

async function updateLast30HomeTile() {
    await loadLast30Preview("Hot Drivers 30.csv", "hotDrivers30Preview", "Driver", "driver");
    await loadLast30Preview("Hot Trainers 30.csv", "hotTrainers30Preview", "Trainer", "trainer");

    const filter = document.getElementById("last30StateFilter");

    if (filter) {
        filter.value = selectedLast30State;

        filter.onchange = function () {
            selectedLast30State = this.value;
            updateLast30HomeTile();
        };
    }

    const driverButton = document.getElementById("viewDrivers30Button");
    const trainerButton = document.getElementById("viewTrainers30Button");

    if (driverButton) {
        driverButton.onclick = function (e) {
            e.preventDefault();
            selectedDriverState = selectedLast30State;

            document.querySelectorAll(".nav-item").forEach(i => i.classList.remove("active"));
            document.querySelector('.nav-item[data-view="drivers"]').classList.add("active");
            showDriversView();
        };
    }

    if (trainerButton) {
        trainerButton.onclick = function (e) {
            e.preventDefault();
            selectedTrainerState = selectedLast30State;

            document.querySelectorAll(".nav-item").forEach(i => i.classList.remove("active"));
            document.querySelector('.nav-item[data-view="trainers"]').classList.add("active");
            showTrainersView();
        };
    }
}

async function loadLast30Preview(file, elementId, nameColumn, type) {
    const el = document.getElementById(elementId);
    if (!el) return;

    try {
        const response = await fetch(RAW_BASE_URL + encodeURIComponent(file), { cache: "no-store" });
        if (!response.ok) throw new Error(`Could not load ${file}`);

        let rows = parseCSV(await response.text());

        if (selectedLast30State !== "ALL") {
            if (type === "driver") {
                const driverStateMap = buildDriverStateMap(allRows);

                rows = rows.filter(row => {
                    const driver = normaliseName(row.Driver);
                    const states = driverStateMap.get(driver) || new Set();
                    return states.has(selectedLast30State);
                });
            }

            if (type === "trainer") {
                const trainerStateMap = buildTrainerStateMap(allRows);

                rows = rows.filter(row => {
                    const trainer = normaliseName(row.Trainer);
                    const states = trainerStateMap.get(trainer) || new Set();
                    return states.has(selectedLast30State);
                });
            }
        }

        rows = rows.slice(0, 5);

        el.innerHTML = rows.map(row => {
            const name = clean(row[nameColumn] || "");
            const starts = parseInt(row.Starts || 0, 10);
            const wins = parseInt(row.Wins || row.Win || 0, 10);
            const places = parseInt(
                row.Places ||
                row.Place ||
                row["2nds"] ||
                row["2nds + 3rds"] ||
                0,
                10
            );

            const roiValue = parseFloat(row["ROI %"]);
            const roi = Number.isFinite(roiValue)
                ? `${Math.round(roiValue)}%`
                : "";

            const record = `${starts}:${wins}-${places}`;
            const roiClassName = roiValue > 0 ? "roi-positive" : roiValue < 0 ? "roi-negative" : "roi-neutral";

            return `
                <div class="last30-row">
                    <span>${escapeHtml(name)}</span>
                    <strong>
                        ${escapeHtml(record)}
                        <span class="${roiClassName}">${escapeHtml(roi)}</span>
                    </strong>
                </div>
            `;
        }).join("");
    } catch (error) {
        el.innerHTML = `<div class="last30-empty">Could not load</div>`;
    }
}

async function showTrainersView() {
    resetMobileViewScroll();
    stopTimelineRefresh();

    document.querySelector(".hero").style.display = "none";
    document.querySelector(".dashboard-grid").style.display = "none";
    document.querySelector(".meetings-panel").style.display = "";

    document.querySelector(".panel-heading").innerHTML = `
        <span>🎓</span>
        <span>Trainers</span>
    `;

    const isMobile = window.innerWidth <= 700;

    document.getElementById("meetingStrip").innerHTML = `
        <div class="drivers-layout">

            ${isMobile ? `
                <div class="mobile-driver-table-selector">
                    <select
                        id="mobileTrainerTableSelect"
                        onchange="changeMobileTrainerTable(this.value)"
                    >
                        ${TRAINER_TABLES.map((table, index) => `
                            <option
                                value="${escapeHtml(table.file)}"
                                ${index === 0 ? "selected" : ""}
                            >
                                ${escapeHtml(table.title)}
                            </option>
                        `).join("")}
                    </select>
                </div>
            ` : `
                <div class="drivers-menu">
                    ${TRAINER_TABLES.map((table, index) => `
                        <button
                            class="driver-table-tile ${index === 0 ? "selected" : ""}"
                            data-file="${escapeHtml(table.file)}"
                        >
                            <span>${escapeHtml(table.title)}</span>
                        </button>
                    `).join("")}
                </div>
            `}

            <div class="drivers-table-panel" id="trainersTablePanel">
                <div class="coming-soon-card">
                    <div class="coming-soon-title">
                        Loading trainer table...
                    </div>
                </div>
            </div>

        </div>
    `;

    if (!isMobile) {
        document
            .querySelectorAll(".driver-table-tile")
            .forEach(button => {
                button.addEventListener("click", async () => {

                    document
                        .querySelectorAll(".driver-table-tile")
                        .forEach(b =>
                            b.classList.remove("selected")
                        );

                    button.classList.add("selected");

                    const table =
                        TRAINER_TABLES.find(
                            t => t.file === button.dataset.file
                        );

                    await renderSelectedTrainerTable(table);
                });
            });
    }

    await renderSelectedTrainerTable(TRAINER_TABLES[0]);
}

async function changeMobileTrainerTable(file) {
    const table =
        TRAINER_TABLES.find(t => t.file === file);

    if (!table) return;

    await renderSelectedTrainerTable(table);
}

async function renderSelectedTrainerTable(table) {
    const panel = document.getElementById("trainersTablePanel");

    panel.innerHTML = `
        <div class="coming-soon-card">
            <div class="coming-soon-title">Loading ${escapeHtml(table.title)}...</div>
        </div>
    `;

    panel.innerHTML = await loadTrainerTable(table);
}

async function loadTrainerTable(table) {
    try {
        const url = RAW_BASE_URL + encodeURIComponent(table.file);
        const response = await fetch(url, { cache: "no-store" });

        if (!response.ok) {
            throw new Error(`Could not load ${table.file}`);
        }

        const text = await response.text();
        const rows = parseCSV(text);

        return renderTrainerTable(table.title, rows);
    } catch (error) {
        return `
            <div class="coming-soon-card">
                <div class="coming-soon-title">${escapeHtml(table.title)}</div>
                <p>Could not load this table.</p>
            </div>
        `;
    }
}

function renderTrainerTable(title, rows) {
    if (!rows.length) {
        return `
            <div class="coming-soon-card">
                <div class="coming-soon-title">${escapeHtml(title)}</div>
                <p>No rows found.</p>
            </div>
        `;
    }

    const headers = Object.keys(rows[0]).filter(h =>
        h !== "Spend" &&
        h !== "P&L"
    );

    const trainerStateMap = buildTrainerStateMap(allRows);

    const filteredRows = selectedTrainerState === "ALL"
        ? rows
        : rows.filter(row => {
            const trainer = normaliseName(row.Trainer);
            const states = trainerStateMap.get(trainer) || new Set();
            return states.has(selectedTrainerState);
        });

    const isMobile = window.innerWidth <= 700;

    if (isMobile) {
        return `
            <div class="driver-table-card mobile-person-table">

                <div class="driver-state-filter mobile-person-state-filter">
                    ${["ALL", "VIC", "NSW", "QLD", "SA", "WA", "TAS"].map(state => `
                        <button
                            class="driver-state-button ${selectedTrainerState === state ? "selected" : ""}"
                            onclick="setTrainerStateFilter('${state}')"
                        >
                            ${state}
                        </button>
                    `).join("")}
                </div>

                <div class="mobile-person-table-list">

                    ${filteredRows.map(row => {

                        const name =
                            clean(row.Trainer || "");

                        const starts =
                            formatWholeNumber(row.Starts || "");

                        const wins =
                            formatWholeNumber(row.Wins || row.Win || "");

                        const seconds =
                            formatWholeNumber(row["2nds"] || "");

                        const thirds =
                            formatWholeNumber(row["3rds"] || "");

                        const roiNum =
                            parseNumber(row["ROI %"]);

                        const roiText =
                            Number.isFinite(roiNum)
                                ? `${roiNum > 0 ? "+" : ""}${roiNum.toFixed(1)}%`
                                : "";

                        const roiClass =
                            roiNum > 0
                                ? "positive"
                                : roiNum < 0
                                    ? "negative"
                                    : "";

                        return `
                            <div class="mobile-person-table-row ${roiNum > 0 ? "positive-roi-row" : ""}">

                                <span class="mobile-person-name">
                                    ${escapeHtml(name)}
                                </span>

                                <span class="mobile-person-record">
                                    ${escapeHtml(starts || "0")}:
                                    ${escapeHtml(wins || "0")}-
                                    ${escapeHtml(seconds || "0")}-
                                    ${escapeHtml(thirds || "0")}
                                </span>

                                <span class="mobile-person-roi ${roiClass}">
                                    ${escapeHtml(roiText)}
                                </span>

                            </div>
                        `;
                    }).join("")}

                </div>

            </div>
        `;
    }

    /* DESKTOP */
    return `
        <div class="driver-table-card">
            <div class="driver-table-header">
                <div>
                    <div class="race-panel-eyebrow">Trainer table</div>
                    <h2>${escapeHtml(title)}</h2>
                </div>

                <div class="driver-count-pill">
                    ${filteredRows.length} rows
                </div>
            </div>

            <div class="driver-state-filter">
                ${["ALL", "VIC", "NSW", "QLD", "SA", "WA", "TAS"].map(state => `
                    <button
                        class="driver-state-button ${selectedTrainerState === state ? "selected" : ""}"
                        onclick="setTrainerStateFilter('${state}')"
                    >
                        ${state}
                    </button>
                `).join("")}
            </div>

            <div class="table-scroll">
                <table class="data-table">
                    <thead>
                        <tr>
                            ${headers.map(h => `
                                <th>${escapeHtml(h)}</th>
                            `).join("")}
                        </tr>
                    </thead>

                    <tbody>
                        ${filteredRows.map(row => {
                            const spend = parseNumber(row["Spend"]);
                            const pnl = parseNumber(row["P&L"]);
                            const roi =
                                spend > 0
                                    ? (pnl / spend) * 100
                                    : null;

                            const positiveClass =
                                roi !== null && roi > 0
                                    ? "positive-roi-row"
                                    : "";

                            return `
                                <tr class="${positiveClass}">
                                    ${headers.map(h => `
                                        <td>
                                            ${escapeHtml(
                                                formatDriverTableValue(
                                                    h,
                                                    row[h],
                                                    roi
                                                )
                                            )}
                                        </td>
                                    `).join("")}
                                </tr>
                            `;
                        }).join("")}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function setTrainerStateFilter(state) {
    selectedTrainerState = state;

    let table = null;

    if (window.innerWidth <= 700) {
        const select =
            document.getElementById(
                "mobileTrainerTableSelect"
            );

        if (select) {
            table =
                TRAINER_TABLES.find(
                    t => t.file === select.value
                );
        }
    } else {
        const selectedTile =
            document.querySelector(
                ".driver-table-tile.selected"
            );

        if (selectedTile) {
            table =
                TRAINER_TABLES.find(
                    t => t.file === selectedTile.dataset.file
                );
        }
    }

    if (table) {
        renderSelectedTrainerTable(table);
    }
}

function buildTrainerStateMap(rows) {
    const map = new Map();

    rows.forEach(row => {
        const trainer = normaliseName(row.Trainer || row.TRAINER || "");
        const state = clean(row.State || row.STATE || row["State "] || "");

        if (!trainer || !state) return;

        if (!map.has(trainer)) {
            map.set(trainer, new Set());
        }

        map.get(trainer).add(state.toUpperCase());
    });

    return map;
}

async function renderSelectedDriverTable(table) {
    const panel = document.getElementById("driversTablePanel");

    panel.innerHTML = `
        <div class="coming-soon-card">
            <div class="coming-soon-title">Loading ${escapeHtml(table.title)}...</div>
        </div>
    `;

    panel.innerHTML = await loadDriverTable(table);
}

async function loadDriverTable(table) {
    try {
        const url = RAW_BASE_URL + encodeURIComponent(table.file);
        const response = await fetch(url, { cache: "no-store" });

        if (!response.ok) {
            throw new Error(`Could not load ${table.file}`);
        }

        const text = await response.text();
        const rows = parseCSV(text);

        return renderDriverTable(table.title, rows);
    } catch (error) {
        return `
            <div class="coming-soon-card">
                <div class="coming-soon-title">${escapeHtml(table.title)}</div>
                <p>Could not load this table.</p>
            </div>
        `;
    }
}

function renderDriverTable(title, rows) {
    if (!rows.length) {
        return `
            <div class="coming-soon-card">
                <div class="coming-soon-title">${escapeHtml(title)}</div>
                <p>No rows found.</p>
            </div>
        `;
    }

    const headers = Object.keys(rows[0]).filter(h =>
        h !== "Spend" &&
        h !== "P&L"
    );

    const driverStateMap = buildDriverStateMap(allRows);

    const filteredRows = selectedDriverState === "ALL"
        ? rows
        : rows.filter(row => {
            const driver = normaliseName(row.Driver);
            const states = driverStateMap.get(driver) || new Set();
            return states.has(selectedDriverState);
        });

    const isMobile = window.innerWidth <= 700;

    if (isMobile) {
        return `
            <div class="driver-table-card mobile-person-table">

                <div class="driver-state-filter mobile-person-state-filter">
                    ${["ALL", "VIC", "NSW", "QLD", "SA", "WA", "TAS"].map(state => `
                        <button
                            class="driver-state-button ${selectedDriverState === state ? "selected" : ""}"
                            onclick="setDriverStateFilter('${state}')"
                        >
                            ${state}
                        </button>
                    `).join("")}
                </div>

                <div class="mobile-person-table-list">

                    ${filteredRows.map(row => {

                        const name =
                            clean(row.Driver || "");

                        const starts =
                            formatWholeNumber(row.Starts || "");

                        const wins =
                            formatWholeNumber(row.Wins || row.Win || "");

                        const seconds =
                            formatWholeNumber(row["2nds"] || "");

                        const thirds =
                            formatWholeNumber(row["3rds"] || "");

                        const roiNum =
                            parseNumber(row["ROI %"]);

                        const roiText =
                            Number.isFinite(roiNum)
                                ? `${roiNum > 0 ? "+" : ""}${roiNum.toFixed(1)}%`
                                : "";

                        const roiClass =
                            roiNum > 0
                                ? "positive"
                                : roiNum < 0
                                    ? "negative"
                                    : "";

                        return `
                            <div class="mobile-person-table-row ${roiNum > 0 ? "positive-roi-row" : ""}">

                                <span class="mobile-person-name">
                                    ${escapeHtml(name)}
                                </span>

                                <span class="mobile-person-record">
                                    ${escapeHtml(starts || "0")}:
                                    ${escapeHtml(wins || "0")}-
                                    ${escapeHtml(seconds || "0")}-
                                    ${escapeHtml(thirds || "0")}
                                </span>

                                <span class="mobile-person-roi ${roiClass}">
                                    ${escapeHtml(roiText)}
                                </span>

                            </div>
                        `;
                    }).join("")}

                </div>

            </div>
        `;
    }

    /* DESKTOP - KEEP EXISTING TABLE */
    return `
        <div class="driver-table-card">
            <div class="driver-table-header">
                <div>
                    <div class="race-panel-eyebrow">Driver table</div>
                    <h2>${escapeHtml(title)}</h2>
                </div>

                <div class="driver-count-pill">
                    ${filteredRows.length} rows
                </div>
            </div>

            <div class="driver-state-filter">
                ${["ALL", "VIC", "NSW", "QLD", "SA", "WA", "TAS"].map(state => `
                    <button
                        class="driver-state-button ${selectedDriverState === state ? "selected" : ""}"
                        onclick="setDriverStateFilter('${state}')"
                    >
                        ${state}
                    </button>
                `).join("")}
            </div>

            <div class="table-scroll">
                <table class="data-table">
                    <thead>
                        <tr>
                            ${headers.map(h => `
                                <th>${escapeHtml(h)}</th>
                            `).join("")}
                        </tr>
                    </thead>

                    <tbody>
                        ${filteredRows.map(row => {
                            const spend = parseNumber(row["Spend"]);
                            const pnl = parseNumber(row["P&L"]);
                            const roi =
                                spend > 0
                                    ? (pnl / spend) * 100
                                    : null;

                            const positiveClass =
                                roi !== null && roi > 0
                                    ? "positive-roi-row"
                                    : "";

                            return `
                                <tr class="${positiveClass}">
                                    ${headers.map(h => `
                                        <td>
                                            ${escapeHtml(
                                                formatDriverTableValue(
                                                    h,
                                                    row[h],
                                                    roi
                                                )
                                            )}
                                        </td>
                                    `).join("")}
                                </tr>
                            `;
                        }).join("")}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function setDriverStateFilter(state) {
    selectedDriverState = state;

    let table = null;

    if (window.innerWidth <= 700) {
        const select =
            document.getElementById("mobileDriverTableSelect");

        if (select) {
            table =
                DRIVER_TABLES.find(
                    t => t.file === select.value
                );
        }
    } else {
        const selectedTile =
            document.querySelector(
                ".driver-table-tile.selected"
            );

        if (selectedTile) {
            table =
                DRIVER_TABLES.find(
                    t => t.file === selectedTile.dataset.file
                );
        }
    }

    if (table) {
        renderSelectedDriverTable(table);
    }
}

function buildDriverStateMap(rows) {
    const map = new Map();

    rows.forEach(row => {
        const driver = normaliseName(row.Driver || row.DRIVER || "");
        const state = clean(row.State || row.STATE || row["State "] || "");

        if (!driver || !state) return;

        if (!map.has(driver)) {
            map.set(driver, new Set());
        }

        map.get(driver).add(state.toUpperCase());
    });

    return map;
}

function normaliseName(value) {
    return clean(value).toLowerCase().replace(/\s+/g, " ");
}

function formatDriverTableValue(header, value, calculatedRoi) {
    const raw = clean(value);

    if (header === "Spend" || header === "P&L") {
        return formatCurrency0(raw);
    }

    if (header === "ROI %") {
        return calculatedRoi === null ? "" : `${calculatedRoi.toFixed(1)}%`;
    }

    return raw;
}

function formatCurrency0(value) {
    const num = parseNumber(value);
    if (Number.isNaN(num)) return clean(value);

    const rounded = Math.round(num);
    return `$${rounded.toLocaleString("en-AU")}`;
}

function parseNumber(value) {
    const cleaned = String(value ?? "")
        .replaceAll("$", "")
        .replaceAll(",", "")
        .replaceAll("%", "")
        .trim();

    const num = Number(cleaned);
    return Number.isNaN(num) ? NaN : num;
}


async function showDailyWrapsView() {
    resetMobileViewScroll();
    document.querySelector(".hero").style.display = "none";
    document.querySelector(".dashboard-grid").style.display = "none";
    document.querySelector(".meetings-panel").style.display = "";

    document.querySelector(".panel-heading").innerHTML = `
        <span>📰</span>
        <span>Daily Wraps</span>
    `;

    document.getElementById("meetingStrip").innerHTML = `
        <div class="coming-soon-card">
            <div class="coming-soon-title">Loading daily wraps...</div>
            <p>Pulling the latest editorial wraps from GitHub.</p>
        </div>
    `;

    await loadDailyWraps();
    renderDailyWraps();
}

async function loadDailyWraps() {
    if (allDailyWraps.length) return;

    const response = await fetch(DAILY_WRAPS_URL, { cache: "no-store" });

    if (!response.ok) {
        throw new Error("Could not load daily_wraps.json");
    }

    allDailyWraps = await response.json();

    allDailyWraps.sort((a, b) => clean(b.date).localeCompare(clean(a.date)));
}

async function updateLatestDailyWrapCard() {
    try {
        await loadDailyWraps();

        const latest = allDailyWraps[0];
        if (!latest) return;

        const card = document.querySelector(".daily-card");
        if (!card) return;

        const firstParagraph = clean((latest.body || [])[0] || "");
        const firstSentence = firstParagraph.split(". ")[0] + ".";

        card.querySelector("h3").textContent = latest.title.replace("Daily Wrap — ", "");
        card.querySelector("p").innerHTML = firstSentence;

        const button = card.querySelector(".card-button");
        button.onclick = function (e) {
            e.preventDefault();

            document.querySelectorAll(".nav-item").forEach(i => i.classList.remove("active"));
            document.querySelector('.nav-item[data-view="daily-wraps"]').classList.add("active");

            showDailyWrapsView();
        };
    } catch (error) {
        console.log("Could not update latest daily wrap card:", error);
    }
}

function renderDailyWraps() {
    const wraps = selectedWrapDate
        ? allDailyWraps.filter(w => w.date === selectedWrapDate)
        : allDailyWraps.slice(0, 10);

    document.getElementById("meetingStrip").innerHTML = `
        <div class="daily-wraps-layout">
            <div class="daily-wraps-toolbar">
                <div>
                    <div class="race-panel-eyebrow">Editorial archive</div>
                    <h2>Harness Daily Wraps</h2>
                </div>

                <div class="daily-wrap-controls">
                    <select onchange="setDailyWrapDate(this.value)">
                        <option value="">Latest 10 wraps</option>
                        ${allDailyWraps.map(wrap => `
                            <option value="${escapeHtml(wrap.date)}" ${selectedWrapDate === wrap.date ? "selected" : ""}>
                                ${escapeHtml(formatWrapDate(wrap.date))}
                            </option>
                        `).join("")}
                    </select>
                </div>
            </div>

            <div class="daily-wraps-list">
                ${wraps.map(renderDailyWrapCard).join("")}
            </div>
        </div>
    `;
}

function renderDailyWrapCard(wrap) {
    const title = clean(wrap.title || "").replace("Daily Wrap — ", "");

    return `
        <article class="daily-wrap-card">
            <div class="daily-wrap-title-row">
                <h3>${escapeHtml(title || formatWrapDate(wrap.date))}</h3>
                <span>${escapeHtml(formatWrapDate(wrap.date))}</span>
            </div>

            <div class="daily-wrap-body">
                ${(wrap.body || []).map(paragraph => `
                    <p>${paragraph}</p>
                `).join("")}
            </div>
        </article>
    `;
}

function setDailyWrapDate(date) {
    selectedWrapDate = date;
    renderDailyWraps();
}

function formatWrapDate(value) {
    const raw = clean(value);
    if (!raw) return "";

    const date = new Date(`${raw}T12:00:00`);

    return date.toLocaleDateString("en-AU", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

let trotifyWireTimer = null;

async function setupTrotifyWire() {
    const wireTrack = document.getElementById("wireTrack");

    if (!wireTrack) return;

    if (trotifyWireTimer) {
        clearTimeout(trotifyWireTimer);
        trotifyWireTimer = null;
    }

    const items = await buildTrotifyWireItems();

    if (!items.length) {
        wireTrack.innerHTML = `
            <span class="wire-copy">
                See more than the form.
            </span>
        `;

        trotifyWireTimer = setTimeout(
            setupTrotifyWire,
            60000
        );

        return;
    }

    const tickerHtml = items
        .map(item => {
            const html =
                typeof item === "string"
                    ? escapeHtml(item)
                    : item.html;

            return `
                <span class="wire-item">
                    ${html}
                </span>
            `;
        })
        .join(`
            <span class="wire-separator">✦</span>
        `);



    /*
       Stop the animation before replacing the contents.
       This is particularly important for iOS Safari.
    */
    wireTrack.style.animation = "none";
    wireTrack.style.transform = "translate3d(0, 0, 0)";

    wireTrack.innerHTML = `
        <span class="wire-copy">
            ${tickerHtml}
        </span>

        <span class="wire-copy">
            ${tickerHtml}
        </span>
    `;

    /*
       Force Safari to calculate the completed ticker width
       before restarting the animation.
    */
    void wireTrack.offsetWidth;

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            wireTrack.style.animation = "";
        });
    });

    trotifyWireTimer = setTimeout(
        setupTrotifyWire,
        60000
    );
}

async function buildTrotifyWireItems() {
    const dailyItems = [];
    const stableItems = [];
    const nextUpItems = [];

    try {
        await loadDailyWraps();

        const latest = allDailyWraps[0];

        if (latest && Array.isArray(latest.wire_items)) {
            shuffleArray(latest.wire_items).slice(0, 6).forEach(item => {
                const html = clean(item);

                if (html) {
                    dailyItems.push({
                        key: `daily-${cleanHtmlToText(html)}`,
                        html: `📰 ${html}`
                    });
                }
            });
        }
    } catch (error) {
        console.log("Wire daily wrap items not loaded:", error);
    }

    const now = new Date();
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const stableChanges = getStableChanges(allRows).filter(change => {
        return change.raceDateTime &&
            change.raceDateTime >= now &&
            change.raceDateTime <= next24Hours;
    });

    const featuredStableChanges = [
        ...stableChanges.slice(0, 2),
        ...shuffleArray(stableChanges.slice(2)).slice(0, 4)
    ];

    featuredStableChanges.forEach(change => {
        stableItems.push({
            key: `stable-${change.key || `${change.venue}-${change.raceNo}-${change.horse}`}`,
            html: `🔄 ${wireHorseName(change.horse)} changes stables from ${escapeHtml(toProperCase(change.oldTrainer))} to ${escapeHtml(toProperCase(change.newTrainer))} at ${escapeHtml(shortVenueName(change.venue))} R${escapeHtml(change.raceNo)} (${escapeHtml(formatTimeUntil(change.raceDateTime))})`
        });  
    });

    const nextRace = findUpcomingRaces(allRows)[0];

    if (nextRace) {
        const timeUntil = formatTimeUntil(nextRace.raceDateTime);

        const nextRaceLine =
            timeUntil === "Now"
                ? `⏱ Next to go: ${shortVenueName(nextRace.venue)} R${nextRace.raceNo} is about to jump`
                : `⏱ Next to go: ${shortVenueName(nextRace.venue)} R${nextRace.raceNo} jumps in ${timeUntil}`;

        nextUpItems.push(nextRaceLine);
        nextUpItems.push(nextRaceLine);
    }

    return interleaveWireItems([
        shuffleArray(dailyItems),
        shuffleArray(stableItems),
        shuffleArray(nextUpItems),
    ]);
}

function wireHorseName(horse) {
    return `<strong class="wire-horse">${escapeHtml(toProperCase(clean(horse)))}</strong>`;
}

function shuffleArray(array) {
    const shuffled = [...array];

    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
}

function interleaveWireItems(buckets) {
    const output = [];
    const working = buckets
        .map(bucket => [...bucket])
        .filter(bucket => bucket.length);

    while (working.length) {
        for (let i = working.length - 1; i >= 0; i--) {
            const bucket = working[i];

            if (bucket.length) {
                output.push(bucket.shift());
            }

            if (!bucket.length) {
                working.splice(i, 1);
            }
        }
    }

    const seen = new Set();

    return output.filter(item => {
        const key = typeof item === "string" ? item : item.key || item.html;

        if (seen.has(key)) return false;

        seen.add(key);
        return true;
    });

}

function cleanHtmlToText(value) {
    const div = document.createElement("div");
    div.innerHTML = String(value || "");
    return clean(div.textContent || div.innerText || "");
}

function groupMeetings(rows) {
    const map = new Map();

    rows.forEach(row => {
        const venue = clean(row.Venue);
        if (!venue) return;

        const state = clean(row.State || row.STATE || row["State "] || "");
        const dateValue = clean(row.Date || row.DATE || row["Meeting Date"] || "");
        const raceNo = clean(row["Race No"] || row.RaceNo || row.Race || "");
        const time = getRaceDisplayTime(row);

        const key = `${venue}|${state}|${dateValue}`;

        if (!map.has(key)) {
            map.set(key, {
                venue,
                state,
                dateValue,
                firstTime: time,
                races: new Set(),
                sortTime: timeToMinutes(time),
                sortDate: parseDateToKey(dateValue)
            });
        }

        const meeting = map.get(key);

        if (raceNo) meeting.races.add(raceNo);

        const raceNoClean = raceNo.replace(/^R/i, "").replace(/\.0$/, "");

        if (raceNoClean === "1") {
            meeting.firstTime = time;
        }
    });

    return [...map.values()].sort((a, b) => {
        const dateCompare = (a.sortDate || "9999-99-99").localeCompare(b.sortDate || "9999-99-99");
        if (dateCompare !== 0) return dateCompare;
        return (a.sortTime ?? 99999) - (b.sortTime ?? 99999);
    });
}

function groupMeetingsByDay(meetings) {
    const map = new Map();

    meetings.forEach(m => {
        const key = m.sortDate || "unknown";
        const label = dayLabelFromDateKey(key, m.dateValue);

        if (!map.has(key)) {
            map.set(key, {
                key,
                label,
                meetings: []
            });
        }

        map.get(key).meetings.push(m);
    });

    return [...map.values()].sort((a, b) => {
        return (a.key || "9999-99-99").localeCompare(b.key || "9999-99-99");
    });
}

function uniqueRaceCount(rows) {
    const set = new Set();

    rows.forEach(row => {
        const venue = clean(row.Venue);
        const raceNo = clean(row["Race No"] || row.RaceNo || row.Race || "");
        const dateValue = clean(row.Date || row.DATE || row["Meeting Date"] || "");

        if (venue && raceNo) {
            set.add(`${dateValue}|${venue}|${raceNo}`);
        }
    });

    return set.size;
}

function findNextRace(rows) {
    const withTimes = rows
        .filter(row => clean(row.Venue) && clean(row["Race No"] || row.RaceNo || row.Race || ""))
        .map(row => ({
            ...row,
            _dateKey: parseDateToKey(clean(row.Date || row.DATE || row["Meeting Date"] || "")),
            _timeMinutes: timeToMinutes(clean(row.Time || row.TIME || row["Race Time"] || ""))
        }))
        .sort((a, b) => {
            const dateCompare = (a._dateKey || "9999-99-99").localeCompare(b._dateKey || "9999-99-99");
            if (dateCompare !== 0) return dateCompare;
            return (a._timeMinutes ?? 99999) - (b._timeMinutes ?? 99999);
        });

    return withTimes[0] || null;
}

function countGoodLeaders(rows) {
    return rows.filter(row => {
        const val = parseFloat(String(row["Ld %"] || row["Ld%"] || row["Lead %"] || "").replace("%", ""));
        return !Number.isNaN(val) && val >= 15;
    }).length;
}

function renderMeetings(meetings) {
    const strip = document.getElementById("meetingStrip");

    if (!meetings.length) {
        strip.innerHTML = `<div class="meeting-card">No meetings found.</div>`;
        return;
    }

    strip.innerHTML = meetings.map(m => `
        <div class="meeting-card">
            <div class="meeting-time">${escapeHtml(m.firstTime || "Time TBC")}</div>
            <div class="meeting-venue">
                ${escapeHtml(m.venue)}
                ${m.state ? `<span class="small-state">(${escapeHtml(m.state)})</span>` : ""}
            </div>
            <div class="meeting-meta">
                <span>${m.races.size || "—"} races</span>
                <span class="good-pill">Live</span>
            </div>
        </div>
    `).join("");
}

function isTodayRow(row) {
    const dateValue = clean(row.Date || row.DATE || row["Meeting Date"] || "");
    const key = parseDateToKey(dateValue);

    if (!key) return true;

    return key === todayIso();
}

function parseDateToKey(value) {
    if (!value) return "";

    const raw = String(value).trim();

    // yyyy-mm-dd
    let match = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (match) {
        return `${match[1]}-${pad2(match[2])}-${pad2(match[3])}`;
    }

    // dd/mm/yyyy or dd-mm-yyyy
    match = raw.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
    if (match) {
        return `${match[3]}-${pad2(match[2])}-${pad2(match[1])}`;
    }

    // dd/mm/yy
    match = raw.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})/);
    if (match) {
        return `20${match[3]}-${pad2(match[2])}-${pad2(match[1])}`;
    }

    return "";
}

function dayLabelFromDateKey(key, fallback) {
    const today = todayIso();
    const tomorrow = addDaysIso(1);

    if (key === today) return "TODAY";
    if (key === tomorrow) return "TOMORROW";

    if (!key || key === "unknown") {
        return fallback ? String(fallback).toUpperCase() : "UPCOMING";
    }

    const date = new Date(`${key}T12:00:00`);
    return date.toLocaleDateString("en-AU", { weekday: "long" }).toUpperCase();
}

function timeToMinutes(value) {
    if (!value) return null;

    const raw = String(value).trim().toLowerCase();
    const match = raw.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/);

    if (!match) return null;

    let hour = Number(match[1]);
    const minute = Number(match[2] || 0);
    const suffix = match[3];

    if (suffix === "pm" && hour !== 12) hour += 12;
    if (suffix === "am" && hour === 12) hour = 0;

    return hour * 60 + minute;
}

function setDateLabel() {
    const now = new Date();

    const label = now.toLocaleDateString("en-AU", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric"
    });

    const time = now.toLocaleTimeString("en-AU", {
        hour: "numeric",
        minute: "2-digit"
    });

    document.getElementById("todayLabel").textContent = `${label}   ${time}`;
}

function todayIso() {
    return dateIsoInSydney(0);
}

function addDaysIso(days) {
    return dateIsoInSydney(days);
}

function dateIsoInSydney(offsetDays = 0) {
    const d = new Date();

    d.setDate(d.getDate() + offsetDays);

    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Australia/Sydney",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(d);
}

function parseCSV(text) {
    const rows = [];
    let row = [];
    let field = "";
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const nextChar = text[i + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                // Escaped quote inside a quoted field
                field += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === "," && !inQuotes) {
            row.push(field);
            field = "";
        } else if ((char === "\n" || char === "\r") && !inQuotes) {
            // Handle Windows CRLF as one newline
            if (char === "\r" && nextChar === "\n") {
                i++;
            }

            row.push(field);
            field = "";

            if (row.some(value => value !== "")) {
                rows.push(row);
            }

            row = [];
        } else {
            field += char;
        }
    }

    // Add final field/row
    row.push(field);
    if (row.some(value => value !== "")) {
        rows.push(row);
    }

    if (rows.length < 2) {
        return [];
    }

    const headers = rows[0].map(header => header.trim());

    return rows.slice(1).map(values => {
        const result = {};

        headers.forEach((header, index) => {
            result[header] = values[index] ?? "";
        });

        return result;
    });
}
function splitCSVLine(line) {
    const result = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const next = line[i + 1];

        if (char === '"' && inQuotes && next === '"') {
            current += '"';
            i++;
        } else if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
            result.push(current);
            current = "";
        } else {
            current += char;
        }
    }

    result.push(current);
    return result;
}

function clean(value) {
    return String(value ?? "").trim();
}

function truncateMobileName(value, maxLength = 20) {
    const text = clean(value || "");

    if (text.length <= maxLength) {
        return text;
    }

    return text.slice(0, maxLength - 1).trimEnd() + "…";
}

function pad2(value) {
    return String(value).padStart(2, "0");
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function setupMeetingCalendarButton() {
    const button =
        document.getElementById("meetingCalendarButton") ||
        document.querySelector('[data-action="meeting-calendar"]') ||
        [...document.querySelectorAll(".ghost-button")]
            .find(btn => btn.textContent.toLowerCase().includes("race calendar"));

    if (!button) return;

    button.addEventListener("click", async (e) => {
        e.preventDefault();
        await showMeetingCalendarModal();
    });
}

async function loadMeetingCalendarRows() {
    if (meetingCalendarLoaded) return meetingCalendarRows;

    try {
        const response = await fetch(MEETING_CALENDAR_URL, { cache: "no-store" });

        if (!response.ok) {
            throw new Error(`Could not load ${MEETING_CALENDAR_URL}`);
        }

        const text = await response.text();
        meetingCalendarRows = parseCSV(text);
        meetingCalendarLoaded = true;

        return meetingCalendarRows;
    } catch (error) {
        console.log("Meeting calendar not loaded:", error);
        meetingCalendarRows = [];
        meetingCalendarLoaded = true;
        return [];
    }
}

async function showMeetingCalendarModal() {
    await loadMeetingCalendarRows();

    let modal = document.getElementById("meetingCalendarModal");

    if (!modal) {
        modal = document.createElement("div");
        modal.id = "meetingCalendarModal";
        modal.className = "meeting-calendar-modal";
        document.body.appendChild(modal);
    }

    modal.style.display = "flex";
    renderMeetingCalendarModal();
}

function closeMeetingCalendarModal() {
    const modal = document.getElementById("meetingCalendarModal");
    if (modal) modal.style.display = "none";
}

function renderMeetingCalendarModal() {
    const modal = document.getElementById("meetingCalendarModal");
    if (!modal) return;

    const rows = getFilteredMeetingCalendarRows();
    const grouped = groupMeetingCalendarRows(rows);

    modal.innerHTML = `
        <div class="meeting-calendar-backdrop" onclick="closeMeetingCalendarModal()"></div>

        <div class="meeting-calendar-card">
            <div class="meeting-calendar-header">
                <div>
                    <div class="race-panel-eyebrow">Upcoming schedule</div>
                    <h2>Meeting Calendar</h2>
                </div>

                <button class="meeting-calendar-close" onclick="closeMeetingCalendarModal()">×</button>
            </div>

            <div class="meeting-calendar-controls">
                <div class="driver-state-filter meeting-calendar-state-filter">
                    ${["ALL", "VIC", "NSW", "QLD", "SA", "WA", "TAS"].map(state => `
                        <button class="driver-state-button ${selectedMeetingCalendarState === state ? "selected" : ""}"
                            onclick="setMeetingCalendarStateFilter('${state}')">
                            ${state}
                        </button>
                    `).join("")}
                </div>

                <input
                    class="meeting-calendar-search"
                    type="text"
                    placeholder="Search venue..."
                    value="${escapeHtml(meetingCalendarSearch)}"
                    oninput="setMeetingCalendarSearch(this.value)"
                />
            </div>

            <div class="meeting-calendar-count">
                ${rows.length} meeting${rows.length === 1 ? "" : "s"} found
            </div>

            <div class="meeting-calendar-list">
                ${grouped.length ? grouped.map(renderMeetingCalendarDayGroup).join("") : `
                    <div class="coming-soon-card">
                        <div class="coming-soon-title">No meetings found</div>
                        <p>No calendar meetings match the selected filters.</p>
                    </div>
                `}
            </div>
        </div>
    `;
}

function setMeetingCalendarStateFilter(state) {
    selectedMeetingCalendarState = state;
    renderMeetingCalendarModal();
}

function setMeetingCalendarSearch(value) {
    meetingCalendarSearch = value || "";
    renderMeetingCalendarModal();

    setTimeout(() => {
        const input = document.querySelector(".meeting-calendar-search");
        if (!input) return;

        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
    }, 0);
}

function getFilteredMeetingCalendarRows() {
    const search = meetingCalendarSearch.trim().toLowerCase();

    const rows = (meetingCalendarRows || [])
        .map(row => {
            const dateValue = clean(row.Date || "");
            const venue = clean(row.Venue || "");
            const state = clean(row.State || "").toUpperCase();
            const timeOfDay = clean(row.TimeOfDay || row["Time Of Day"] || "");
            const dateKey = parseMeetingCalendarDateKey(dateValue);

            return {
                dateValue,
                dateKey,
                venue,
                state,
                timeOfDay,
                prizemoney: row.Prizemoney
            };
        })
        .filter(row => row.dateValue && row.venue)

        // Ignore meetings with no prizemoney
        .filter(row => {
            const prizemoney = Number(
                String(row.prizemoney || "")
                    .replace(/[$,]/g, "")
                    .trim()
            );

            return prizemoney > 0;
        })

        // Only today and future dates
        .filter(row => {
            if (!row.dateKey) return false;
            return row.dateKey >= todayIso();
        })

        // State filter
        .filter(row => {
            if (selectedMeetingCalendarState === "ALL") return true;
            return row.state === selectedMeetingCalendarState;
        })

        // Venue search
        .filter(row => {
            if (!search) return true;
            return row.venue.toLowerCase().includes(search);
        });

    const uniqueMeetings = new Map();

    rows.forEach(row => {
        const key = `${row.dateKey}|${row.venue}|${row.state}`;

        if (!uniqueMeetings.has(key)) {
            uniqueMeetings.set(key, row);
        }
    });

    return [...uniqueMeetings.values()]
        .sort((a, b) => {
            const dateDiff = (a.dateKey || "9999-99-99").localeCompare(b.dateKey || "9999-99-99");
            if (dateDiff !== 0) return dateDiff;

            const timeDiff = timeOfDaySortValue(a.timeOfDay) - timeOfDaySortValue(b.timeOfDay);
            if (timeDiff !== 0) return timeDiff;

            return a.venue.localeCompare(b.venue);
        });
}


function parseMeetingCalendarDateKey(value) {
    const raw = clean(value);
    if (!raw) return "";

    const existing = parseDateToKey(raw);
    if (existing && /^\d{4}-\d{2}-\d{2}$/.test(existing)) {
        return existing;
    }

    const monthMap = {
        jan: "01", january: "01",
        feb: "02", february: "02",
        mar: "03", march: "03",
        apr: "04", april: "04",
        may: "05",
        jun: "06", june: "06",
        jul: "07", july: "07",
        aug: "08", august: "08",
        sep: "09", sept: "09", september: "09",
        oct: "10", october: "10",
        nov: "11", november: "11",
        dec: "12", december: "12"
    };

    const match = raw.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);

    if (match) {
        const dd = match[1].padStart(2, "0");
        const mm = monthMap[match[2].toLowerCase()];
        const yyyy = match[3];

        if (mm) return `${yyyy}-${mm}-${dd}`;
    }

    return raw;
}

function timeOfDaySortValue(value) {
    const text = clean(value).toLowerCase();

    if (text.includes("day")) return 1;
    if (text.includes("twilight")) return 2;
    if (text.includes("night")) return 3;

    return 9;
}


function groupMeetingCalendarRows(rows) {
    const map = new Map();

    rows.forEach(row => {
        const key = row.dateKey || row.dateValue;
        const label = formatMeetingCalendarDateHeader(row.dateKey, row.dateValue);

        if (!map.has(key)) {
            map.set(key, {
                key,
                label,
                rows: []
            });
        }

        map.get(key).rows.push(row);
    });

    return [...map.values()].sort((a, b) => {
        return (a.key || "9999-99-99").localeCompare(b.key || "9999-99-99");
    });
}

function formatMeetingCalendarDateHeader(dateKey, fallbackValue) {
    if (!dateKey || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
        return fallbackValue || "";
    }

    const date = new Date(`${dateKey}T12:00:00`);

    return date.toLocaleDateString("en-AU", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

function renderMeetingCalendarDayGroup(group) {
    return `
        <div class="meeting-calendar-day-group">
            <div class="day-heading meeting-calendar-day-heading">
                <span></span>
                <strong>${escapeHtml(group.label)}</strong>
                <span></span>
            </div>

            <div class="meeting-calendar-day-list">
                ${group.rows.map(renderMeetingCalendarRow).join("")}
            </div>
        </div>
    `;
}

function renderMeetingCalendarRow(row) {
    return `
        <div class="meeting-calendar-row">
            <div class="meeting-calendar-venue">
                ${escapeHtml(row.venue)}
                ${row.state ? `<span class="state-pill">${escapeHtml(row.state)}</span>` : ""}
            </div>

            <div class="meeting-calendar-timeofday">
                ${escapeHtml(row.timeOfDay || "TBC")}
            </div>
        </div>
    `;
}

async function loadFirst100Data() {
    try {
        const response = await fetch(FIRST100_URL, { cache: "no-store" });

        if (!response.ok) {
            throw new Error(`Could not load ${FIRST100_URL}`);
        }

        return await response.json();
    } catch (error) {
        console.log("First100 data not loaded:", error);
        return null;
    }
}

function buildFirst100RaceMap(payload) {
    const map = new Map();

    if (!payload || !Array.isArray(payload.meetings)) {
        return map;
    }

    payload.meetings.forEach(meeting => {
        (meeting.races || []).forEach(race => {
            const key = first100RaceKey(
                race.venue || meeting.venue,
                meeting.state,
                meeting.date,
                race.raceNo
            );

            if (key) {
                map.set(key, race);
            }
        });
    });

    return map;
}

function findFirst100Race(venue, state, dateValue, raceNo) {
    if (!first100RaceMap || !first100RaceMap.size) {
        return null;
    }

    return first100RaceMap.get(first100RaceKey(venue, state, dateValue, raceNo)) || null;
}

function first100RaceKey(venue, state, dateValue, raceNo) {
    const v = first100Norm(venue);
    const s = first100Norm(state);
    const d = normaliseDateKey(dateValue);
    const r = cleanRaceNumber(raceNo);

    if (!v || !s || !d || !r) return "";

    return `${s}|${v}|${d}|${r}`;
}

function first100Norm(value) {
    return clean(value || "")
        .toUpperCase()
        .replace(/\s+/g, " ")
        .trim();
}

function renderFirst100RacePanel(race) {
    first100CurrentRace = race;

    setTimeout(() => {
        first100RenderSelectedRace();
    }, 0);

    return `
        <div class="first100-panel">
            <div class="first100-topline">
                <div>
                    <div class="race-panel-eyebrow">First100 / Early Speed</div>
                    <div id="first100RaceTitle" class="first100-title">Loading First100...</div>
                </div>

                <button type="button" id="first100PlayToggle" class="first100-button" onclick="first100PlayDistances()">
                    ▶ Play
                </button>
            </div>

            <div class="first100-controls">
                <div class="first100-control-group">
                    ${["50", "100", "200"].map(distance => `
                        <button type="button"
                            class="first100-button ${first100SelectedDistance === distance ? "selected" : ""}"
                            data-first100-distance="${distance}"
                            onclick="first100SetDistance('${distance}')">
                            ${distance}m
                        </button>
                    `).join("")}
                </div>

                <div class="first100-control-group">
                    ${[
                        ["weighted", "Weighted"],
                        ["med", "Median"],
                        ["fast", "Fastest"],
                        ["avg123", "Avg FR1-3"],
                        ["last5", "Last 5"],
                        ["avg", "Average"]
                    ].map(([value, label]) => `
                        <button type="button"
                            class="first100-button ${first100SelectedMetric === value ? "selected" : ""}"
                            data-first100-metric="${value}"
                            onclick="first100SetMetric('${value}')">
                            ${label}
                        </button>
                    `).join("")}
                </div>
            </div>

            <div id="first100MapContainer" class="first100-map-container">
                <div class="first100-empty">Loading map...</div>
            </div>
        </div>
    `;
}

function first100SetMetric(metric) {
    first100StopPlay();
    first100SelectedMetric = metric;

    document.querySelectorAll("[data-first100-metric]").forEach(button => {
        button.classList.toggle("selected", button.dataset.first100Metric === metric);
    });

    first100RenderSelectedRace();
}

function first100SetDistance(distance) {
    first100StopPlay();
    first100SelectedDistance = distance;

    document.querySelectorAll("[data-first100-distance]").forEach(button => {
        button.classList.toggle("selected", button.dataset.first100Distance === distance);
    });

    first100RenderSelectedRace();
}

function first100RenderSelectedRace() {
    if (!first100CurrentRace) return;

    const title = document.getElementById("first100RaceTitle");
    if (title) {
        title.textContent = `${first100CurrentRace.venue || ""} R${first100CurrentRace.raceNo || ""} — ${first100DistanceTitle()} ${first100MetricTitle()}`;
    }

    first100RenderEarlySpeedMap(first100CurrentRace, first100SelectedDistance);
    first100UpdatePlayButton();
}

function first100CurrentPrefix(distanceOverride = null) {
    return `F${distanceOverride || first100SelectedDistance}`;
}

function first100MetricValueKey(distanceOverride = null) {
    const prefix = first100CurrentPrefix(distanceOverride);

    switch (first100SelectedMetric) {
        case "fast": return `${prefix}Fast`;
        case "avg123": return `${prefix}Avg123`;
        case "last5": return `${prefix}Last5`;
        case "avg": return `${prefix}Avg`;
        case "med": return `${prefix}Med`;
        case "weighted":
        default: return null;
    }
}

function first100MetricQtyKey(distanceOverride = null) {
    const prefix = first100CurrentPrefix(distanceOverride);

    switch (first100SelectedMetric) {
        case "fast": return `${prefix}FastQty`;
        case "avg123": return `${prefix}Avg123Qty`;
        case "last5": return `${prefix}Last5Qty`;
        case "avg": return `${prefix}AvgQty`;
        case "med": return `${prefix}Qty`;
        case "weighted":
        default: return null;
    }
}

function first100WeightedMetric(r, distanceOverride = null) {
    const prefix = first100CurrentPrefix(distanceOverride);

    const components = [
        { value: Number(r[`${prefix}Med`]), weight: 0.30, qty: Number(r[`${prefix}Qty`]) },
        { value: Number(r[`${prefix}Fast`]), weight: 0.10, qty: Number(r[`${prefix}FastQty`]) },
        { value: Number(r[`${prefix}Avg123`]), weight: 0.25, qty: Number(r[`${prefix}Avg123Qty`]) },
        { value: Number(r[`${prefix}Last5`]), weight: 0.25, qty: Number(r[`${prefix}Last5Qty`]) },
        { value: Number(r[`${prefix}Avg`]), weight: 0.10, qty: Number(r[`${prefix}AvgQty`]) }
    ];

    const valid = components.filter(c =>
        Number.isFinite(c.value) &&
        Number.isFinite(c.qty) &&
        c.qty > 0
    );

    if (!valid.length) {
        return { value: NaN, qty: 0 };
    }

    const totalWeight = valid.reduce((sum, c) => sum + c.weight, 0);
    const weightedValue = valid.reduce((sum, c) => sum + (c.value * c.weight), 0) / totalWeight;
    const qty = Math.max(...valid.map(c => c.qty));

    return {
        value: Number(weightedValue.toFixed(2)),
        qty
    };
}

function first100GetMetricForRunner(r, distanceOverride = null) {
    if (first100SelectedMetric === "weighted") {
        return first100WeightedMetric(r, distanceOverride);
    }

    const valueKey = first100MetricValueKey(distanceOverride);
    const qtyKey = first100MetricQtyKey(distanceOverride);

    return {
        value: Number(r[valueKey]),
        qty: Number(r[qtyKey])
    };
}

function first100MetricTitle() {
    switch (first100SelectedMetric) {
        case "weighted": return "Weighted";
        case "fast": return "Fastest";
        case "avg123": return "Average FR1-3";
        case "last5": return "Last 5";
        case "avg": return "Average";
        case "med": return "Median";
        default: return "Weighted";
    }
}

function first100MetricLabel() {
    switch (first100SelectedMetric) {
        case "weighted": return "Weighted";
        case "fast": return "Fast";
        case "avg123": return "Avg FR1-3";
        case "last5": return "Last 5";
        case "avg": return "Avg";
        case "med": return "Med";
        default: return "Weighted";
    }
}

function first100DistanceTitle(distanceOverride = null) {
    return `${distanceOverride || first100SelectedDistance}m`;
}

function first100GetPostX(distanceOverride = null) {
    const d = distanceOverride || first100SelectedDistance;

    switch (d) {
        case "50": return 260;
        case "100": return 520;
        case "200": return 1000;
        default: return 760;
    }
}

function first100ResetMapContainer(html) {
    const container = document.getElementById("first100MapContainer");
    if (!container) return;

    container.innerHTML = html;

    first100CurrentMap = {
        container: null,
        mapEl: null,
        track: null,
        post: null,
        postLabel: null,
        runnersByKey: {}
    };
}

function first100EnsureMapShell() {
    const container = document.getElementById("first100MapContainer");
    if (!container) return;

    if (first100CurrentMap.container === container && first100CurrentMap.mapEl && first100CurrentMap.track) {
        return;
    }

    container.innerHTML = "";

    const mapEl = document.createElement("div");
    mapEl.className = "first100-speed-map";

    mapEl.innerHTML = `
        <div class="first100-map-track">
            <div class="first100-time-board">
                <div class="first100-time-label">400m Pace</div>
                <div class="first100-time-value">--.--</div>
            </div>
            <div class="first100-map-post"></div>
            <div class="first100-map-post-label"></div>
        </div>
    `;

    container.appendChild(mapEl);

    first100CurrentMap = {
        container,
        mapEl,
        track: mapEl.querySelector(".first100-map-track"),
        post: mapEl.querySelector(".first100-map-post"),
        postLabel: mapEl.querySelector(".first100-map-post-label"),
        runnersByKey: {}
    };
}

function first100RunnerKey(r) {
    return `${r.no}__${r.name}`;
}

function first100CreateRunnerElement(r) {
    const el = document.createElement("div");
    el.className = "first100-map-runner";
    el.dataset.runnerKey = first100RunnerKey(r);

    el.innerHTML = `
        <div class="first100-horse-wrap">
            <div class="first100-cloth first100-cloth-${r.no}">${r.no}</div>
            <img class="first100-horse-icon" src="horse.png" alt="">
        </div>
        <div class="first100-tooltip">
            <div class="first100-tooltip-title"></div>
            <div class="first100-tooltip-body first100-pace-line"></div>
            <div class="first100-tooltip-body first100-metric-line"></div>
            <div class="first100-tooltip-body first100-driver-line"></div>
        </div>
    `;

    const tip = el.querySelector(".first100-tooltip");

    el.addEventListener("mouseenter", () => {
        tip.style.display = "block";
        tip.style.left = "78px";
        tip.style.top = "-8px";
    });

    el.addEventListener("mouseleave", () => {
        tip.style.display = "none";
    });

    return el;
}

function first100UpdateRunnerElement(el, r, distanceForTooltip = null) {
    el.classList.toggle("first100-unknown", !r.isKnown);
    el.classList.remove("first100-pace-green", "first100-pace-red", "first100-pace-yellow");

    if (r.isKnown) {
        const paceClass = first100GetPaceClass(r);
        if (paceClass) el.classList.add(paceClass);
    }

    const cloth = el.querySelector(".first100-cloth");
    cloth.className = `first100-cloth first100-cloth-${r.no}`;
    cloth.textContent = r.no;

    el.querySelector(".first100-tooltip-title").textContent = `${r.no}. ${r.name} (${r.barrier})`;

    const ld = first100FormatPct(r.ldPct);
    const bl = first100FormatPct(r.blPct);
    const dth = first100FormatPct(r.dthPct);

    const paceParts = [];
    if (ld) paceParts.push(`Ld ${ld}`);
    if (bl) paceParts.push(`BL ${bl}`);
    if (dth) paceParts.push(`Dth ${dth}`);

    el.querySelector(".first100-pace-line").textContent = paceParts.join(" | ");
    el.querySelector(".first100-metric-line").textContent =
        `${first100DistanceTitle(distanceForTooltip)} ${first100MetricLabel()}: ${r.isKnown ? r.med.toFixed(2) : "-"} (n=${r.qty || 0})`;
    el.querySelector(".first100-driver-line").textContent = `Dr: ${r.driver || "-"}`;

    el.style.left = `${r.displayX}px`;
    el.style.top = `${r.displayY}px`;
}

function first100DisableMapTransitions() {
    Object.values(first100CurrentMap.runnersByKey).forEach(el => {
        el.style.transition = "none";
    });

    if (first100CurrentMap.post) first100CurrentMap.post.style.transition = "none";
    if (first100CurrentMap.postLabel) first100CurrentMap.postLabel.style.transition = "none";
}

function first100RestoreMapTransitions() {
    Object.values(first100CurrentMap.runnersByKey).forEach(el => {
        el.style.transition = "";
    });

    if (first100CurrentMap.post) first100CurrentMap.post.style.transition = "";
    if (first100CurrentMap.postLabel) first100CurrentMap.postLabel.style.transition = "";
}

function first100ComputeRaceLayout(race, distanceOverride) {
    const start = String(race.start || race.Start || "").toUpperCase();

    if (start !== "MOBILE") {
        return { error: "(only mobile-start races shown)" };
    }

    const runners = (race.runners || []).map(r => {
        const metric = first100GetMetricForRunner(r, distanceOverride);

        return {
            no: Number(r["Horse No"] ?? r.no),
            name: r["Horse"] ?? r.name,
            barrier: r["Barrier"] ?? r.barrier,
            driver: r["Driver"] ?? r.driver,
            ldPct: Number(r["LdPct"]),
            blPct: Number(r["BLPct"]),
            dthPct: Number(r["DthPct"]),
            med: metric.value,
            qty: metric.qty
        };
    }).filter(r => r.barrier && r.barrier !== "SCR");

    if (!runners.length) {
        return { error: "(no runners)" };
    }

    const valid = runners.filter(r => Number.isFinite(r.med) && r.qty > 0);
    const hasKnownData = valid.length > 0;

    const PX_PER_METRE = 11;
    const LANE_GAP = 52;
    const UNKNOWN_BACK_MARKER_M = 6;
    const HORSE_WIDTH_PX = 96;
    const SAME_LANE_Y_OFFSET = -14;
    const POST_X = first100GetPostX(distanceOverride);

    const fastest = hasKnownData ? Math.min(...valid.map(r => r.med)) : null;

    const parseBarrier = b => {
        const m = String(b || "").trim().toUpperCase().match(/(FR|SR)(\d+)/);
        return m ? { row: m[1], slot: parseInt(m[2], 10) } : { row: "", slot: null };
    };

    const knownGaps = hasKnownData ? valid.map(r => (r.med - fastest) * 14.5) : [];
    const slowestKnownGap = hasKnownData ? Math.max(...knownGaps) : 0;

    const frMap = {};
    const srList = [];

    runners.forEach(r => {
        const p = parseBarrier(r.barrier);
        r.row = p.row;
        r.slot = p.slot;
        r.isKnown = Number.isFinite(r.med) && r.qty > 0;

        if (hasKnownData) {
            r.rawGap = r.isKnown
                ? (r.med - fastest) * 14.5
                : slowestKnownGap + UNKNOWN_BACK_MARKER_M;
        } else {
            r.rawGap = r.row === "FR" ? 0 : UNKNOWN_BACK_MARKER_M;
        }

        const laneY = (r.slot || 1) * LANE_GAP;
        r.displayY = laneY + SAME_LANE_Y_OFFSET;

        if (r.row === "FR") {
            r.displayX = POST_X - (r.rawGap * PX_PER_METRE);
            frMap[r.slot] = r;
        } else {
            srList.push(r);
        }
    });

    srList.forEach(r => {
        const fr = frMap[r.slot];
        const rawX = POST_X - (r.rawGap * PX_PER_METRE);

        if (fr) {
            const actualGapPx = Math.max(0, (r.rawGap - fr.rawGap) * PX_PER_METRE);
            const requiredBehindPx = HORSE_WIDTH_PX + actualGapPx;

            r.displayX = fr.displayX - requiredBehindPx;
            r.displayY = fr.displayY;
        } else {
            r.displayX = rawX;
        }
    });

    const runnersByKey = {};
    runners.forEach(r => {
        runnersByKey[first100RunnerKey(r)] = r;
    });

    return {
        distance: distanceOverride,
        postX: POST_X,
        runners,
        runnersByKey
    };
}

function first100GetPaceClass(r) {
    const ld = Number(r.ldPct);
    const bl = Number(r.blPct);
    const dth = Number(r.dthPct);

    if (ld >= 15) return "first100-pace-green";
    if (dth >= 15 && ld < 15) return "first100-pace-red";
    if (bl >= 15 && ld < 15 && dth < 15) return "first100-pace-yellow";

    return "";
}

function first100SyncMapToLayout(layout, labelText = null, tooltipDistance = null) {
    first100EnsureMapShell();

    if (!first100CurrentMap.track) return;

    const maxX = Math.max(...layout.runners.map(r => r.displayX));
    const dynamicPostX = maxX + 140;

    first100CurrentMap.post.style.left = `${dynamicPostX}px`;
    first100CurrentMap.post.style.right = "auto";

    first100CurrentMap.postLabel.textContent = labelText || layout.distance;
    first100CurrentMap.postLabel.style.left = `${dynamicPostX}px`;
    first100CurrentMap.postLabel.style.top = "405px";
    first100CurrentMap.postLabel.style.transform = "translateX(-50%)";

    const timeBoard = first100CurrentMap.track.querySelector(".first100-time-board");
    const timeValue = first100CurrentMap.track.querySelector(".first100-time-value");

    if (timeBoard && timeValue && first100CurrentRace) {
        const projectedTime = first100Benchmark400Time(first100CurrentRace, tooltipDistance || layout.distance);

        timeValue.textContent = projectedTime || "--.--";
        timeBoard.style.left = `${dynamicPostX - 52}px`;
        timeBoard.style.top = "-6px";
    }


    const nextKeys = new Set(layout.runners.map(r => first100RunnerKey(r)));

    Object.keys(first100CurrentMap.runnersByKey).forEach(key => {
        if (!nextKeys.has(key)) {
            first100CurrentMap.runnersByKey[key].remove();
            delete first100CurrentMap.runnersByKey[key];
        }
    });

    layout.runners.forEach(r => {
        const key = first100RunnerKey(r);
        let el = first100CurrentMap.runnersByKey[key];

        if (!el) {
            el = first100CreateRunnerElement(r);
            first100CurrentMap.runnersByKey[key] = el;
            first100CurrentMap.track.appendChild(el);
        }

        first100UpdateRunnerElement(el, r, tooltipDistance || layout.distance);
    });
}

function first100RenderEarlySpeedMap(race, distanceOverride) {
    const layout = first100ComputeRaceLayout(race, distanceOverride);

    if (layout.error) {
        first100ResetMapContainer(`<div class="first100-empty">${layout.error}</div>`);
        return;
    }

    first100EnsureMapShell();
    first100RestoreMapTransitions();
    first100SyncMapToLayout(layout, distanceOverride, distanceOverride);
}

function first100InterpolateRunner(a, b, t) {
    return {
        no: a?.no ?? b?.no ?? 0,
        name: a?.name ?? b?.name ?? "",
        barrier: a?.barrier ?? b?.barrier ?? "",
        driver: a?.driver ?? b?.driver ?? "",
        ldPct: a?.ldPct ?? b?.ldPct,
        blPct: a?.blPct ?? b?.blPct,
        dthPct: a?.dthPct ?? b?.dthPct,
        med: t < 0.5 ? (a?.med ?? b?.med) : (b?.med ?? a?.med),
        qty: t < 0.5 ? (a?.qty ?? b?.qty) : (b?.qty ?? a?.qty),
        isKnown: (a?.isKnown ?? false) || (b?.isKnown ?? false),
        displayX: first100Lerp(a?.displayX ?? b?.displayX ?? 0, b?.displayX ?? a?.displayX ?? 0, t),
        displayY: first100Lerp(a?.displayY ?? b?.displayY ?? 0, b?.displayY ?? a?.displayY ?? 0, t)
    };
}

function first100Lerp(a, b, t) {
    return a + (b - a) * t;
}

function first100PlayDistances() {
    if (first100IsPlaying) {
        first100StopPlay();
        return;
    }

    const race = first100CurrentRace;
    if (!race) return;

    const layout50 = first100ComputeRaceLayout(race, "50");
    const layout100 = first100ComputeRaceLayout(race, "100");
    const layout200 = first100ComputeRaceLayout(race, "200");

    if (layout50.error || layout100.error || layout200.error) {
        const msg = layout50.error || layout100.error || layout200.error || "(play unavailable)";
        first100ResetMapContainer(`<div class="first100-empty">${msg}</div>`);
        return;
    }

    first100IsPlaying = true;
    first100UpdatePlayButton();

    if (first100CurrentMap.post) first100CurrentMap.post.style.opacity = "0";
    if (first100CurrentMap.postLabel) first100CurrentMap.postLabel.style.opacity = "0";

    first100SelectedDistance = "50";
    document.querySelectorAll("[data-first100-distance]").forEach(button => {
        button.classList.toggle("selected", button.dataset.first100Distance === first100SelectedDistance);
    });

    const title = document.getElementById("first100RaceTitle");
    if (title) title.textContent = `${race.venue || ""} R${race.raceNo || ""} — Play`;

    first100SyncMapToLayout(layout50, "50", "50");
    first100DisableMapTransitions();

    requestAnimationFrame(() => {
        const SEGMENT_1_MS = 3200;
        const SEGMENT_2_MS = 4200;
        const totalMs = SEGMENT_1_MS + SEGMENT_2_MS;
        const startTs = performance.now();

        function frame(now) {
            if (!first100IsPlaying) return;

            const elapsed = now - startTs;
            let phase;
            let t;

            if (elapsed <= SEGMENT_1_MS) {
                phase = "50-100";
                t = elapsed / SEGMENT_1_MS;
            } else {
                phase = "100-200";
                t = Math.min(1, (elapsed - SEGMENT_1_MS) / SEGMENT_2_MS);
            }

            const runnersByKey = {};
            const allKeys = new Set([
                ...Object.keys(layout50.runnersByKey),
                ...Object.keys(layout100.runnersByKey),
                ...Object.keys(layout200.runnersByKey)
            ]);

            if (phase === "50-100") {
                allKeys.forEach(key => {
                    runnersByKey[key] = first100InterpolateRunner(layout50.runnersByKey[key], layout100.runnersByKey[key], t);
                });

                first100SyncMapToLayout({
                    distance: "100",
                    postX: first100Lerp(layout50.postX, layout100.postX, t),
                    runners: Object.values(runnersByKey),
                    runnersByKey
                }, t < 0.5 ? "50" : "100", t < 0.5 ? "50" : "100");
            } else {
                allKeys.forEach(key => {
                    runnersByKey[key] = first100InterpolateRunner(layout100.runnersByKey[key], layout200.runnersByKey[key], t);
                });

                first100SyncMapToLayout({
                    distance: "200",
                    postX: first100Lerp(layout100.postX, layout200.postX, t),
                    runners: Object.values(runnersByKey),
                    runnersByKey
                }, t < 0.25 ? "100" : "200", t < 0.25 ? "100" : "200");
            }

            if (elapsed < totalMs) {
                first100PlayRaf = requestAnimationFrame(frame);
            } else {
                first100SelectedDistance = "200";
                document.querySelectorAll("[data-first100-distance]").forEach(button => {
                    button.classList.toggle("selected", button.dataset.first100Distance === first100SelectedDistance);
                });

                first100SyncMapToLayout(layout200, "200", "200");
                first100RestoreMapTransitions();
                first100StopPlay();
                first100RenderSelectedRace();
            }
        }

        first100PlayRaf = requestAnimationFrame(frame);
    });
}

function first100StopPlay() {
    if (first100PlayRaf) {
        cancelAnimationFrame(first100PlayRaf);
        first100PlayRaf = null;
    }

    first100IsPlaying = false;

    if (first100CurrentMap.post) first100CurrentMap.post.style.opacity = "1";
    if (first100CurrentMap.postLabel) first100CurrentMap.postLabel.style.opacity = "1";

    first100RestoreMapTransitions();
    first100UpdatePlayButton();
}

function first100UpdatePlayButton() {
    const btn = document.getElementById("first100PlayToggle");
    if (!btn) return;

    btn.textContent = first100IsPlaying ? "Pause" : "▶ Play";
    btn.classList.toggle("selected", first100IsPlaying);
}

function first100FormatPct(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return null;
    return `${Math.round(n)}%`;
}

function first100Benchmark400Time(race, distanceOverride = null) {
    const distance = Number(distanceOverride || first100SelectedDistance);

    if (!race || !Array.isArray(race.runners) || !distance) {
        return "";
    }

    const times = race.runners
        .map(runner => first100GetMetricForRunner(runner, String(distance)).value)
        .filter(value => Number.isFinite(value) && value > 0);

    if (!times.length) {
        return "";
    }

    const fastest = Math.min(...times);
    const projected400 = fastest * (400 / distance);

    return projected400.toFixed(2);
}

function startTimelineRefresh() {
    stopTimelineRefresh();

    const refreshTimeline = async () => {
        try {
            liveResultsRows = await loadLiveResults();

            renderLatestResultsHomeTile();

            const timelineVisible =
                document.querySelector(".panel-heading span:last-child")?.textContent === "Timeline";

            if (timelineVisible) {
                renderTimelineView();
            }
        } catch (err) {
            console.log("Timeline refresh failed", err);
        }
    };

    refreshTimeline();

    timelineRefreshTimer = setInterval(refreshTimeline, 60000);
}

function stopTimelineRefresh() {
    if (timelineRefreshTimer) {
        clearInterval(timelineRefreshTimer);
        timelineRefreshTimer = null;
    }
}

// ============================================================
// POSITION RACE CHARTS — barrier and bell-position statistics
// ============================================================

async function loadPositionChartData() {
    if (positionChartPayload) {
        return positionChartPayload;
    }

    const response = await fetch(
        POSITION_CHART_URL + "?v=" + Date.now(),
        { cache: "no-store" }
    );

    if (!response.ok) {
        throw new Error(
            `Could not load ${POSITION_CHART_URL}`
        );
    }

    positionChartPayload = await response.json();

    return positionChartPayload;
}


async function showPositionRaceChartView() {
    stopTimelineRefresh();
    clearNextUpTimer();
    disposeRaceChart();

    chartRaceSelectedType = "POSITION";

    document.querySelector(".hero").style.display = "none";
    document.querySelector(".dashboard-grid").style.display = "none";
    document.querySelector(".meetings-panel").style.display = "";

    document.querySelector(".panel-heading").innerHTML = `
        <span>📈</span>
        <span>Race Charts</span>
    `;

    document.getElementById("meetingStrip").innerHTML = `
        <div class="race-charts-page">
            <div class="race-charts-intro">
                <div>
                    <div class="race-panel-eyebrow">
                        Historical barrier and race-position analysis
                    </div>

                    <h2 id="positionChartTitle">
                        Barrier Strike Rate
                    </h2>

                    <p id="positionChartDescription">
                        Compare results by barrier draw using a minimum
                        sample of 100 starts for each filtered category.
                    </p>
                </div>

                <div class="race-chart-badge">
                    MINIMUM 100 STARTS
                </div>
            </div>

            <div class="race-chart-controls-card">

                <div class="race-chart-control-group">
                    <label>State</label>

                    <select
                        id="positionChartState"
                        onchange="setPositionChartState(this.value)"
                    >
                        <option value="ALL">
                            All states
                        </option>
                    </select>
                </div>
                <div class="race-chart-control-group">
                    <label>Venue</label>

                    <select
                        id="positionChartVenue"
                        onchange="setPositionChartVenue(this.value)"
                    >
                        <option value="ALL">
                            All venues
                        </option>
                    </select>
                </div>

                <div class="race-chart-control-group">
                    <label>Distance</label>

                    <select
                        id="positionChartDistance"
                        onchange="setPositionChartDistance(this.value)"
                    >
                        <option value="ALL">
                            All distances
                        </option>
                    </select>
                </div>

                <div class="race-chart-control-group">
                    <label>Gait</label>

                    <select
                        id="positionChartGait"
                        onchange="setPositionChartGait(this.value)"
                    >
                        <option value="ALL">
                            All gaits
                        </option>
                    </select>
                </div>

                <div class="race-chart-control-group">
                    <label>Start</label>

                    <select
                        id="positionChartStart"
                        onchange="setPositionChartStart(this.value)"
                    >
                        <option value="ALL">
                            All starts
                        </option>
                    </select>
                </div>

                <div class="race-chart-control-group">
                    <label>Category</label>

                    <select
                        id="positionChartCategory"
                        onchange="setPositionChartCategory(this.value)"
                    >
                        <option value="BARRIER">
                            Barrier
                        </option>

                        <option value="BELL">
                            Bell Position
                        </option>
                    </select>
                </div>

                <div class="race-chart-control-group">
                    <label>Metric</label>

                    <select
                        id="positionChartMetric"
                        onchange="setPositionChartMetric(this.value)"
                    >
                        <option value="STRIKE_RATE">
                            Strike Rate
                        </option>

                        <option value="ROI">
                            ROI
                        </option>

                        <option value="ROI_BSP">
                            ROI (BSP)
                        </option>

                    </select>
                </div>
            </div>

            <div class="race-chart-stage-card">
                <div
                    id="positionChartCanvas"
                    class="race-chart-canvas"
                ></div>

                <div
                    id="positionChartSampleNote"
                    class="position-chart-sample-note"
                ></div>
            </div>

            <div class="race-chart-library">
                <div class="race-chart-library-title">
                    More Race Charts
                </div>

                <div class="race-chart-library-grid">
                    <button
                        type="button"
                        class="race-chart-library-card"
                        onclick="setRaceChartType('DRIVER')"
                    >
                        <span>🏇</span>
                        <strong>Driver Wins Race</strong>
                        <small>From January 2021</small>
                    </button>

                    <button
                        type="button"
                        class="race-chart-library-card"
                        onclick="setRaceChartType('TRAINER')"
                    >
                        <span>🎓</span>
                        <strong>Trainer Wins Race</strong>
                        <small>From January 2021</small>
                    </button>

                    <button
                        type="button"
                        class="race-chart-library-card"
                        onclick="setRaceChartType('HORSE')"
                    >
                        <span>🐎</span>
                        <strong>Horse Wins Race</strong>
                        <small>From January 2021</small>
                    </button>

                    <button
                        type="button"
                        class="race-chart-library-card active"
                        onclick="setRaceChartType('POSITION')"
                    >
                        <span>📊</span>
                        <strong>Barrier & Bell Position</strong>
                        <small>Strike rate and ROI</small>
                    </button>
                </div>
            </div>
        </div>
    `;

    try {
        const payload = await loadPositionChartData();

        populatePositionChartFilters(payload);
        initialisePositionChart();
    } catch (error) {
        console.error(
            "Position chart data failed:",
            error
        );

        document.getElementById(
            "positionChartCanvas"
        ).innerHTML = `
            <div class="coming-soon-card">
                <div class="coming-soon-title">
                    Position chart data unavailable
                </div>

                <p>
                    Make sure position_chart_data.json is in
                    C:\\trotify_dashboard.
                </p>
            </div>
        `;
    }
}


function populatePositionChartFilters(payload) {
    refreshPositionChartFilterOptions();
}

function getPositionChartBaseRows() {
    return positionChartPayload?.records || [];
}


function getUniquePositionValues(rows, field) {
    return [...new Set(
        rows
            .map(row => clean(row[field]))
            .filter(Boolean)
    )].sort((a, b) => {
        if (field === "distance") {
            return Number(a) - Number(b);
        }

        return String(a).localeCompare(String(b));
    });
}


function setPositionSelectOptions(
    selectId,
    values,
    selectedValue,
    allLabel,
    formatter = value => value
) {
    const select = document.getElementById(selectId);
    if (!select) return "ALL";

    const validValues = values.map(String);

    const finalValue =
        selectedValue !== "ALL" &&
        validValues.includes(String(selectedValue))
            ? String(selectedValue)
            : "ALL";

    select.innerHTML = `
        <option value="ALL">${escapeHtml(allLabel)}</option>

        ${values.map(value => `
            <option value="${escapeHtml(String(value))}">
                ${escapeHtml(formatter(value))}
            </option>
        `).join("")}
    `;

    select.value = finalValue;

    return finalValue;
}


function refreshPositionChartFilterOptions() {
    const allRows = getPositionChartBaseRows();

    // STATE
    const states = getUniquePositionValues(
        allRows,
        "state"
    );

    positionChartSelectedState =
        setPositionSelectOptions(
            "positionChartState",
            states,
            positionChartSelectedState,
            "All states",
            value => value
        );

    // VENUE — restricted by State
    let venueRows = allRows;

    if (positionChartSelectedState !== "ALL") {
        venueRows = venueRows.filter(row =>
            clean(row.state).toUpperCase() ===
            positionChartSelectedState
        );
    }

    const venues = getUniquePositionValues(
        venueRows,
        "venue"
    );

    positionChartSelectedVenue =
        setPositionSelectOptions(
            "positionChartVenue",
            venues,
            positionChartSelectedVenue,
            "All venues",
            value => value
        );

    // DISTANCE — restricted by State and Venue
    let distanceRows = venueRows;

    if (positionChartSelectedVenue !== "ALL") {
        distanceRows = distanceRows.filter(row =>
            clean(row.venue) ===
            positionChartSelectedVenue
        );
    }

    const distances = getUniquePositionValues(
        distanceRows,
        "distance"
    );

    positionChartSelectedDistance =
        setPositionSelectOptions(
            "positionChartDistance",
            distances,
            positionChartSelectedDistance,
            "All distances",
            value => `${value}m`
        );

    // GAIT — restricted by State, Venue and Distance
    let gaitRows = distanceRows;

    if (positionChartSelectedDistance !== "ALL") {
        gaitRows = gaitRows.filter(row =>
            String(row.distance) ===
            String(positionChartSelectedDistance)
        );
    }

    const gaits = getUniquePositionValues(
        gaitRows,
        "gait"
    );

    positionChartSelectedGait =
        setPositionSelectOptions(
            "positionChartGait",
            gaits,
            positionChartSelectedGait,
            "All gaits",
            value => toProperCase(value)
        );

    // START — restricted by State, Venue, Distance and Gait
    let startRows = gaitRows;

    if (positionChartSelectedGait !== "ALL") {
        startRows = startRows.filter(row =>
            clean(row.gait).toUpperCase() ===
            positionChartSelectedGait
        );
    }

    const starts = getUniquePositionValues(
        startRows,
        "start"
    );

    positionChartSelectedStart =
        setPositionSelectOptions(
            "positionChartStart",
            starts,
            positionChartSelectedStart,
            "All starts",
            value => toProperCase(value)
        );

    const categorySelect =
        document.getElementById(
            "positionChartCategory"
        );

    const metricSelect =
        document.getElementById(
            "positionChartMetric"
        );

    if (categorySelect) {
        categorySelect.value =
            positionChartSelectedCategory;
    }

    if (metricSelect) {
        metricSelect.value =
            positionChartSelectedMetric;
    }
}


function initialisePositionChart() {
    if (typeof echarts === "undefined") {
        throw new Error("ECharts did not load");
    }

    const canvas =
        document.getElementById(
            "positionChartCanvas"
        );

    if (!canvas) return;

    chartRaceInstance = echarts.init(canvas);

    renderPositionChart();

    window.addEventListener(
        "resize",
        () => chartRaceInstance?.resize(),
        { passive: true }
    );
}


function getFilteredPositionChartRows() {
    let rows =
        positionChartPayload?.records || [];

    if (positionChartSelectedState !== "ALL") {
        rows = rows.filter(row =>
            clean(row.state).toUpperCase() ===
            positionChartSelectedState
        );
    }

    rows = rows.filter(row =>
        clean(row.categoryType).toUpperCase() ===
        positionChartSelectedCategory
    );

    if (positionChartSelectedVenue !== "ALL") {
        rows = rows.filter(row =>
            clean(row.venue) ===
            positionChartSelectedVenue
        );
    }

    if (positionChartSelectedDistance !== "ALL") {
        rows = rows.filter(row =>
            String(row.distance) ===
            String(positionChartSelectedDistance)
        );
    }

    if (positionChartSelectedGait !== "ALL") {
        rows = rows.filter(row =>
            clean(row.gait).toUpperCase() ===
            positionChartSelectedGait
        );
    }

    if (positionChartSelectedStart !== "ALL") {
        rows = rows.filter(row =>
            clean(row.start).toUpperCase() ===
            positionChartSelectedStart
        );
    }

    return combinePositionChartRows(rows);
}

function combinePositionChartRows(rows) {
    const grouped = new Map();

    rows.forEach(row => {
        const category = clean(row.category);

        if (!category) return;

        if (!grouped.has(category)) {
            grouped.set(category, {
                category,

                starts: 0,
                wins: 0,
                spend: 0,
                pnl: 0,

                bspStarts: 0,
                bspWins: 0,
                bspSpend: 0,
                bspPnl: 0
            });
        }

        const item = grouped.get(category);

        item.starts += Number(row.starts) || 0;
        item.wins += Number(row.wins) || 0;
        item.spend += Number(row.spend) || 0;
        item.pnl += Number(row.pnl) || 0;

        item.bspStarts +=
            Number(
                row.bspStarts ??
                row.bsp_starts ??
                0
            ) || 0;

        item.bspWins +=
            Number(
                row.bspWins ??
                row.bsp_wins ??
                0
            ) || 0;

        item.bspSpend +=
            Number(
                row.bspSpend ??
                row.bsp_spend ??
                0
            ) || 0;

        item.bspPnl +=
            Number(
                row.bspPnl ??
                row.bsp_pnl ??
                0
            ) || 0;
    });

    return [...grouped.values()].map(item => ({
        ...item,

        strikeRate:
            item.starts > 0
                ? item.wins / item.starts * 100
                : null,

        roi:
            item.spend > 0
                ? item.pnl / item.spend * 100
                : null,

        bspStrikeRate:
            item.bspStarts > 0
                ? item.bspWins / item.bspStarts * 100
                : null,

        bspRoi:
            item.bspSpend > 0
                ? item.bspPnl / item.bspSpend * 100
                : null
    }));
}


function getPositionChartCategoryOrder(category) {
    const value =
        clean(category).toUpperCase();

    const bellOrder = {
        "LEAD": 0,
        "B/LEAD": 1,
        "3PEGS": 2,
        "4PEGS": 3,
        "5PEGS": 4,
        "6PEGS": 5,
        "DEATH": 6,
        "1X1": 7,
        "1X2": 8,
        "1X3": 9,
        "1X4": 10,
        "1X5": 11,
        "1X6": 12,
        "1X7": 13
    };

    if (
        positionChartSelectedCategory === "BELL"
    ) {
        return [
            bellOrder[value] ?? 999,
            value
        ];
    }

    let match = value.match(/^FR(\d+)$/);

    if (match) {
        return [0, Number(match[1])];
    }

    match = value.match(/^SR(\d+)$/);

    if (match) {
        return [1, Number(match[1])];
    }

    if (value === "FRONT") {
        return [2, 0];
    }

    match = value.match(/^(\d+)M$/);

    if (match) {
        return [2, Number(match[1])];
    }

    return [3, 999];
}


function comparePositionChartCategories(a, b) {
    const orderA =
        getPositionChartCategoryOrder(a.category);

    const orderB =
        getPositionChartCategoryOrder(b.category);

    if (orderA[0] !== orderB[0]) {
        return orderA[0] - orderB[0];
    }

    if (orderA[1] !== orderB[1]) {
        if (
            typeof orderA[1] === "number" &&
            typeof orderB[1] === "number"
        ) {
            return orderA[1] - orderB[1];
        }

        return String(orderA[1]).localeCompare(
            String(orderB[1])
        );
    }

    return a.category.localeCompare(b.category);
}


function renderPositionChart() {
    if (!chartRaceInstance) return;

    const rows =
        getFilteredPositionChartRows();

    rows.sort(comparePositionChartCategories);

    const isStandardRoi =
        positionChartSelectedMetric === "ROI";

    const isBspRoi =
        positionChartSelectedMetric === "ROI_BSP";

    const isAnyRoi =
        isStandardRoi || isBspRoi;

    const chartRows = rows.filter(row => {
        if (isBspRoi) {
            return (
                row.bspStarts >= 100 &&
                Number.isFinite(row.bspRoi)
            );
        }

        if (isStandardRoi) {
            return (
                row.starts >= 100 &&
                Number.isFinite(row.roi)
            );
        }

        return (
            row.starts >= 100 &&
            Number.isFinite(row.strikeRate)
        );
    });

    const categories =
        chartRows.map(row => row.category);

    const values = chartRows.map(row => {
        if (isBspRoi) {
            return Number(row.bspRoi);
        }

        if (isStandardRoi) {
            return Number(row.roi);
        }

        return Number(row.strikeRate);
    });

    updatePositionChartHeading(chartRows);

    if (!chartRows.length) {
        chartRaceInstance.clear();

        const sampleType =
            isBspRoi
                ? "valid BSP starts"
                : "starts";

        chartRaceInstance.setOption({
            title: {
                text:
                    `No categories have at least 100 ${sampleType}`,

                subtext:
                    "Try broadening one or more filters.",

                left: "center",
                top: "middle",

                textStyle: {
                    color: "#f4f7fb",
                    fontSize: 20,
                    fontWeight: 800
                },

                subtextStyle: {
                    color: "#a8b4c0",
                    fontSize: 14
                }
            }
        });

        return;
    }

    const minValue = isAnyRoi
        ? Math.min(...values, 0)
        : 0;

    const maxValue =
        Math.max(...values, 1);

    const padding =
        Math.max(
            Math.abs(minValue),
            Math.abs(maxValue),
            1
        ) * 0.12;

    chartRaceInstance.setOption(
        {
            animationDuration: 450,
            animationDurationUpdate: 450,

            grid: {
                left: 90,
                right: 100,
                top: 30,
                bottom: 55,
                containLabel: true
            },

            tooltip: {
                trigger: "axis",

                axisPointer: {
                    type: "shadow"
                },

                formatter(params) {
                    const index =
                        params?.[0]?.dataIndex ?? 0;

                    const row =
                        chartRows[index];

                    if (!row) return "";

                    const roiText =
                        Number.isFinite(row.roi)
                            ? (
                                `${row.roi > 0 ? "+" : ""}` +
                                `${row.roi.toFixed(1)}%`
                            )
                            : "N/A";

                    const bspRoiText =
                        Number.isFinite(row.bspRoi)
                            ? (
                                `${row.bspRoi > 0 ? "+" : ""}` +
                                `${row.bspRoi.toFixed(1)}%`
                            )
                            : "N/A";

                    return `
                        <strong>${escapeHtml(row.category)}</strong>
                        <br>
                        Starts:
                        ${Math.round(row.starts).toLocaleString("en-AU")}
                        <br>
                        Wins:
                        ${Math.round(row.wins).toLocaleString("en-AU")}
                        <br>
                        Strike rate:
                        ${
                            Number.isFinite(row.strikeRate)
                                ? `${row.strikeRate.toFixed(1)}%`
                                : "N/A"
                        }
                        <br>
                        ROI:
                        ${roiText}
                        <br>
                        <br>
                        BSP starts:
                        ${Math.round(row.bspStarts).toLocaleString("en-AU")}
                        <br>
                        BSP wins:
                        ${Math.round(row.bspWins).toLocaleString("en-AU")}
                        <br>
                        ROI (BSP):
                        ${bspRoiText}
                    `;
                }
            },

            xAxis: {
                type: "value",

                min:
                    isAnyRoi
                        ? Math.floor(minValue - padding)
                        : 0,

                max:
                    Math.ceil(maxValue + padding),

                axisLabel: {
                    color: "#a8b4c0",

                    formatter(value) {
                        return `${value}%`;
                    }
                },

                splitLine: {
                    lineStyle: {
                        color:
                            "rgba(255,255,255,0.07)"
                    }
                },

                axisLine: {
                    lineStyle: {
                        color:
                            "rgba(255,255,255,0.16)"
                    }
                }
            },

            yAxis: {
                type: "category",
                inverse: true,
                data: categories,

                axisLabel: {
                    color: "#f4f7fb",
                    fontWeight: 800,
                    fontSize: 13
                },

                axisTick: {
                    show: false
                },

                axisLine: {
                    show: false
                }
            },

            series: [
                {
                    type: "bar",

                    data: chartRows.map(row => {
                        let value = row.strikeRate;

                        if (isStandardRoi) {
                            value = row.roi;
                        }

                        if (isBspRoi) {
                            value = row.bspRoi;
                        }

                        return {
                            value,

                            itemStyle: {
                                color:
                                    getRaceChartColour(
                                        row.category
                                    ),

                                borderRadius:
                                    [0, 6, 6, 0]
                            }
                        };
                    }),

                    barMaxWidth: 34,

                    label: {
                        show: true,
                        position: "right",
                        color: "#f4f7fb",
                        fontWeight: 900,

                        formatter(params) {
                            const value =
                                Number(params.value) || 0;

                            return (
                                `${isAnyRoi && value > 0 ? "+" : ""}` +
                                `${value.toFixed(1)}%`
                            );
                        }
                    }
                }
            ]
        },
        true
    );
}


function updatePositionChartHeading(rows) {
    const title =
        document.getElementById(
            "positionChartTitle"
        );

    const description =
        document.getElementById(
            "positionChartDescription"
        );

    const note =
        document.getElementById(
            "positionChartSampleNote"
        );

    const categoryLabel =
        positionChartSelectedCategory === "BELL"
            ? "Bell Position"
            : "Barrier";

    let metricLabel = "Strike Rate";

    if (positionChartSelectedMetric === "ROI") {
        metricLabel = "ROI";
    }

    if (positionChartSelectedMetric === "ROI_BSP") {
        metricLabel = "ROI (BSP)";
    }

    const isBspRoi =
        positionChartSelectedMetric === "ROI_BSP";

    if (title) {
        title.textContent =
            `${categoryLabel} ${metricLabel}`;
    }

    if (description) {
        description.textContent =
            `Compare ${categoryLabel.toLowerCase()} results ` +
            `using the selected state, venue, distance, gait ` +
            `and start filters. Categories require at least ` +
            `100 ${isBspRoi ? "valid BSP starts" : "starts"} ` +
            `after filtering.`;
    }

    if (note) {
        const totalStarts = rows.reduce(
            (sum, row) => {
                const starts = isBspRoi
                    ? Number(row.bspStarts) || 0
                    : Number(row.starts) || 0;

                return sum + starts;
            },
            0
        );

        note.textContent =
            `${rows.length} categories shown • ` +
            `${totalStarts.toLocaleString("en-AU")} ` +
            `${isBspRoi ? "combined BSP starts" : "combined starts"}`;
    }
}


function setPositionChartState(value) {
    positionChartSelectedState =
        clean(value).toUpperCase() || "ALL";

    positionChartSelectedVenue = "ALL";
    positionChartSelectedDistance = "ALL";
    positionChartSelectedGait = "ALL";
    positionChartSelectedStart = "MOBILE";

    refreshPositionChartFilterOptions();
    renderPositionChart();
}


function setPositionChartVenue(value) {
    positionChartSelectedVenue =
        value || "ALL";

    positionChartSelectedDistance = "ALL";
    positionChartSelectedGait = "ALL";
    positionChartSelectedStart = "MOBILE";

    refreshPositionChartFilterOptions();
    renderPositionChart();
}


function setPositionChartDistance(value) {
    positionChartSelectedDistance =
        value || "ALL";

    positionChartSelectedGait = "ALL";
    positionChartSelectedStart = "MOBILE";

    refreshPositionChartFilterOptions();
    renderPositionChart();
}


function setPositionChartGait(value) {
    positionChartSelectedGait =
        clean(value).toUpperCase() || "ALL";

    positionChartSelectedStart = "MOBILE";

    refreshPositionChartFilterOptions();
    renderPositionChart();
}


function setPositionChartStart(value) {
    positionChartSelectedStart =
        clean(value).toUpperCase() || "ALL";

    refreshPositionChartFilterOptions();
    renderPositionChart();
}


function setPositionChartCategory(value) {
    positionChartSelectedCategory =
        clean(value).toUpperCase() || "BARRIER";

    renderPositionChart();
}


function setPositionChartMetric(value) {
    positionChartSelectedMetric =
        clean(value).toUpperCase() ||
        "STRIKE_RATE";

    renderPositionChart();
}

// ============================================================
// RACE CHARTS — animated historical leaderboards
// ============================================================

async function loadChartRaceData() {
    if (chartRacePayload) return chartRacePayload;

    const response = await fetch(
        CHART_RACE_URL + "?v=" + Date.now(),
        { cache: "no-store" }
    );

    if (!response.ok) {
        throw new Error(`Could not load ${CHART_RACE_URL}`);
    }

    chartRacePayload = await response.json();
    return chartRacePayload;
}

function stopRaceChartAnimation() {
    if (chartRaceTimer) {
        cancelAnimationFrame(chartRaceTimer);
        clearTimeout(chartRaceTimer);
        chartRaceTimer = null;
    }

    chartRacePlaying = false;

    const button = document.getElementById("raceChartPlayButton");

    if (button) {
        button.textContent = "▶ Play";
    }
}

function startDroughtFramePlayback() {
    const frames = buildFilteredRaceChartFrames();

    if (
        !chartRacePlaying ||
        chartRaceFrameIndex >= frames.length - 1
    ) {
        stopRaceChartAnimation();
        return;
    }

    chartRaceFrameIndex += 1;

    renderRaceChartFrame(
        chartRaceFrameIndex
    );

    const slider =
        document.getElementById("raceChartSlider");

    if (slider) {
        slider.value =
            chartRaceFrameIndex;
    }

    if (
        chartRaceFrameIndex >=
        frames.length - 1
    ) {
        chartRaceFinished = true;
        stopRaceChartAnimation();
        return;
    }

    chartRaceTimer =
        window.setTimeout(
            startDroughtFramePlayback,
            120
        );
}

function startSmoothRaceChartSegment() {
    const frames = buildFilteredRaceChartFrames();

    if (
        !chartRacePlaying ||
        chartRaceFrameIndex >= frames.length - 1
    ) {
        stopRaceChartAnimation();
        return;
    }

    const horseSocialMode =
        RACE_CHART_SOCIAL_MODE &&
        chartRaceSelectedType === "HORSE";

    const droughtMode =
        chartRaceSelectedType === "DROUGHT";

    const frameStep =
        horseSocialMode
            ? 3
            : 1;

    const nextFrameIndex =
        Math.min(
            chartRaceFrameIndex + frameStep,
            frames.length - 1
        );

    const fromFrame =
        frames[chartRaceFrameIndex];

    const toFrame =
        frames[nextFrameIndex];

    const segmentStart =
        performance.now();

    const segmentDuration =
        droughtMode
            ? Math.max(
                70,
                Math.round(chartRaceSpeedMs / 18)
            )
            : horseSocialMode
                ? 650
                : chartRaceSpeedMs;


    function animateSegment(now) {
        if (!chartRacePlaying) return;

        const elapsed = now - segmentStart;
        const rawProgress = Math.min(
            elapsed / segmentDuration,
            1
        );

        const easedProgress = smoothRaceChartEase(
            rawProgress
        );

        renderInterpolatedRaceChartFrame(
            fromFrame,
            toFrame,
            easedProgress
        );

        if (rawProgress < 1) {
            chartRaceTimer =
                requestAnimationFrame(animateSegment);
            return;
        }

        chartRaceFrameIndex = nextFrameIndex;

        const previousTopThreeNames = new Set(
            (fromFrame.values || [])
                .slice(0, 3)
                .map(item => item.name)
        );

        const visibleResetEvents =
            chartRaceSelectedType === "DROUGHT"
                ? (toFrame.resetEvents || []).filter(event =>
                    previousTopThreeNames.has(event.name)
                )
                : [];

        const droughtWasBroken =
            visibleResetEvents.length > 0;

        if (droughtWasBroken) {
            triggerDroughtExplosion({
                ...toFrame,
                resetEvents: visibleResetEvents
            });
        }

        const slider =
            document.getElementById("raceChartSlider");

        if (slider) {
            slider.value = chartRaceFrameIndex;
        }

        if (
            chartRaceFrameIndex >=
            frames.length - 1
        ) {
            chartRaceFinished = true;

            renderRaceChartFrame(
                chartRaceFrameIndex
            );

            stopRaceChartAnimation();
            return;
        }

        if (droughtWasBroken) {
            chartRaceTimer = window.setTimeout(
            startSmoothRaceChartSegment,
            1500
        );
    } else {
        startSmoothRaceChartSegment();
    }
    }

    chartRaceTimer =
        requestAnimationFrame(animateSegment);
}


function triggerDroughtExplosion(frame) {
    const events = Array.isArray(frame?.resetEvents)
        ? frame.resetEvents
        : [];

    if (!events.length) return;

    const strongest = events[0];
    const key = [
        frame.period,
        chartRaceDroughtEntity,
        strongest.name,
        strongest.previousValue
    ].join("|");

    if (key === chartRaceLastExplosionKey) return;
    chartRaceLastExplosionKey = key;

    const overlay =
        document.getElementById("raceChartExplosion");

    if (!overlay) return;

    overlay.innerHTML = `
        <div class="race-chart-explosion-burst"></div>
        <div class="race-chart-explosion-copy">
            <strong>💥 DROUGHT BROKEN</strong>
            <span>${escapeHtml(strongest.name)}</span>
            <small>${Number(strongest.previousValue || 0).toLocaleString("en-AU")} outs before winning</small>
        </div>
    `;

    overlay.classList.remove("show");
    void overlay.offsetWidth;
    overlay.classList.add("show");

    window.setTimeout(() => {
        overlay.classList.remove("show");
    }, 1500);
}

function smoothRaceChartEase(progress) {
    return progress;
}

function getRaceChartLeaderEffects(top) {
    const leader =
        top && top.length
            ? String(top[0].name || "")
            : "";

    const now = performance.now();

    if (
        RACE_CHART_SOCIAL_MODE &&
        leader &&
        chartRaceLastLeader &&
        leader !== chartRaceLastLeader
    ) {
        chartRaceLeaderPulseUntil = now + 800;
    }

    if (leader) {
        chartRaceLastLeader = leader;
    }

    return {
        leader,
        pulseActive:
            RACE_CHART_SOCIAL_MODE &&
            now < chartRaceLeaderPulseUntil,

        finished:
            RACE_CHART_SOCIAL_MODE &&
            chartRaceFinished
    };
}

function disposeRaceChart() {
    stopRaceChartAnimation();

    if (chartRaceInstance) {
        chartRaceInstance.dispose();
        chartRaceInstance = null;
    }
}

async function showRaceChartsView() {
    stopTimelineRefresh();
    clearNextUpTimer();
    disposeRaceChart();

    document.querySelector(".hero").style.display = "none";
    document.querySelector(".dashboard-grid").style.display = "none";
    document.querySelector(".meetings-panel").style.display = "";

    document.querySelector(".panel-heading").innerHTML = `
        <span>📈</span>
        <span>Race Charts</span>
    `;

    document.getElementById("meetingStrip").innerHTML = `
        <div class="race-charts-page">
            <div class="race-charts-intro">
                <div>
                    <div class="race-panel-eyebrow">
                        Animated historical leaderboards
                    </div>

                    <h2 id="raceChartTitle">
                        ${getRaceChartTitle()}
                    </h2>

                    <p id="raceChartDescription">
                        ${RACE_CHART_SOCIAL_MODE
                            ? ""
                            : getRaceChartDescription()}
                    </p>
                </div>

                <div class="race-chart-badge" id="raceChartBadge">
                    ${getRaceChartBadge()}
                </div>
            </div>

            <div class="race-chart-controls-card">
                <div class="race-chart-control-group">
                    <label>State</label>

                    <select
                        id="raceChartStateFilter"
                        onchange="setRaceChartState(this.value)"
                    >
                        <option value="ALL">All states</option>
                    </select>
                </div>

                <div class="race-chart-control-group">
                    <label>Gait</label>

                    <select
                        id="raceChartGaitFilter"
                        onchange="setRaceChartGait(this.value)"
                    >
                        <option value="ALL">All gaits</option>
                    </select>
                </div>

                <div
                    class="race-chart-control-group"
                    id="raceChartDroughtTypeGroup"
                    style="${chartRaceSelectedMetric === "DROUGHT" ? "" : "display:none"}"
                >
                    <label>Type</label>

                    <select
                        id="raceChartDroughtType"
                        onchange="setRaceChartDroughtEntity(this.value)"
                    >
                        <option value="DRIVER" ${chartRaceDroughtEntity === "DRIVER" ? "selected" : ""}>Drivers</option>
                        <option value="TRAINER" ${chartRaceDroughtEntity === "TRAINER" ? "selected" : ""}>Trainers</option>
                        <option value="HORSE" ${chartRaceDroughtEntity === "HORSE" ? "selected" : ""}>Horses</option>
                    </select>
                </div>

                <div class="race-chart-control-group">
                    <label>Metric</label>

                    <select
                        id="raceChartMetric"
                        onchange="setRaceChartMetric(this.value)"
                    >
                        ${getRaceChartMetricOptions()}
                    </select>
                </div>

                <div class="race-chart-control-group">
                    <label>Bars</label>

                    <select
                        id="raceChartTopN"
                        onchange="setRaceChartTopN(this.value)"
                    >
                        <option value="10">Top 10</option>
                        <option value="12" selected>Top 12</option>
                        <option value="15">Top 15</option>
                    </select>
                </div>

                <div class="race-chart-control-group">
                    <label>Speed</label>

                    <select
                        id="raceChartSpeed"
                        onchange="setRaceChartSpeed(this.value)"
                    >
                        <option value="4000">Slow</option>
                        <option value="2600" selected>Normal</option>
                        <option value="100">Fast</option>
                    </select>
                </div>

                <div class="race-chart-actions">
                    <button
                        id="raceChartPlayButton"
                        onclick="toggleRaceChartPlay()"
                    >
                        ▶ Play
                    </button>

                    <button onclick="restartRaceChart()">
                        ↺ Restart
                    </button>
                </div>
            </div>

            <div class="race-chart-stage-card">
                <div
                    class="race-chart-period"
                    id="raceChartPeriod"
                >
                    Loading…
                </div>

                <div
                    id="raceChartCanvas"
                    class="race-chart-canvas"
                ></div>

                <div
                    id="raceChartExplosion"
                    class="race-chart-explosion"
                    aria-hidden="true"
                ></div>

                <div class="race-chart-slider-row">
                    <input
                        id="raceChartSlider"
                        type="range"
                        min="0"
                        max="0"
                        value="0"
                        oninput="setRaceChartFrame(this.value)"
                    >

                    <span id="raceChartProgress">—</span>
                </div>
            </div>

            <div class="race-chart-library">
                <div class="race-chart-library-title">
                    More Race Charts
                </div>

                <div class="race-chart-library-grid">
                    <button
                        type="button"
                        class="race-chart-library-card ${
                            chartRaceSelectedType === "DRIVER"
                                ? "active"
                                : ""
                        }"
                        onclick="setRaceChartType('DRIVER')"
                    >
                        <span>🏇</span>
                        <strong>Driver Wins Race</strong>
                        <small>From January 2021</small>
                    </button>

                    <button
                        type="button"
                        class="race-chart-library-card ${
                            chartRaceSelectedType === "TRAINER"
                                ? "active"
                                : ""
                        }"
                        onclick="setRaceChartType('TRAINER')"
                    >
                        <span>🎓</span>
                        <strong>Trainer Wins Race</strong>
                        <small>From January 2021</small>
                    </button>

                    <button
                        type="button"
                        class="race-chart-library-card ${
                            chartRaceSelectedType === "HORSE"
                                ? "active"
                                : ""
                        }"
                        onclick="setRaceChartType('HORSE')"
                    >
                        <span>🐎</span>
                        <strong>Horse Wins Race</strong>
                        <small>From January 2021</small>
                    </button>

                    <button
                        type="button"
                        class="race-chart-library-card ${
                            chartRaceSelectedType === "DROUGHT"
                                ? "active"
                                : ""
                        }"
                        onclick="setRaceChartType('DROUGHT')"
                    >
                        <span>🌵</span>
                        <strong>Droughts</strong>
                        <small>Starts since last win</small>
                    </button>

                               <button
                                   type="button"
                                   class="race-chart-library-card ${
                                       chartRaceSelectedType === "POSITION"
                                           ? "active"
                                           : ""
                                   }"
                                   onclick="setRaceChartType('POSITION')"
                               >
                                   <span>📊</span>
                                   <strong>Barrier & Bell Position</strong>
                                   <small>Strike rate and ROI</small>
                               </button>

                </div>
            </div>
        </div>
    `;

    try {
        const payload = await loadChartRaceData();

        populateRaceChartFilters(payload);
        initialiseRaceChart();

        if (RACE_CHART_SOCIAL_MODE) {
            restartRaceChart();

            setTimeout(() => {
                if (!chartRacePlaying) {
                    toggleRaceChartPlay();
                }
            }, 3000);
        }
    } catch (error) {
        console.error("Race chart data failed:", error);

        document.getElementById("raceChartCanvas").innerHTML = `
            <div class="coming-soon-card">
                <div class="coming-soon-title">
                    Race chart data unavailable
                </div>

                <p>
                    Make sure chart_race_data.json is in the
                    Trotify dashboard folder.
                </p>
            </div>
        `;

        document.getElementById("raceChartPeriod").textContent =
            "Unable to load";
    }
}

function populateRaceChartFilters(payload) {
    const stateSelect =
        document.getElementById("raceChartStateFilter");

    const gaitSelect =
        document.getElementById("raceChartGaitFilter");

    const states = payload?.metadata?.states || [];
    const gaits = payload?.metadata?.gaits || [];

    if (stateSelect) {
        stateSelect.innerHTML = `
            <option value="ALL">All states</option>

            ${states.map(state => `
                <option value="${escapeHtml(state)}">
                    ${escapeHtml(state)}
                </option>
            `).join("")}
        `;

        stateSelect.value = chartRaceSelectedState;
    }

    if (gaitSelect) {
        gaitSelect.innerHTML = `
            <option value="ALL">All gaits</option>

            ${gaits.map(gait => `
                <option value="${escapeHtml(gait)}">
                    ${escapeHtml(toProperCase(gait))}
                </option>
            `).join("")}
        `;

        gaitSelect.value = chartRaceSelectedGait;
    }
}

function buildFilteredRaceChartFrames() {
    if (chartRaceSelectedType === "DROUGHT") {
        const state = chartRaceSelectedState || "ALL";
        const gait = chartRaceSelectedGait || "ALL";
        const key = `${state}|${gait}`;

        return (
            chartRacePayload?.droughtFrames?.[chartRaceDroughtEntity]?.[key]
            || chartRacePayload?.droughtFrames?.[chartRaceDroughtEntity]?.["ALL|ALL"]
            || []
        );
    }


    const records = chartRacePayload?.monthlyRecords || [];

    if (!records.length) {
        return (
            chartRacePayload
                ?.defaultFrames
                ?.[chartRaceSelectedType]
                ?.[chartRaceSelectedMetric]
            || []
        );
    }

    const selectedType =
        clean(chartRaceSelectedType).toUpperCase();

    const selectedMetric =
        clean(chartRaceSelectedMetric).toUpperCase();

    const typeRecords = records.filter(row =>
        clean(row.entityType).toUpperCase() ===
        selectedType
    );

    const periods = [
        ...new Set(
            typeRecords
                .map(row =>
                    clean(row.Period || row.period)
                )
                .filter(Boolean)
        )
    ].sort();

    const cumulative = new Map();

    return periods.map(period => {
        typeRecords
            .filter(row => {
                const rowPeriod =
                    clean(row.Period || row.period);

                const stateOk =
                    chartRaceSelectedState === "ALL" ||
                    clean(row.state).toUpperCase() ===
                        chartRaceSelectedState;

                const gaitOk =
                    chartRaceSelectedGait === "ALL" ||
                    clean(row.gait).toUpperCase() ===
                        chartRaceSelectedGait;

                return (
                    rowPeriod === period &&
                    stateOk &&
                    gaitOk
                );
            })
            .forEach(row => {
                const entity = clean(row.entity);

                if (!entity) return;

                const current =
                    cumulative.get(entity) || {
                        starts: 0,
                        wins: 0,
                        spend: 0,
                        profit: 0
                    };

                current.starts +=
                    Number(row.starts || 0);

                current.wins +=
                    Number(row.wins || 0);

                current.spend +=
                    Number(row.spend || 0);

                current.profit +=
                    Number(row.profit || 0);

                cumulative.set(entity, current);
            });

        const values = [];

        cumulative.forEach((stats, name) => {
            let value = 0;

            if (selectedMetric === "WINS") {
                value = stats.wins;

                if (value <= 0) return;
            }

            if (selectedMetric === "STRIKE_RATE") {
                if (stats.starts < 100) return;

                value = stats.starts > 0
                    ? stats.wins / stats.starts * 100
                    : 0;
            }

            if (selectedMetric === "ROI") {
                if (stats.starts < 100) return;

                value = stats.spend > 0
                    ? stats.profit / stats.spend * 100
                    : 0;
            }

            values.push({
                name,
                value,
                starts: stats.starts,
                wins: stats.wins,
                spend: stats.spend,
                profit: stats.profit
            });
        });

        values.sort((a, b) =>
            b.value - a.value ||
            a.name.localeCompare(b.name)
        );

        const date = new Date(
            period + "-01T00:00:00"
        );

        const label = date.toLocaleDateString(
            "en-AU",
            {
                month: "long",
                year: "numeric"
            }
        );

        return {
            period,
            label,
            metric: selectedMetric,
            values
        };
    });
}

function initialiseRaceChart() {
    chartRaceLastLeader = "";
    chartRaceLeaderPulseUntil = 0;
    chartRaceFinished = false;

    if (typeof echarts === "undefined") {
        throw new Error("ECharts did not load");
    }

    const canvas =
        document.getElementById("raceChartCanvas");

    if (!canvas) return;

    chartRaceInstance = echarts.init(canvas);

    const frames = buildFilteredRaceChartFrames();

    // Droughts open on the latest daily standings.
    // Other race charts continue to open at the beginning.
    chartRaceFrameIndex =
        chartRaceSelectedType === "DROUGHT"
            ? Math.max(0, frames.length - 1)
            : 0;

    const slider =
        document.getElementById("raceChartSlider");

    if (slider) {
        slider.max = Math.max(0, frames.length - 1);
        slider.value = chartRaceFrameIndex;
    }

    renderRaceChartFrame(chartRaceFrameIndex);

    window.addEventListener(
        "resize",
        () => chartRaceInstance?.resize(),
        { passive: true }
    );
}

function formatRaceChartSocialName(value, isLeader = false) {
    const name = String(value || "").trim();

    if (!RACE_CHART_SOCIAL_MODE) {
        return name;
    }

    const parts = name.split(/\s+/);

    let formattedName = name;

    if (parts.length >= 2) {
        const firstName = parts.shift();
        const surname = parts.join(" ");

        formattedName = `${firstName}\n${surname}`;
    }

    return isLeader
        ? `🏆 ${formattedName}`
        : formattedName;
}

function getRaceChartColour(name) {
    const palette = [
        "#35c9a5",
        "#4dabf7",
        "#ffb84d",
        "#c77dff",
        "#ff6b6b",
        "#5dd39e",
        "#ffd166",
        "#748ffc",
        "#f783ac",
        "#38d9a9",
        "#ffa94d",
        "#91a7ff",
        "#e599f7",
        "#66d9e8",
        "#ff8787",
        "#a9e34b"
    ];

    const text = String(name || "").trim().toUpperCase();

    let hash = 0;

    for (let i = 0; i < text.length; i++) {
        hash = ((hash << 5) - hash) + text.charCodeAt(i);
        hash |= 0;
    }

    return palette[Math.abs(hash) % palette.length];
}

function renderRaceChartFrame(index) {
    const frames = buildFilteredRaceChartFrames();

    if (!frames.length || !chartRaceInstance) {
        return;
    }

    chartRaceFrameIndex = Math.max(
        0,
        Math.min(
            Number(index),
            frames.length - 1
        )
    );

    const frame = frames[chartRaceFrameIndex];

    const top = frame.values
        .slice(0, chartRaceTopN);

    const leaderEffects =
        getRaceChartLeaderEffects(top);

    const values =
        top.map(item => Number(item.value) || 0);

    const minValue =
        chartRaceSelectedMetric === "ROI"
            ? Math.min(...values, 0)
            : 0;

    const maxValue =
        Math.max(...values, 1);

    const axisPadding =
        Math.max(
            Math.abs(minValue),
            Math.abs(maxValue),
            1
        ) * 0.12;

    chartRaceInstance.setOption(
        {
            animation:
                chartRaceSelectedType !== "DROUGHT",

            animationDuration:
                chartRaceSelectedType === "DROUGHT"
                    ? 0
                    : 300,

            animationDurationUpdate:
                chartRaceSelectedType === "DROUGHT"
                    ? 0
                    : 500,

            animationEasingUpdate: "cubicInOut",

            grid: RACE_CHART_SOCIAL_MODE
                ? {
                    top: 12,
                    right: 55,
                    bottom: 10,
                    left: 185,
                    containLabel: false
                }
                : {
                    top: 18,
                    right: 70,
                    bottom: 18,
                    left: 190,
                    containLabel: false
                },

            xAxis: {
                min:
                    chartRaceSelectedMetric === "ROI"
                        ? Math.floor(minValue - axisPadding)
                        : 0,

                max: Math.ceil(maxValue + axisPadding),

                splitLine: {
                    show: false
                },

                axisLine: {
                    show: false
                },

                axisTick: {
                    show: false
                },

                axisLabel: {
                    show: false
                }
            },

            yAxis: {
                type: "category",
                inverse: true,
                data: top.map(item => item.name),

                axisLine: {
                    show: false
                },

                axisTick: {
                    show: false
                },

                axisLabel: {
                    color: "#f4f7fb",
                    fontSize: RACE_CHART_SOCIAL_MODE ? 17 : 14,
                    fontWeight: 850,
                    width: RACE_CHART_SOCIAL_MODE ? 172 : 170,
                    overflow: "truncate",
                    align: "right",
                    lineHeight: RACE_CHART_SOCIAL_MODE ? 20 : 18,
                    margin: RACE_CHART_SOCIAL_MODE ? 10 : 8,

                    formatter: value => {
                        return formatRaceChartSocialName(
                            value,
                            value === leaderEffects.leader
                        );
                    }
                },

                animationDuration:
                    chartRaceSelectedType === "DROUGHT"
                        ? 0
                        : 300,

                animationDurationUpdate:
                    chartRaceSelectedType === "DROUGHT"
                        ? 0
                        : 500
            },

            series: [
                {
                    id: "raceChartBars",
                    realtimeSort: true,
                    type: "bar",

                    data: top.map(item => {
                        const isLeader =
                            item.name ===
                            leaderEffects.leader;

                        const dimmed =
                            leaderEffects.finished &&
                            !isLeader;

                        const highlighted =
                            isLeader &&
                            (
                                leaderEffects.pulseActive ||
                                leaderEffects.finished
                            );

                        return {
                            name: item.name,
                            value: item.value,

                            itemStyle: {
                                color:
                                    getRaceChartColour(
                                        item.name
                                    ),

                                opacity:
                                    dimmed
                                        ? 0.32
                                        : 1,

                                borderRadius:
                                    [0, 8, 8, 0],

                                borderColor:
                                    highlighted
                                        ? "#ffd166"
                                        : "transparent",

                                borderWidth:
                                    highlighted
                                        ? 3
                                        : 0,

                                shadowColor:
                                    highlighted
                                        ? "rgba(255, 209, 102, 0.95)"
                                        : "transparent",

                                shadowBlur:
                                    leaderEffects.finished &&
                                    isLeader
                                        ? 24
                                        : highlighted
                                            ? 18
                                            : 0
                            }
                        };
                    }),

                    barWidth: "62%",

                    label: {
                        show: true,
                        position: "right",
                        color: "#f4f7fb",
                        fontSize:
                            RACE_CHART_SOCIAL_MODE
                                ? 20
                                : 15,

                        fontWeight: 900,
                        valueAnimation:
                            chartRaceSelectedType !== "DROUGHT",

                        formatter: params =>
                            formatRaceChartValue(
                                params.value
                            )
                    },

                    universalTransition:
                        chartRaceSelectedType !== "DROUGHT"
                }
            ]
        },
        false
    );

    const periodEl =
        document.getElementById(
            "raceChartPeriod"
        );

    if (periodEl) {
        periodEl.textContent =
            RACE_CHART_SOCIAL_MODE
                ? frame.label.toUpperCase()
                : frame.label;
    }

    const progressEl =
        document.getElementById(
            "raceChartProgress"
        );

    if (progressEl) {
        progressEl.textContent =
            `${chartRaceFrameIndex + 1} / ${frames.length}`;
    }

    const slider =
        document.getElementById(
            "raceChartSlider"
        );

    if (slider) {
        slider.value =
            chartRaceFrameIndex;
    }
}

function renderInterpolatedRaceChartFrame(
    fromFrame,
    toFrame,
    progress
) {
    if (!chartRaceInstance) return;

    const fromMap = new Map(
        (fromFrame.values || []).map(item => [
            item.name,
            Number(item.value) || 0
        ])
    );

    const toMap = new Map(
        (toFrame.values || []).map(item => [
            item.name,
            Number(item.value) || 0
        ])
    );

    const allNames = new Set([
        ...fromMap.keys(),
        ...toMap.keys()
    ]);

    const interpolated =
        [...allNames].map(name => {
            const startValue =
                fromMap.get(name) || 0;

            const endValue =
                toMap.get(name) || 0;

            return {
                name,

                value:
                    startValue +
                    (
                        endValue -
                        startValue
                    ) * progress
            };
        });

    interpolated.sort((a, b) => {
        const valueDiff =
            b.value - a.value;

        if (
            Math.abs(valueDiff) >
            0.0001
        ) {
            return valueDiff;
        }

        return a.name.localeCompare(
            b.name
        );
    });

    const top = interpolated
        .slice(0, chartRaceTopN);

    const leaderEffects =
        getRaceChartLeaderEffects(top);

    const values =
        top.map(item =>
            Number(item.value) || 0
        );

    const minValue =
        chartRaceSelectedMetric === "ROI"
            ? Math.min(...values, 0)
            : 0;

    const maxValue =
        Math.max(...values, 1);

    const axisPadding =
        Math.max(
            Math.abs(minValue),
            Math.abs(maxValue),
            1
        ) * 0.12;

    chartRaceInstance.setOption(
        {
            animation: false,

            xAxis: {
                min:
                    chartRaceSelectedMetric === "ROI"
                        ? Math.floor(
                            minValue -
                            axisPadding
                        )
                        : 0,

                max:
                    Math.ceil(
                        maxValue +
                        axisPadding
                    ),

                splitLine: {
                    show: false
                },

                axisLine: {
                    show:
                        chartRaceSelectedMetric ===
                        "ROI",

                    lineStyle: {
                        color:
                            "rgba(255,255,255,0.28)",

                        width: 1
                    }
                }
            },

            yAxis: {
                inverse: true,

                data:
                    top.map(
                        item => item.name
                    ),

                axisLabel: {
                    color: "#f4f7fb",
                    fontSize: RACE_CHART_SOCIAL_MODE ? 17 : 14,
                    fontWeight: 850,
                    width: RACE_CHART_SOCIAL_MODE ? 172 : 170,
                    overflow: "truncate",
                    align: "right",
                    lineHeight: RACE_CHART_SOCIAL_MODE ? 20 : 18,
                    margin: RACE_CHART_SOCIAL_MODE ? 10 : 8,

                    formatter: value => {
                        return formatRaceChartSocialName(
                            value,
                            value === leaderEffects.leader
                        );
                    }
                }
            },

            series: [
                {
                    id: "raceChartBars",

                    data: top.map(item => {
                        const isLeader =
                            item.name ===
                            leaderEffects.leader;

                        const highlighted =
                            isLeader &&
                            leaderEffects.pulseActive;

                        return {
                            name: item.name,
                            value: item.value,

                            itemStyle: {
                                color:
                                    getRaceChartColour(
                                        item.name
                                    ),

                                opacity: 1,

                                borderRadius:
                                    [0, 8, 8, 0],

                                borderColor:
                                    highlighted
                                        ? "#ffd166"
                                        : "transparent",

                                borderWidth:
                                    highlighted
                                        ? 3
                                        : 0,

                                shadowColor:
                                    highlighted
                                        ? "rgba(255, 209, 102, 0.95)"
                                        : "transparent",

                                shadowBlur:
                                    highlighted
                                        ? 18
                                        : 0
                            }
                        };
                    }),

                    label: {
                        formatter: params =>
                            formatRaceChartValue(
                                params.value
                            )
                    }
                }
            ]
        },
        false,
        true
    );

    const periodEl =
        document.getElementById(
            "raceChartPeriod"
        );

    if (periodEl) {
        const periodLabel =
            progress < 0.5
                ? fromFrame.label
                : toFrame.label;

        periodEl.textContent =
            RACE_CHART_SOCIAL_MODE
                ? periodLabel.toUpperCase()
                : periodLabel;
    }

    const progressEl =
        document.getElementById(
            "raceChartProgress"
        );

    if (progressEl) {
        const frames =
            buildFilteredRaceChartFrames();

        progressEl.textContent =
            `${chartRaceFrameIndex + 1} / ${frames.length}`;
    }
}

function toggleRaceChartPlay() {
    if (chartRacePlaying) {
        stopRaceChartAnimation();
        return;
    }

    const frames =
        buildFilteredRaceChartFrames();

    if (frames.length < 2) return;

    if (
        chartRaceFrameIndex >=
        frames.length - 1
    ) {
        chartRaceFrameIndex = 0;

        chartRaceLastLeader = "";
        chartRaceLeaderPulseUntil = 0;
        chartRaceFinished = false;

        renderRaceChartFrame(0);
    }

    chartRacePlaying = true;

    const button =
        document.getElementById(
            "raceChartPlayButton"
        );

    if (button) {
        button.textContent = "Ⅱ Pause";
    }

    if (
        chartRaceSelectedType ===
        "DROUGHT"
    ) {
        startDroughtFramePlayback();
    } else {
        startSmoothRaceChartSegment();
    }
}

function restartRaceChart() {
    stopRaceChartAnimation();

    chartRaceLastLeader = "";
    chartRaceLeaderPulseUntil = 0;
    chartRaceFinished = false;

    renderRaceChartFrame(0);
}

function setRaceChartFrame(value) {
    stopRaceChartAnimation();

    chartRaceFrameIndex = Number(value) || 0;

    renderRaceChartFrame(chartRaceFrameIndex);
}

function setRaceChartState(state) {
    chartRaceSelectedState =
        clean(state).toUpperCase() || "ALL";

    // The Horse chart can retain its previous rendered leaderboard.
    // Rebuild the full chart view so the selected State is applied
    // to a fresh ECharts instance.
    if (chartRaceSelectedType === "HORSE") {
        showRaceChartsView();
        return;
    }

    resetRaceChartForFilter();
}

function setRaceChartGait(gait) {
    chartRaceSelectedGait = gait || "ALL";
    resetRaceChartForFilter();
}

function setRaceChartTopN(value) {
    chartRaceTopN = Number(value) || 12;

    renderRaceChartFrame(
        chartRaceFrameIndex
    );
}

function setRaceChartSpeed(value) {
    chartRaceSpeedMs = Number(value) || 2600;

    if (chartRacePlaying) {
        stopRaceChartAnimation();
        toggleRaceChartPlay();
    }
}

function resetRaceChartForFilter() {
    stopRaceChartAnimation();

    const frames =
        buildFilteredRaceChartFrames();

    chartRaceFrameIndex =
        chartRaceSelectedType === "DROUGHT"
            ? Math.max(0, frames.length - 1)
            : 0;

    const slider =
        document.getElementById("raceChartSlider");

    if (slider) {
        slider.max =
            Math.max(0, frames.length - 1);

        slider.value =
            chartRaceFrameIndex;
    }

    // Remove any previous animated series before
    // drawing the newly filtered leaderboard.
    if (chartRaceInstance) {
        chartRaceInstance.clear();
    }

    renderRaceChartFrame(
        chartRaceFrameIndex
    );
}

function getRaceChartTitle() {
    if (chartRaceSelectedType === "DROUGHT") {
        const entity = chartRaceDroughtEntity === "TRAINER"
            ? "TRAINER"
            : "DRIVER";
        return `🌵 ${entity} WIN DROUGHTS`;
    }

    const entity =
        chartRaceSelectedType === "TRAINER"
            ? "Trainer"
            : chartRaceSelectedType === "HORSE"
                ? "Horse"
                : "Driver";

    return `🏆 ${entity.toUpperCase()} ${getRaceChartMetricLabel().toUpperCase()}`;
}

function getRaceChartMetricOptions() {
    if (chartRaceSelectedType === "DROUGHT") {
        return `
            <option value="DROUGHT" selected>
                Starts Since Last Win
            </option>
        `;
    }

    if (chartRaceSelectedType === "HORSE") {
        return `
            <option value="WINS" selected>
                Wins
            </option>
        `;
    }

    return `
        <option
            value="WINS"
            ${chartRaceSelectedMetric === "WINS"
                ? "selected"
                : ""}
        >
            Wins
        </option>

        <option
            value="STRIKE_RATE"
            ${chartRaceSelectedMetric === "STRIKE_RATE"
                ? "selected"
                : ""}
        >
            Strike Rate
        </option>

        <option
            value="ROI"
            ${chartRaceSelectedMetric === "ROI"
                ? "selected"
                : ""}
        >
            ROI
        </option>
    `;
}

function getRaceChartMetricLabel() {
    if (chartRaceSelectedMetric === "DROUGHT") {
        return "Win Droughts";
    }

    if (chartRaceSelectedMetric === "STRIKE_RATE") {
        return "Strike Rate";
    }

    if (chartRaceSelectedMetric === "ROI") {
        return "ROI";
    }

    return "Wins";
}

function getRaceChartBadge() {
    if (chartRaceSelectedMetric === "DROUGHT") {
        const minimumStarts =
            chartRaceDroughtEntity === "HORSE"
                ? 10
                : 100;

        return `ROLLING 12 MONTHS • MIN ${minimumStarts} STARTS`;
    }

    if (chartRaceSelectedMetric === "STRIKE_RATE") {
        return "CUMULATIVE SR • MIN 100 STARTS";
    }

    if (chartRaceSelectedMetric === "ROI") {
        return "CUMULATIVE ROI • MIN 100 STARTS";
    }

    return "CUMULATIVE WINS";
}

function formatRaceChartValue(value) {
    const number = Number(value) || 0;

    if (chartRaceSelectedMetric === "WINS") {
        return Math.round(number).toLocaleString("en-AU");
    }

    if (chartRaceSelectedMetric === "DROUGHT") {
        return `${Math.round(number).toLocaleString("en-AU")} outs`;
    }

    const prefix =
        chartRaceSelectedMetric === "ROI" &&
        number > 0
            ? "+"
            : "";

    return `${prefix}${number.toFixed(1)}%`;
}

function updateRaceChartHeadings() {
    const title =
        document.getElementById("raceChartTitle");

    const description =
        document.getElementById(
            "raceChartDescription"
        );

    const badge =
        document.getElementById("raceChartBadge");

    if (title) {
        title.textContent = RACE_CHART_SOCIAL_MODE
            ? `🏆 ${getRaceChartTitle().toUpperCase()}`
            : getRaceChartTitle();
    }

    if (description) {
        description.textContent = RACE_CHART_SOCIAL_MODE
            ? ""
            : getRaceChartDescription();
    }

    if (badge) {
        badge.textContent = getRaceChartBadge();
    }

    const droughtMode =
        chartRaceSelectedType === "DROUGHT";

    const playButton =
        document.getElementById("raceChartPlayButton");

    if (playButton) {
        playButton.style.display = "";
    }

    const speedSelect =
        document.getElementById("raceChartSpeed");

    const speedGroup =
        speedSelect?.closest(
            ".race-chart-control-group"
        );

    if (speedGroup) {
        speedGroup.style.display =
            droughtMode ? "none" : "";
    }

    const explosionOverlay =
        document.getElementById(
            "raceChartExplosion"
        );

    if (explosionOverlay) {
        explosionOverlay.classList.remove("show");
        explosionOverlay.innerHTML = "";
        explosionOverlay.style.display =
            droughtMode ? "none" : "";
    }
    }

function getRaceChartDescription() {
    if (chartRaceSelectedType === "DROUGHT") {
        const isHorse =
            chartRaceDroughtEntity === "HORSE";

        const entity =
            chartRaceDroughtEntity === "TRAINER"
                ? "trainers"
                : isHorse
                    ? "horses"
                    : "drivers";

        const minimumStarts =
            isHorse ? 20 : 100;

        return (
            `View active ${entity} with at least ${minimumStarts} starts in the ` +
            "rolling previous 12 months ranked by consecutive starts since " +
            "their last win. Use Play or the date slider to inspect exact daily values."
        );
    }

    const entity =
        chartRaceSelectedType === "TRAINER"
            ? "trainers"
            : chartRaceSelectedType === "HORSE"
                ? "horses"
                : "drivers";

    if (chartRaceSelectedMetric === "STRIKE_RATE") {
        return (
            `Watch leading ${entity} move through the ` +
            "cumulative strike-rate rankings after reaching " +
            "a minimum sample of 100 starts."
        );
    }

    if (chartRaceSelectedMetric === "ROI") {
        return (
            `Watch leading ${entity} move through the ` +
            "cumulative ROI rankings after reaching " +
            "a minimum sample of 100 starts."
        );
    }

    return (
        `Watch Australia’s leading ${entity} move through ` +
        "the cumulative win rankings month by month " +
        "from January 2021."
    );
}

function setRaceChartType(type) {
    const requestedType =
        clean(type).toUpperCase() || "DRIVER";

    if (requestedType === "POSITION") {
        stopRaceChartAnimation();
        chartRaceSelectedType = "POSITION";
        showPositionRaceChartView();
        return;
    }

    if (requestedType === "DROUGHT") {
        stopRaceChartAnimation();
        chartRaceSelectedType = "DROUGHT";
        chartRaceSelectedMetric = "DROUGHT";
        chartRaceFrameIndex = 0;
        showRaceChartsView();
        return;
    }

    if (chartRaceSelectedType === "POSITION") {
        chartRaceSelectedType = requestedType;

        if (chartRaceSelectedType === "HORSE") {
            chartRaceSelectedMetric = "WINS";
        }

        showRaceChartsView();
        return;
    }

    stopRaceChartAnimation();

    chartRaceSelectedType =
        clean(type).toUpperCase() || "DRIVER";

    if (chartRaceSelectedMetric === "DROUGHT") {
        chartRaceSelectedMetric = "WINS";
    }

    if (chartRaceSelectedType === "HORSE") {
        chartRaceSelectedMetric = "WINS";
    }

    chartRaceFrameIndex = 0;

    const title =
        document.getElementById("raceChartTitle");

    const description =
        document.getElementById(
            "raceChartDescription"
        );

    updateRaceChartHeadings();

    const metricSelect =
        document.getElementById("raceChartMetric");

    if (metricSelect) {
        metricSelect.innerHTML =
            getRaceChartMetricOptions();

        metricSelect.value =
            chartRaceSelectedMetric;

        metricSelect.disabled =
            chartRaceSelectedType === "DROUGHT";
    }

    const droughtTypeGroup =
        document.getElementById("raceChartDroughtTypeGroup");

    if (droughtTypeGroup) {
        droughtTypeGroup.style.display =
            chartRaceSelectedType === "DROUGHT"
                ? ""
                : "none";
    }

    document
        .querySelectorAll(
            ".race-chart-library-card"
        )
        .forEach(card => {
            card.classList.remove("active");
        });

    const cards =
        document.querySelectorAll(
            ".race-chart-library-card"
        );

    const activeCard = [...cards].find(card =>
        card.getAttribute("onclick") ===
        `setRaceChartType('${chartRaceSelectedType}')`
    );

    activeCard?.classList.add("active");

    const frames =
        buildFilteredRaceChartFrames();

    const slider =
        document.getElementById(
            "raceChartSlider"
        );

    if (slider) {
        slider.max =
            Math.max(0, frames.length - 1);

        slider.value = 0;
    }

    renderRaceChartFrame(0);
}




function setRaceChartDroughtEntity(entity) {
    stopRaceChartAnimation();

    const requestedEntity =
        clean(entity).toUpperCase();

    chartRaceDroughtEntity =
        ["DRIVER", "TRAINER", "HORSE"].includes(
            requestedEntity
        )
            ? requestedEntity
            : "DRIVER";

    chartRaceFrameIndex = 0;

    updateRaceChartHeadings();
    resetRaceChartForFilter();
}


function setRaceChartMetric(metric) {
    stopRaceChartAnimation();

    chartRaceSelectedMetric =
        clean(metric).toUpperCase() || "WINS";

    if (
        chartRaceSelectedType === "HORSE" &&
        chartRaceSelectedMetric !== "WINS"
    ) {
        chartRaceSelectedMetric = "WINS";
    }

    chartRaceFrameIndex = 0;

    updateRaceChartHeadings();
    resetRaceChartForFilter();
}

let spotifyIframeAPI = null;
let spotifyEmbedController = null;
let activeMediaEndSeconds = null;
let activeMediaStopped = false;

window.onSpotifyIframeApiReady = function (IFrameAPI) {
    spotifyIframeAPI = IFrameAPI;
};

function openRaceMedia(mediaID) {
    const media = raceMediaRows.find(
        row => String(row.MediaID) === String(mediaID)
    );

    if (!media) {
        console.error("Race media not found:", mediaID);
        return;
    }

    if (!clean(media.URL).includes("open.spotify.com")) {
        window.open(media.URL, "_blank", "noopener");
        return;
    }

    const existing = document.getElementById("raceMediaPopup");
    if (existing) existing.remove();

    document.body.insertAdjacentHTML("beforeend", `
        <div class="hra-popup-overlay race-media-popup-overlay"
            id="raceMediaPopup"
            onclick="closeRaceMedia()">

            <div class="hra-popup"
                onclick="event.stopPropagation()">

                <div class="hra-popup-header">
                    <h3>${escapeHtml(media.Title || "Race Preview")}</h3>

                    <button onclick="closeRaceMedia()">✕</button>
                </div>

                <div class="hra-popup-body">
                    <div id="spotifyRaceMediaEmbed"></div>
                </div>
            </div>
        </div>
    `);

    activeMediaEndSeconds = media.EndSeconds;
    activeMediaStopped = false;

    createSpotifyRaceMediaPlayer(media);
}

function createSpotifyRaceMediaPlayer(media) {
    if (!spotifyIframeAPI) {
        console.error("Spotify iframe API is not ready.");
        return;
    }

    const element = document.getElementById(
        "spotifyRaceMediaEmbed"
    );

    if (!element) return;

    spotifyIframeAPI.createController(
        element,
        {
            width: "100%",
            height: 152,
            url: media.URL
        },
        controller => {
            spotifyEmbedController = controller;

            const startSeconds =
                Number(media.StartSeconds) || 0;

            let seekConfirmed = startSeconds === 0;
            let seekAttempts = 0;
            const maxSeekAttempts = 4;

            function applyStartPosition() {
                if (seekConfirmed) return;
                if (seekAttempts >= maxSeekAttempts) return;

                seekAttempts += 1;

                console.log(
                    `Spotify seek attempt ${seekAttempts}:`,
                    startSeconds
                );

                // Spotify seek() expects seconds.
                controller.seek(startSeconds);
            }

            controller.addListener("ready", () => {
                /*
                 * Begin playback so the episode becomes active.
                 * Seeking immediately on "ready" is not always accepted.
                 */
                controller.play();

                // First fallback attempt once the player has had time to load.
                setTimeout(applyStartPosition, 300);
            });

            controller.addListener("playback_started", () => {
                /*
                 * This is generally a more reliable moment to seek,
                 * because Spotify has now started the episode.
                 */
                applyStartPosition();
            });

            controller.addListener(
                "playback_update",
                event => {
                    const positionSeconds =
                        Number(event?.data?.position || 0) / 1000;

                    /*
                     * Confirm that Spotify actually reached approximately
                     * the requested starting position.
                     */
                    if (
                        !seekConfirmed &&
                        Math.abs(positionSeconds - startSeconds) <= 3
                    ) {
                        seekConfirmed = true;

                        console.log(
                            "Spotify seek confirmed:",
                            positionSeconds
                        );
                    }

                    /*
                     * Spotify sometimes ignores the first seek while the
                     * episode is still loading. Try again if it remains
                     * well before the requested position.
                     */
                    if (
                        !seekConfirmed &&
                        startSeconds > 5 &&
                        positionSeconds < startSeconds - 3
                    ) {
                        setTimeout(applyStartPosition, 250);
                    }

                    /*
                     * Stop at the beginning of the next race segment.
                     */
                    if (
                        activeMediaStopped ||
                        activeMediaEndSeconds == null
                    ) {
                        return;
                    }

                    if (
                        positionSeconds >= activeMediaEndSeconds
                    ) {
                        activeMediaStopped = true;
                        controller.pause();
                    }
                }
            );
        }
    );
}

function closeRaceMedia() {
    if (spotifyEmbedController) {
        spotifyEmbedController.pause();
        spotifyEmbedController.destroy();
        spotifyEmbedController = null;
    }

    activeMediaEndSeconds = null;
    activeMediaStopped = false;

    document.getElementById("raceMediaPopup")?.remove();
}

