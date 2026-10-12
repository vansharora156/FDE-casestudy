# MoveInSync | Play Store Rating Turnaround Strategy & Intelligence Suite
> **Candidate Case Study Submission — Forward Deployed Engineer (Intern to FTE)**  
> **Target:** MoveInSync Technology Solutions  
> **Dataset:** 3,368+ Classified Real Google Play Store Reviews (`com.moveinsync.ets`)

---

## 🚀 Executive Summary

MoveInSync transports over **1.5 million enterprise employees daily** across 430+ enterprise customers. While the Play Store displays a cumulative lifetime rating of **4.64★ across 114k+ reviews**, recent releases in 2026 revealed an acute rating drop:
- **2026 Run-Rate Score:** **3.75★** (*-0.89 drop* across 2026 updates).
- **Incoming 1-Star Ratio:** **25.8%** (More than 1 in 4 active reviewers giving 1 star).
- **Negative Review Reply Rate:** **18.4%** (81.6% of dissatisfied riders receive no response).

Because Google Play algorithmically weights the most recent 30–90 days for regional store rankings, this decline directly impacts enterprise trust and procurement.

This repository contains the complete empirical data audit, root-cause extraction, sprint-by-sprint engineering specifications, an interactive executive dashboard, and a continuous monitoring pipeline.

---

## 📁 Repository Structure

```
├── MoveInSync_PlayStore_Turnaround_Strategy.md  # Primary submission: Full strategy, root causes, & P0/P1/P2 roadmap
├── Methodology_and_Tooling.md                  # Methodology note: Scraper, NLP classification, tools & assumptions
├── dashboard/                                  # Executive Interactive Web Application
│   ├── index.html                              # Standalone dashboard with dark-mode glassmorphic UI
│   ├── styles.css                              # Custom CSS design system
│   ├── app.js                                  # Interactive charts, review filters, and turnaround simulator
│   └── data.js                                 # Bundled 250+ review explorer dataset (zero-dependency / offline-ready)
├── scripts/                                    # Automated Production Pipeline
│   ├── playstore_pipeline.py                   # Automated scraper & NLP classification engine
│   ├── export_dashboard_data.py                # Dashboard data exporter
│   ├── benchmark_competitors.py                # Benchmark scraper (Safetrax, Routematic)
│   ├── summarize_findings.py                   # Terminal analytics summary
│   ├── inspect_recent_neg.py                   # Chronological negative review inspector
│   └── inspect_driver_reviews.py               # Partner driver review inspector
└── data/                                       # Scraped & Classified Datasets
    ├── moveinsync_classified_reviews.csv       # 3,368 reviews tagged with stage, category, and sentiment
    └── moveinsync_analysis.json                # Summary aggregations, monthly trends, and version health
```

---

## ⚡ The 8-Stage Commute Journey & Root Causes

Every negative rating corresponds directly to a failure point in the employee commute lifecycle:

| Stage | Friction % | Core User Pain | Direct Employee Review Quote |
| :--- | :---: | :--- | :--- |
| **1. Live Tracking & ETA** | **11.3%** | Map auto-resets zoom every 30s; cabs hidden if >1h away; ETA 3x lower than Google Maps | *"ETA calculator is an abstract joke where 1-hour delay is considered punctual."* |
| **2. App Stability & OS** | **9.1%** | Launch crash loop after app updates; users must uninstall & reinstall | *"Whenever I update this app, I cannot open it again. I need to uninstall and reinstall."* |
| **3. Onboarding & Roster** | **8.1%** | Frequent forced logouts; session dropped when switching WiFi to 4G | *"Pathetic. It logs out every single time. When running late for my cab, I have to re-login!"* |
| **4. Self-Booking Flow** | **7.6%** | Single-day calendar; waitlist ambiguity; phantom "trip not booked" push alerts | *"Your update books you without informing if you're on waitlist. Keeps sending alerts saying trip not booked!"* |
| **5. Boarding & Rating Gate** | **5.3%** | **Mandatory post-ride rating popup with NO skip button**; seatbelt modal blocks OTP | *"Forcing me to give rating after every ride, so I came here to give 1 star. If I don't rate, I can't use the app!"* |
| **6. Driver Conduct** | **4.8%** | Inability to call driver at critical times; driver rash driving; AC refused | *"Could not call bus driver at critical time, app said policy does not allow calling. Missed the bus!"* |
| **7. Routing & Detours** | **3.4%** | Aggressive pooling causes 2-hour detours for 15 km direct distance | *"MoveOutSync doesn't plan commutes; it plans cross-country pilgrimages."* |
| **8. Support & Desk** | **2.5%** | In-app complaint tickets closed without resolution | *"Transport management very bad, closed my complaint ticket without any response."* |

