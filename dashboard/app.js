// MoveInSync Play Store Intelligence Dashboard Logic
document.addEventListener('DOMContentLoaded', () => {
  const data = window.MOVEINSYNC_DATA || {};
  
  initTabs();
  renderMonthlyChart(data.monthly_trend || []);
  renderVersionTable(data.version_summary || []);
  renderCategoryBreakdown(data.category_summary || []);
  renderJourneyFunnel(data.stage_summary || []);
  renderRoadmap();
  renderReviews(data.explorer_reviews || []);
  initSimulator();
  initModals();
});

// Tab Navigation
function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tab');
      const targetContent = document.getElementById(targetId);
      if (targetContent) targetContent.classList.add('active');
    });
  });
}

// Render Monthly Chart
function renderMonthlyChart(monthlyTrend) {
  const container = document.getElementById('monthlyChartContainer');
  if (!container || !monthlyTrend.length) return;

  const recentMonths = monthlyTrend.slice(-10);
  let html = '';

  recentMonths.forEach(m => {
    const score = Number(m.avg_score).toFixed(2);
    const scoreNum = Number(m.avg_score);
    const pct = Math.min(100, Math.max(10, (scoreNum / 5) * 100));
    
    let barColor = '#34d399';
    if (scoreNum < 2.5) barColor = '#f43f5e';
    else if (scoreNum < 3.8) barColor = '#f59e0b';
    else if (scoreNum < 4.2) barColor = '#38bdf8';

    html += `
      <div style="display: flex; align-items: center; gap: 12px; font-size: 12.5px;">
        <span style="width: 65px; color: var(--text-muted); font-family: monospace;">${m.month}</span>
        <div style="flex-grow: 1; height: 16px; background: rgba(255,255,255,0.06); border-radius: 4px; overflow: hidden; position: relative;">
          <div style="width: ${pct}%; height: 100%; background: ${barColor}; border-radius: 4px; transition: width 0.4s ease;"></div>
        </div>
        <span style="width: 48px; text-align: right; font-weight: 700; color: #fff;">${score}★</span>
        <span style="width: 70px; text-align: right; color: var(--text-muted); font-size: 11px;">(${m.total_reviews} revs)</span>
      </div>
    `;
  });

  container.innerHTML = html;
}

// Render Version Table
function renderVersionTable(versionSummary) {
  const container = document.getElementById('versionTableContainer');
  if (!container || !versionSummary.length) return;

  let html = `
    <table style="width: 100%; border-collapse: collapse; font-size: 12.5px; text-align: left;">
      <thead>
        <tr style="border-bottom: 1px solid var(--border-color); color: var(--text-muted);">
          <th style="padding: 8px 10px;">Version</th>
          <th style="padding: 8px 10px;">Avg Score</th>
          <th style="padding: 8px 10px;">1★ Ratio</th>
          <th style="padding: 8px 10px;">Volume</th>
          <th style="padding: 8px 10px;">Health Status</th>
        </tr>
      </thead>
      <tbody>
  `;

  versionSummary.slice(0, 8).forEach(v => {
    const score = Number(v.avg_score).toFixed(2);
    const oneStar = Number(v.one_star_pct).toFixed(1);
    let badgeClass = 'up';
    let status = 'Stable';
    
    if (v.one_star_pct > 30 || v.avg_score < 3.7) {
      badgeClass = 'down';
      status = 'Severe Regression';
    } else if (v.one_star_pct > 20 || v.avg_score < 4.0) {
      badgeClass = 'down';
      status = 'Degraded';
    }

    html += `
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
        <td style="padding: 10px; font-weight: 600; color: #93c5fd; font-family: monospace;">v${v.reviewCreatedVersion}</td>
        <td style="padding: 10px; font-weight: 700; color: #fff;">${score}★</td>
        <td style="padding: 10px; color: ${v.one_star_pct > 25 ? '#fb7185' : '#e2e8f0'}; font-weight: 600;">${oneStar}%</td>
        <td style="padding: 10px; color: var(--text-muted);">${v.count}</td>
        <td style="padding: 10px;"><span class="kpi-badge ${badgeClass}">${status}</span></td>
      </tr>
    `;
  });

  html += '</tbody></table>';
  container.innerHTML = html;
}

