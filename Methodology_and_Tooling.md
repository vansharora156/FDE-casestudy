# Methodology and Tooling Note
**MoveInSync Play Store Rating Turnaround Assignment**  
**Role:** Forward Deployed Engineer (Intern to FTE) Candidate  
**Date:** October 2026  

---

## 1. Overview & Data Philosophy

In accordance with the assignment guidelines:
- *“We haven't prepared any data for you. Everything you need is publicly available.”*
- *“Use any tools you like, AI included.”*
- *“‘How are our Play Store ratings?’ - this is a question we'll keep asking from time to time. It is not a one-time ask.”*
- *“Reasonable assumptions, clearly stated, are fine.”*

Rather than relying on anecdotal feedback or guesswork, we engineered a **reproducible, end-to-end data pipeline** that scrapes, cleans, classifies, and visualizes real public Google Play Store data.

---

## 2. Tools & Technologies Used

| Tool / Technology | Purpose in Project |
| :--- | :--- |
| **Python 3.12.10** | Core scripting language for data extraction, NLP classification, and analytics |
| **`google-play-scraper` (v1.2.7)** | Official Node/Python port for interacting with Google Play Store public API |
| **Pandas (v2.2.3)** | Tabular data manipulation, version aggregation, and temporal time-series trend analysis |
| **Regex & Heuristic NLP Classifier** | Multidimensional classification engine mapping user text to the 8 Commute Journey Stages |
| **Vanilla HTML5, CSS3, & Modern JavaScript (ES6)** | High-performance, zero-dependency executive web dashboard with dark-mode glassmorphic aesthetics |
| **Google In-App Review API Specification** | Android architectural framework for smart sentiment-gated rating generation |
| **Playwright / Browser Automation** | Verification and headless testing of interactive dashboard UI |

---

## 3. Data Collection Methodology

### 3.1 Targeted Applications
1. **Primary Commute App:** `com.moveinsync.ets` (MoveInSync Employee App - 114,880 total ratings, 23,624 reviews)
2. **Companion Driver App:** `com.moveinsync.driver.dco` & `com.moveinsync.driver.lite` (MoveInSync Partner apps)
3. **Competitor Benchmarks:**
   - Safetrax Commuter: `in.mtap.iincube.safetrax.commuter` (24,144 ratings, 4.72★)
   - Routematic: `com.nivaata.routematic.tripsheet` (8,016 ratings, 4.52★)

### 3.2 Sampling & Stratification Strategy
To prevent bias toward only recent or only positive reviews, we collected a multi-layered sample:
- **Newest Chronological Stream (1,500 reviews):** Captures true organic rating distribution and version degradation over recent quarters.
- **Stratified Rating Samples:**
  - 1-Star: 1,000 reviews (to diagnose acute failure modes)
  - 2-Star: 500 reviews (to diagnose friction points)
  - 3-Star: 500 reviews (neutral/feature requests)
  - 4-Star: 400 reviews (near-satisfaction)
  - 5-Star: 600 reviews (core delight drivers)
- **Deduplication:** Merged by unique `reviewId` resulting in **3,368 unique, highly detailed reviews** spanning February 2020 to October 2026.

---

## 4. NLP & Classification Framework

Each review was analyzed and tagged with five dimensions:

1. **Journey Stage (The 8 Commute Phases):**
   - *Onboarding & Roster Sync* (SSO, shift schedule, corporate credentials, forced logouts)
   - *Self-Booking & Cutoff Policy* (calendar views, cutoff limits, waitlists, slot availability)
   - *Routing Algorithm & Detours* (circuitous routes, drop sequence, pooling detours)
   - *Live Tracking & Real-Time ETA* (map GPS lag, camera zoom auto-reset, ETA discrepancy)
   - *Boarding, Safety & Rating Gate* (OTP delivery, seatbelt popups, mandatory rating modal)
   - *Driver Conduct & Fleet Quality* (driver behavior, calling issues, AC refusal, rash driving)
   - *Support, Helpdesk & Escalation* (unresponsive transport desk, closed tickets)
   - *App Stability & Performance* (crashes on launch, battery drain, update loops)
2. **Friction Category:**
   - Engineering / Core Bug
   - Algorithms / Telemetry & Routing
   - Product & UX Friction
   - Operations & Fleet Governance
3. **Sentiment & Urgency:**
   - Negative (1★-2★), Neutral (3★), Positive (4★-5★)
   - Critical blockers (cannot open app, missed cab due to missing OTP) vs High/Medium inconveniences.
4. **App Version Correlation:** Tracked score drops specifically against versions `v12.11` through `v12.20`.
5. **Developer Reply Tracking:** Flagged whether MoveInSync responded to the reviewer (`hasDeveloperReply`).

---

## 5. Key Statistical Assumptions

1. **Google Play Regional Weighting:** We assume Google Play calculates the score visible to Indian Android users based predominantly on the **preceding 30 to 90 days** (as confirmed by Google's official Developer Console policy). This explains why incoming ratings averaging 3.75★ severely degrade user perception despite a 4.64★ cumulative history.
2. **The "Silent Majority" Commute Volume:** MoveInSync publicly serves **1.5+ million employees daily**. Assuming an industry-standard 96-98% operational completion rate, the vast majority of employees experience uneventful rides. Because satisfied enterprise employees rarely think to rate enterprise software on Google Play unless prompted, **the Play Store organically over-indexes on angry riders**.
3. **In-App Review Interception Conversion:** Based on standard Android Play Core benchmarks, prompting satisfied riders via `ReviewManager` at moments of delight yields a **10% to 15% conversion rate**, easily producing 300-500 organic 5-star reviews monthly.

---

## 6. How the Standing Question is Solved ("How Are Our Play Store Ratings?")

To ensure this is never an ad-hoc exercise, we delivered a permanent system:
1. **Automated Pipeline Script (`scripts/playstore_pipeline.py`):**
   - Can be run on-demand or via cron: `python scripts/playstore_pipeline.py`
   - Scrapes the latest reviews, re-runs NLP classification, updates `data/moveinsync_analysis.json` and `data/moveinsync_classified_reviews.csv`.
2. **Interactive Executive Dashboard (`dashboard/index.html`):**
   - Visualizes all trends, versions, friction stages, real quotes, and the mathematical rating turnaround simulator.
   - Includes a 1-click **"Ask: How Are Ratings Today?"** executive summary button.
3. **Slack/Teams Alerting Logic:**
   - Pre-configured threshold triggers for engineering and operations war rooms when 1-star reviews spike or crash keywords exceed baseline.