---

## 🛠️ Prioritized Engineering Roadmap

### Sprint 1 (Days 1 – 14): Critical Blockers (P0)
- **[P0.1] Rating Gate Unblock & Google In-App Review API:** Add `Skip` button to rating dialog; integrate `ReviewManagerFactory` to prompt satisfied riders (>=3 consecutive 5★ rides) on Google Play, and route dissatisfied riders (<=3★) directly to internal support tickets. *(Expected Impact: +0.35★)*
- **[P0.2] SQLite Migration Crash Safe Guard:** Wrap Room migrations in try/catch fallback; automatically purge corrupted cache on upgrade failure instead of crashing. *(Expected Impact: +0.25★)*
- **[P0.3] Unblock OTP Reveal:** Remove "Seatbelt Safety" modal intercepting the "View OTP" button. Render OTP within 50ms. *(Expected Impact: +0.15★)*
- **[P0.4] Keystore Token Persistence:** Store OAuth refresh tokens in `EncryptedSharedPreferences`; synchronized token renewal with exponential backoff. *(Expected Impact: +0.20★)*

### Sprint 2 (Days 15 – 30): Experience & Telemetry Quality (P1)
- **[P1.1] Map Camera Decoupling & 120-Min Horizon:** Pause auto-recenter when user interacts with map; extend vehicle tracking window to 120 mins; integrate real-time traffic matrices into ETA.
- **[P1.2] Multi-Day Roster Calendar & Waitlist Transparency:** Enable 5-day bookings in <= 3 taps; display clear "Waitlist Rank #X" cards; deduplicate cutoff pushes.
- **[P1.3] Closed-Loop In-App Helpdesk:** In-app ticket lifecycle with automatic transport supervisor escalation if cab delayed >15 mins.

### Sprint 3 (Days 31 – 60): Routing Fairness & Public SLA (P2)
- **[P2.1] Detour Ratio Cap (1.35x Direct Travel Time):** Hard constraint in VRP routing solver to eliminate 2-hour pooling detours.
- **[P2.2] 12-Hour Google Play Developer Response SLA:** Webhook pipeline syncing 100% of negative reviews to Zendesk with direct outreach to resolve issues and request rating updates.

---

## 📈 Projected Rating Recovery Model

$$\text{Current: } \mathbf{3.75★} \xrightarrow{\text{Sprint 1 (Day 14)}} \mathbf{4.05★} \xrightarrow{\text{Sprint 2 (Day 30)}} \mathbf{4.25★} \xrightarrow{\text{Sprint 3 (Day 60)}} \mathbf{4.42★} \xrightarrow{\text{Target (Day 90)}} \mathbf{4.56★}$$

1. **Eliminating 1-Stars:** Fixing the rating hostage modal and post-update crash removes **~65–72% of monthly 1-star reviews**.
2. **Generating 5-Stars:** The In-App Review API prompts the silent satisfied majority (1.5M daily riders), generating **300–500 organic 5-star reviews per month**.

---

## 💻 How to Run the Project Locally

### 1. View the Interactive Dashboard
Simply double-click or open `dashboard/index.html` in any modern web browser. It is zero-dependency and runs completely offline or via a local server:
```bash
# Optional local HTTP server
python -m http.server 8000 --directory dashboard
# Open http://localhost:8000 in your browser
```

### 2. Run the Review Scraping & Classification Pipeline
```bash
# Scrape the latest reviews and update analysis
python scripts/playstore_pipeline.py

# Summarize findings in terminal
python scripts/summarize_findings.py
```

---

## 👤 Author
- **Case Study:** Forward Deployed Engineer (FDE) Candidate Assignment — MoveInSync