// Render Category Breakdown
function renderCategoryBreakdown(catSummary) {
  const container = document.getElementById('categoryBreakdownContainer');
  if (!container || !catSummary.length) return;

  let html = '';
  const colors = {
    'Algorithms / Telemetry & Routing': '#38bdf8',
    'Engineering / Core App Stability': '#f43f5e',
    'Product & UX Design': '#a855f7',
    'Operations & Fleet Governance': '#f59e0b',
    'General Service & Logistics': '#64748b'
  };

  catSummary.forEach(c => {
    const color = colors[c.category] || '#6366f1';
    html += `
      <div>
        <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 5px;">
          <span style="color: #fff; font-weight: 500;">${c.category}</span>
          <span style="color: var(--text-muted);">${c.count} complaints (${c.percentage.toFixed(1)}%)</span>
        </div>
        <div style="height: 8px; background: rgba(255,255,255,0.06); border-radius: 4px; overflow: hidden;">
          <div style="width: ${c.percentage}%; height: 100%; background: ${color}; border-radius: 4px;"></div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// 8-Stage Commute Journey Data & Funnel
const JOURNEY_DIAGNOSTICS = {
  'Live Tracking & Real-Time ETA': {
    rank: 1,
    pct: 11.3,
    rootCause: 'Camera auto-zoom resetting every 30s back to whole-city view; vehicles hidden if >1 hr away; naive distance-based ETA ignores live congestion.',
    quote: '"ETA calculator very bad. Google maps always shows 3x the time shown in moveinsync app." &bull; "Won\'t let you track van under an hour away."',
    fix: 'Decouple camera touch listener to preserve user zoom; extend tracking window to 120 mins; integrate traffic API for dynamic ETA calculation.'
  },
  'App Stability & System Performance': {
    rank: 2,
    pct: 9.1,
    rootCause: 'App crashes on launch after updates due to unhandled SQLite database migration exceptions; memory leaks on background map polling.',
    quote: '"Whenever I update this app, I am not able to open again. Need to uninstall and reinstall. Facing this for 3 months!"',
    fix: 'Wrap SQLite migrations in try/catch fallback; automatic schema repair with safe local cache eviction upon upgrade failure.'
  },
  'Onboarding & Roster Sync': {
    rank: 3,
    pct: 8.1,
    rootCause: 'SSO corporate domain mapping desync; frequent forced logouts invalidating user session tokens when device switches networks.',
    quote: '"Pathetic. It logs out every time I open the app. When running late for cab, I have to re-login!"',
    fix: 'EncryptedSharedPreferences with Android Keystore token persistence; background silent token renewal with exponential backoff.'
  },
  'Self-Booking & Cutoff Policy': {
    rank: 4,
    pct: 7.6,
    rootCause: 'Inflexible cutoff timings; waitlist ambiguity (employees are placed on waitlist without explicit banner); phantom "trip not booked" push alerts.',
    quote: '"Your update is a threat to person with medical condition. Books you without informing if on waitlist." &bull; "Even after booking trip, keeps sending push that trip is not booked."',
    fix: 'Clear visual Waitlist badge with real-time queue position; push notification deduplication against confirmed bookings.'
  },
  'Boarding, Safety & Rating Gate': {
    rank: 5,
    pct: 5.3,
    rootCause: 'Forced post-ride rating popup with NO skip button; v12.19 intrusive "Seatbelt Safety" modal pops up right when tapping View OTP.',
    quote: '"Forcing me to give rating after every ride, so I came here to give you 1 star. If I don\'t rate, I can\'t use the app as there is no skip option!"',
    fix: 'Immediate P0: Add "Skip" button to modal; decouple rating from navigation; remove seatbelt disclaimer from OTP view flow.'
  },
  'Driver Conduct & Fleet Quality': {
    rank: 6,
    pct: 4.8,
    rootCause: 'Drivers calling riders repeatedly 30 mins early; refusal to switch on AC; rash driving without immediate in-app driver feedback loop.',
    quote: '"Could not call bus driver at critical time, says company policy not allowed. Missed bus!" &bull; "Driver rash driving, refuses AC."',
    fix: 'Masked VoIP calling with scheduled enable window; post-ride vehicle comfort toggles; driver score penalty triggers.'
  },
  'Routing Algorithm & Detours': {
    rank: 7,
    pct: 3.4,
    rootCause: 'Greedy vehicle pooling algorithm prioritizes vehicle fill-rate over rider travel time, creating 2-hour detours for 15 km direct journeys.',
    quote: '"MoveOutSync doesn\'t plan commutes; it plans cross-country pilgrimages. A 1-hour delay is considered punctual."',
    fix: 'Hard constraint on maximum detour ratio: Travel time must not exceed 1.35x direct transit time.'
  },
  'Support, Helpdesk & Escalation': {
    rank: 8,
    pct: 2.5,
    rootCause: 'In-app complaints closed automatically with canned responses; no live chat or direct escalation to transport desk.',
    quote: '"Transport management very bad, not ready to help employees. Closed my complaint ticket without any response."',
    fix: 'In-app ticket lifecycle with SLA tracking; automated escalation to on-duty transport supervisor.'
  }
};

function renderJourneyFunnel(stageSummary) {
  const container = document.getElementById('journeyFunnelList');
  if (!container) return;

  let html = '';
  const stages = Object.keys(JOURNEY_DIAGNOSTICS);

  stages.forEach((stageName, idx) => {
    const diag = JOURNEY_DIAGNOSTICS[stageName];
    html += `
      <div class="journey-step" onclick="showStageDetails('${stageName}')">
        <div class="step-num">${idx + 1}</div>
        <div class="step-info">
          <div class="step-title">${stageName}</div>
          <div class="step-sub">${diag.quote.substring(0, 95)}...</div>
        </div>
        <div class="step-bar-container">
          <div class="step-pct">${diag.pct}% of Friction</div>
          <div class="step-bar-bg">
            <div class="step-bar-fill" style="width: ${diag.pct * 7}%;"></div>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

window.showStageDetails = function(stageName) {
  const diag = JOURNEY_DIAGNOSTICS[stageName];
  if (!diag) return;

  const card = document.getElementById('journeyDetailCard');
  const title = document.getElementById('journeyDetailTitle');
  const content = document.getElementById('journeyDetailContent');

  title.innerText = `Stage ${diag.rank}: ${stageName}`;
  content.innerHTML = `
    <div class="action-grid" style="margin-top: 10px;">
      <div class="action-box">
        <div class="action-box-title" style="color: #fb7185;">Employee Pain & Real Quote</div>
        <div class="action-box-content" style="font-style: italic; color: #e2e8f0;">
          ${diag.quote}
        </div>
      </div>
      <div class="action-box">
        <div class="action-box-title" style="color: #f59e0b;">Engineering Root Cause</div>
        <div class="action-box-content">${diag.rootCause}</div>
      </div>
    </div>
    <div class="action-box" style="margin-top: 14px; border-left: 3px solid #10b981;">
      <div class="action-box-title" style="color: #34d399;">Turnaround Fix & Engineering Action</div>
      <div class="action-box-content" style="color: #fff;">${diag.fix}</div>
    </div>
  `;

  card.style.display = 'block';
  card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
};

// Prioritized Engineering Roadmap Data & Renderer
const ROADMAP_ITEMS = [
  {
    sprint: 'P0',
    tag: 'Sprint 1 (Days 1 - 14)',
    tagClass: 'tag-p0',
    title: 'P0.1: Remove Mandatory Rating Gate & Deploy Google Play In-App Review API',
    impact: '+0.35★ Rating Jump',
    team: 'Mobile Android Team',
    effort: '3 Days',
    problem: 'Users are forced into an unskippable rating modal after every ride. Frustrated users head directly to Google Play to leave retaliatory 1-star reviews ("forcing me to rate so I came here to give 1 star").',
    solution: '1. Add immediate "Skip / Later" button.<br>2. Integrate Google Play In-App Review API (<code>com.google.android.play:review</code>).<br>3. Smart Sentiment Gating: If user rates 5 stars in-app after 3 consecutive rides, trigger native Google Play prompt. If <=3 stars, open internal resolution ticket.',
    code: `// Google In-App Review Manager integration snippet
val manager = ReviewManagerFactory.create(context)
val request = manager.requestReviewFlow()
request.addOnCompleteListener { task ->
    if (task.isSuccessful) {
        val reviewInfo = task.result
        val flow = manager.launchReviewFlow(activity, reviewInfo)
    }
}`,
    criteria: 'Rating modal must never block navigation. Skip button functional on all devices. Google in-app review triggered only for NPS 9-10 users.'
  },
  {
    sprint: 'P0',
    tag: 'Sprint 1 (Days 1 - 14)',
    tagClass: 'tag-p0',
    title: 'P0.2: Fix Post-Update Startup Crash & SQLite Migration Fallback',
    impact: '+0.25★ Rating Jump',
    team: 'Core Platform Eng',
    effort: '4 Days',
    problem: 'Users report "After updating from Play Store, app cannot open again. Need to uninstall and reinstall. Facing this for 3 months". Caused by schema migrations throwing unhandled SQLite exceptions.',
    solution: 'Implement robust Room/SQLite migration exception handlers. If migration fails, log non-fatal crashlytics event, backup critical user tokens, safely wipe corrupted cache, and recreate clean local store without crashing.',
    code: `Room.databaseBuilder(context, AppDatabase::class.java, "moveinsync.db")
    .fallbackToDestructiveMigrationOnDowngrade()
    .addMigrations(MIGRATION_12_18_TO_12_19)
    .build()`,
    criteria: 'Zero launch crashes after simulated upgrade from v12.16 -> v12.20 in test suites.'
  },
  {
    sprint: 'P0',
    tag: 'Sprint 1 (Days 1 - 14)',
    tagClass: 'tag-p0',
    title: 'P0.3: Remove "Seatbelt Safety" Modal Intercepting OTP Reveal',
    impact: '+0.15★ Rating Jump',
    team: 'Mobile UX & Safety',
    effort: '2 Days',
    problem: 'In v12.19, tapping "View OTP" while standing at the cab launches an unskippable "Seatbelt Safety First" educational popup, causing boarding delays and angry reviews.',
    solution: 'Move seatbelt safety reminder to an in-transit banner or non-modal card. Never intercept the time-critical OTP boarding pass flow.',
    code: `// Unblock OTP reveal action
fun onOtpCardClicked() {
    showOtpDirectly(trip.boardingOtp) // Instant reveal
    displaySubtleSafetyBanner() // Non-blocking
}`,
    criteria: 'OTP displays within 50ms of button tap without dialog interception.'
  },
  {
    sprint: 'P0',
    tag: 'Sprint 1 (Days 1 - 14)',
    tagClass: 'tag-p0',
    title: 'P0.4: Session Persistence & Android Keystore Token Refresh Guard',
    impact: '+0.20★ Rating Jump',
    team: 'Identity & SecOps',
    effort: '4 Days',
    problem: 'Frequent forced logouts ("Pathetic. It logs out every time"). Intermittent network switches (4G to WiFi) cause token refresh race conditions, dropping the session.',
    solution: 'Store JWT refresh tokens in <code>EncryptedSharedPreferences</code> backed by Android Keystore. Implement OkHttp Authenticator with thread-safe synchronized token refresh and exponential backoff retry.',
    code: `class TokenAuthenticator(private val authApi: AuthApi) : Authenticator {
    override fun authenticate(route: Route?, response: Response): Request? {
        synchronized(this) {
            val newToken = authApi.refreshTokenSync() ?: return null
            return response.request.newBuilder().header("Authorization", "Bearer $newToken").build()
        }
    }
}`,
    criteria: 'Session retained across network drops and background app kills for 90 days.'
  },
  {
    sprint: 'P1',
    tag: 'Sprint 2 (Days 15 - 30)',
    tagClass: 'tag-p1',
    title: 'P1.1: Map Auto-Zoom Decoupling & Vehicle Tracking Horizon Extension',
    impact: '+0.20★ Rating Jump',
    team: 'Maps & Telemetry Eng',
    effort: '5 Days',
    problem: 'Map auto-resets zoom every 30s to full route overview (showing both pickup and office 25 km away), making local tracking impossible. Also, app hides vehicle if >1 hour away.',
    solution: '1. If user pinches/zooms map, disable auto-center timer for 2 minutes or until user taps "Re-center".<br>2. Extend vehicle tracking window from 60 minutes to 120 minutes before pickup.',
    code: `googleMap.setOnCameraMoveStartedListener { reason ->
    if (reason == GoogleMap.OnCameraMoveStartedListener.REASON_GESTURE) {
        userInteractingWithMap = true
        autoZoomTimer.pause()
    }
}`,
    criteria: 'Manual map zoom level persists without programmatic reset during live tracking.'
  },
  {
    sprint: 'P1',
    tag: 'Sprint 2 (Days 15 - 30)',
    tagClass: 'tag-p1',
    title: 'P1.2: Roster Booking Calendar & Waitlist Transparency UX',
    impact: '+0.15★ Rating Jump',
    team: 'Product & Design',
    effort: '6 Days',
    problem: 'Single-day-only booking calendar requires tedious repeat actions. Also, waitlisted users have no queue visibility, assuming cab is confirmed.',
    solution: '1. Launch multi-day & monthly roster booking grid.<br>2. Explicit "Waitlist Rank #X" card with live ETA for confirmation or alternative shuttle recommendations.<br>3. Cancel phantom "trip not booked" push alerts upon booking creation.',
    code: `if (trip.status == TripStatus.WAITLISTED) {
    showWaitlistCard(rank = trip.waitlistPosition, estimatedConfirmationTime = trip.slaTime)
}`,
    criteria: 'Weekly roster can be booked in <= 3 taps. Zero phantom cutoff notifications.'
  },
  {
    sprint: 'P1',
    tag: 'Sprint 2 (Days 15 - 30)',
    tagClass: 'tag-p1',
    title: 'P1.3: Closed-Loop In-App Helpdesk & SLA Auto-Escalation',
    impact: '+0.15★ Rating Jump',
    team: 'Operations Tech',
    effort: '5 Days',
    problem: 'Support tickets closed without explanation or resolution. Riders vent on Play Store as their only recourse.',
    solution: 'Introduce two-way in-app ticketing with real-time status tracker (Raised -> Assigned -> Investigating -> Resolved). If ticket relates to late cab/driver misconduct, trigger automatic supervisor callback within 30 mins.',
    code: `POST /api/v2/support/tickets {
    "tripId": trip.id,
    "issueCategory": "DRIVER_MISCONDUCT",
    "slaTimeoutMinutes": 30,
    "notifySupervisor": true
}`,
    criteria: '100% of high-severity tickets responded to within 30 mins; feedback rating requested after ticket resolution.'
  },
  {
    sprint: 'P2',
    tag: 'Sprint 3 (Days 31 - 60)',
    tagClass: 'tag-p2',
    title: 'P2.1: Commute Fairness Routing Constraint (Detour Ratio Cap)',
    impact: '+0.20★ Rating Jump',
    team: 'Algorithms & Operations',
    effort: '10 Days',
    problem: '"Cross-country pilgrimages": Riders travel 2+ hours for 15 km direct journeys due to aggressive vehicle pooling algorithms.',
    solution: 'Add hard constraint to VRP (Vehicle Routing Problem) solver: Max Detour Ratio <= 1.35x direct transit time. If vehicle pooling exceeds this threshold, dispatch dedicated shuttle or secondary cab.',
    code: `def validate_route_constraints(route, employee):
    direct_duration = get_direct_duration(employee.origin, employee.destination)
    actual_duration = calculate_route_travel_time(route, employee)
    if actual_duration > (direct_duration * 1.35):
        return False # Reject pooling; split cab
    return True`,
    criteria: 'Zero employee trips exceed 1.4x direct duration in routing simulations.'
  },
  {
    sprint: 'P2',
    tag: 'Sprint 3 (Days 31 - 60)',
    tagClass: 'tag-p2',
    title: 'P2.2: Automated Play Store Developer Response SLA Workflow',
    impact: '+0.10★ Rating Jump',
    team: 'FDE & Support Ops',
    effort: '4 Days',
    problem: '81.6% of negative Play Store reviews currently go unanswered. Studies show responding with empathetic action turns up to 30% of 1-star reviews into 4/5-star updates.',
    solution: 'Deploy automated Google Play Developer API webhook: When 1★ or 2★ review is posted, sync to Zendesk queue. Support team reaches out to employee (matching corporate email/domain) within 12 hours. Once resolved, send follow-up Play Store update prompt.',
    code: `// Google Play Developer API automated webhook
const playstore = google.androidpublisher('v3');
await playstore.reviews.reply({
    packageName: 'com.moveinsync.ets',
    reviewId: review.id,
    requestBody: { replyText: personalizedResolutionReply }
});`,
    criteria: '100% of negative reviews responded to within 12 hours.'
  }
];

function renderRoadmap(filter = 'all') {
  const container = document.getElementById('roadmapList');
  if (!container) return;

  let html = '';
  const filtered = filter === 'all' ? ROADMAP_ITEMS : ROADMAP_ITEMS.filter(item => item.sprint === filter);

  filtered.forEach(item => {
    html += `
      <div class="action-card">
        <div class="action-header">
          <div class="action-title">
            <span class="sprint-tag ${item.tagClass}">${item.sprint}</span>
            ${item.title}
          </div>
          <div class="action-meta">
            <span class="action-pill pill-impact">${item.impact}</span>
            <span class="action-pill">${item.team}</span>
            <span class="action-pill">${item.effort}</span>
          </div>
        </div>
        <div class="action-grid">
          <div class="action-box">
            <div class="action-box-title" style="color: #fb7185;">Problem & User Pain</div>
            <div class="action-box-content">${item.problem}</div>
          </div>
          <div class="action-box">
            <div class="action-box-title" style="color: #34d399;">Technical & Product Solution</div>
            <div class="action-box-content">${item.solution}</div>
          </div>
        </div>
        <div class="code-snippet">${item.code}</div>
        <div style="margin-top: 10px; font-size: 11.5px; color: var(--text-muted);">
          <strong style="color: #cbd5e1;">Acceptance Criteria:</strong> ${item.criteria}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

window.filterRoadmap = function(filter) {
  renderRoadmap(filter);
  const buttons = ['btnFilterAllSprints', 'btnFilterP0', 'btnFilterP1', 'btnFilterP2'];
  buttons.forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.classList.remove('active');
  });

  const activeId = filter === 'all' ? 'btnFilterAllSprints' : `btnFilter${filter}`;
  const activeBtn = document.getElementById(activeId);
  if (activeBtn) activeBtn.classList.add('active');
};

// Review Explorer Renderer
let allExplorerReviews = [];

function renderReviews(reviews) {
  allExplorerReviews = reviews;
  applyReviewFilters();

  const searchInput = document.getElementById('reviewSearchInput');
  const scoreFilter = document.getElementById('filterScore');
  const stageFilter = document.getElementById('filterStage');
  const sortSelect = document.getElementById('sortReviews');

  if (searchInput) searchInput.addEventListener('input', applyReviewFilters);
  if (scoreFilter) scoreFilter.addEventListener('change', applyReviewFilters);
  if (stageFilter) stageFilter.addEventListener('change', applyReviewFilters);
  if (sortSelect) sortSelect.addEventListener('change', applyReviewFilters);
}

function applyReviewFilters() {
  const container = document.getElementById('reviewsListContainer');
  const countBadge = document.getElementById('reviewCountBadge');
  if (!container) return;

  const searchTerm = (document.getElementById('reviewSearchInput')?.value || '').toLowerCase();
  const scoreVal = document.getElementById('filterScore')?.value || 'all';
  const stageVal = document.getElementById('filterStage')?.value || 'all';
  const sortVal = document.getElementById('sortReviews')?.value || 'upvotes';

  let filtered = allExplorerReviews.filter(r => {
    if (scoreVal !== 'all' && r.score !== parseInt(scoreVal)) return false;
    if (stageVal !== 'all' && r.stage !== stageVal) return false;
    if (searchTerm && !r.content.toLowerCase().includes(searchTerm) && !r.stage.toLowerCase().includes(searchTerm)) return false;
    return true;
  });

  if (sortVal === 'upvotes') {
    filtered.sort((a, b) => b.thumbsUpCount - a.thumbsUpCount);
  } else {
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  if (countBadge) countBadge.innerText = `Showing ${filtered.length} Reviews`;

  if (!filtered.length) {
    container.innerHTML = `<div style="text-align: center; padding: 40px; color: var(--text-muted);">No reviews matched your filters.</div>`;
    return;
  }

  let html = '';
  filtered.forEach(r => {
    const starsStr = '★'.repeat(r.score) + '☆'.repeat(5 - r.score);
    html += `
      <div class="review-item">
        <div class="review-header">
          <div class="review-user-info">
            <span class="stars">${starsStr}</span>
            <span class="review-author">${escapeHtml(r.userName || 'Employee')}</span>
            <span class="review-date-ver">${r.date} &bull; v${r.version}</span>
          </div>
          <div class="review-tags">
            <span class="review-tag">${r.stage}</span>
            ${r.issues ? `<span class="review-tag" style="background: rgba(244,63,94,0.15); color: #fda4af;">${r.issues.split('|')[0]}</span>` : ''}
          </div>
        </div>
        <div class="review-body">${escapeHtml(r.content)}</div>
        <div class="review-footer">
          <span>👍 ${r.thumbsUpCount} upvotes</span>
          <span>${r.hasReply ? '<span style="color: #34d399;">✓ Developer Replied</span>' : '<span style="color: #94a3b8;">No Developer Reply</span>'}</span>
        </div>
        ${r.hasReply && r.replyContent ? `
          <div class="reply-banner">
            <div class="reply-header">MoveInSync Developer Response:</div>
            <div>${escapeHtml(r.replyContent)}</div>
          </div>
        ` : ''}
      </div>
    `;
  });

  container.innerHTML = html;
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Simulator Logic
function initSimulator() {
  const volSlider = document.getElementById('simVolumeSlider');
  const fixSlider = document.getElementById('simP0FixSlider');
  const promptSlider = document.getElementById('simPromptUpliftSlider');

  if (!volSlider) return;

  const updateSim = () => {
    const vol = parseInt(volSlider.value);
    const fixPct = parseInt(fixSlider.value) / 100;
    const promptUplift = parseInt(promptSlider.value);

    document.getElementById('simVolumeVal').innerText = vol;
    document.getElementById('simP0FixVal').innerText = `${Math.round(fixPct * 100)}%`;
    document.getElementById('simPromptUpliftVal').innerText = promptUplift;

    // Mathematical projection model
    // Baseline incoming: 25.8% 1-star, 3.3% 2-star, 2.6% 3-star, 4.2% 4-star, 64.1% 5-star => avg ~3.75
    const baselineNegRevs = vol * 0.30;
    const remainingNegRevs = baselineNegRevs * (1 - fixPct);
    const baselinePosRevs = vol * 0.70;
    const newPosRevs = baselinePosRevs + promptUplift;
    const totalMonthRevs = remainingNegRevs + newPosRevs;

    // Projected incoming monthly score
    const projectedIncomingAvg = ((remainingNegRevs * 1.2) + (newPosRevs * 4.9)) / totalMonthRevs;

    // Google Play rolling score projection:
    // Day 30: 40% incoming + 60% baseline 3.75
    const score30 = (projectedIncomingAvg * 0.45) + (3.75 * 0.55);
    // Day 60: 75% incoming + 25% baseline
    const score60 = (projectedIncomingAvg * 0.75) + (3.75 * 0.25);
    // Day 90: 95% incoming + 5% baseline
    const score90 = (projectedIncomingAvg * 0.95) + (3.75 * 0.05);

    document.getElementById('simScore30').innerText = `${Math.min(4.9, score30).toFixed(2)}★`;
    document.getElementById('simScore60').innerText = `${Math.min(4.9, score60).toFixed(2)}★`;
    document.getElementById('simScore90').innerText = `${Math.min(4.9, score90).toFixed(2)}★`;
    document.getElementById('simNetOneStar').innerText = `-${Math.round(fixPct * 100)}%`;
  };

  volSlider.addEventListener('input', updateSim);
  fixSlider.addEventListener('input', updateSim);
  promptSlider.addEventListener('input', updateSim);

  updateSim();
}

// Modal handling
function initModals() {
  const modal = document.getElementById('briefModal');
  const btnOpen = document.getElementById('btnExecutiveSummary');
  const btnClose = document.getElementById('btnCloseModal');
  const btnRefresh = document.getElementById('btnRunRefresh');

  if (btnOpen && modal) {
    btnOpen.addEventListener('click', () => modal.classList.add('active'));
  }
  if (btnClose && modal) {
    btnClose.addEventListener('click', () => modal.classList.remove('active'));
  }
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  }

  if (btnRefresh) {
    btnRefresh.addEventListener('click', () => {
      alert("Executive Pulse Report:\\n\\nGoogle Play Status: Active Monitoring\\nCurrent Run-Rate Score: 3.75★ (-0.89 Drop from 4.64★ Lifetime)\\nIncoming 1-Star Ratio: 25.8%\\nTop Friction: Live Tracking Map Zoom Reset & Rating Modal Hostage\\nP0 Sprint Readiness: 4 P0 Initiatives Specified for Day 1 Execution.");
    });
  }
}
