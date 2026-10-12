import os
import json
import re
from datetime import datetime
import pandas as pd
from google_play_scraper import Sort, reviews, app

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')
os.makedirs(DATA_DIR, exist_ok=True)

APP_ID = 'com.moveinsync.ets'

# Classification Rules and Keywords
STAGE_PATTERNS = {
    'Onboarding & Roster Sync': [
        r'\broster\b', r'\bshift\b', r'\bonboard\b', r'\blogin\b', r'\blog in\b',
        r'\bsign in\b', r'\bsso\b', r'\bcorporate\b', r'\bdomain\b', r'\bcredential\b'
    ],
    'Self-Booking & Cutoff Policy': [
        r'\bbook\b', r'\bbooking\b', r'\bcancel\b', r'\bcut ?off\b', r'\bwaitlist\b',
        r'\bcalendar\b', r'\bmonthly view\b', r'\bslot\b', r'\bno cab available\b',
        r'\bunable to book\b', r'\bbooking failed\b', r'\badvance booking\b'
    ],
    'Routing Algorithm & Detours': [
        r'\broute\b', r'\brouting\b', r'\bdetour\b', r'\bpilgrimage\b', r'\blong route\b',
        r'\bround\b', r'\bdifference in distance\b', r'\bcircuitous\b', r'\bpickup sequence\b',
        r'\bdrop sequence\b', r'\bextra hour\b', r'\bpooling\b'
    ],
    'Live Tracking & Real-Time ETA': [
        r'\beta\b', r'\btrack\b', r'\btracking\b', r'\bgps\b', r'\bmap\b', r'\blocation\b',
        r'\blive\b', r'\bdelay\b', r'\blate cab\b', r'\bvehicle location\b', r'\bwrong location\b',
        r'\bgoogle maps\b', r'\baccurate\b', r'\brefresh\b'
    ],
    'Boarding, Safety & Rating Gate': [
        r'\botp\b', r'\bpin\b', r'\bboard\b', r'\bboarding\b', r'\bverify\b', r'\bverification\b',
        r'\bsos\b', r'\bpanic\b', r'\bsafety\b', r'\bguard\b', r'\bescort\b',
        r'\bforce .* rating\b', r'\brating popup\b', r'\bcan\'?t skip\b', r'\bno skip\b',
        r'\brate after every\b', r'\bmandatory rating\b'
    ],
    'Driver Conduct & Fleet Quality': [
        r'\bdriver\b', r'\brude\b', r'\brash\b', r'\bac\b', r'\bair condition\b',
        r'\bspeed\b', r'\bcall\b', r'\bcalling\b', r'\bbehavior\b', r'\blanguage\b',
        r'\bcab condition\b', r'\bdirty\b', r'\breckless\b', r'\bdriver canceled\b',
        r'\bdriver denied\b', r'\bdriver refused\b'
    ],
    'Support, Helpdesk & Escalation': [
        r'\bsupport\b', r'\bhelp ?desk\b', r'\bticket\b', r'\btransport team\b',
        r'\bcomplaint\b', r'\badmin\b', r'\bno response\b', r'\bclosed ticket\b',
        r'\bunresolved\b', r'\bcall center\b', r'\bhelpline\b'
    ],
    'App Stability & System Performance': [
        r'\bcrash\b', r'\bfreeze\b', r'\bstopped working\b', r'\bnot opening\b',
        r'\bwon\'?t open\b', r'\buninstall\b', r'\breinstall\b', r'\bupdate\b',
        r'\bwhite screen\b', r'\bblank screen\b', r'\blogged out\b', r'\bforced logout\b',
        r'\bbattery\b', r'\bheating\b', r'\bnotification\b', r'\bphantom\b', r'\bui\b',
        r'\binterface\b', r'\bslow\b', r'\blag\b', r'\bbug\b', r'\bglitch\b'
    ]
}

SPECIFIC_ISSUE_TAGS = {
    'Mandatory Rating Gate Rage': [r'force.*rating', r'no skip option', r'rate after every', r'forcing me to rate', r'mandatory rating'],
    'Post-Update Crash / Reinstall Loop': [r'uninstall and reinstall', r'not able to open.*update', r'crashes on open', r'white screen', r'blank screen'],
    'Frequent Forced Logout / Session Loss': [r'logs out every time', r'frequent log ?out', r'keep logging out', r'session expired'],
    'Inaccurate ETA / GPS Lag': [r'eta.*joke', r'google maps.*3x', r'eta calculator', r'gps not updating', r'wrong eta', r'delay of 1 hour'],
    'OTP Delivery Delay / Failure': [r'not sending otp', r'otp delay', r'otp not received', r'no otp'],
    'Excessive Detours / Pilgrimage Routes': [r'pilgrimage', r'circuitous', r'2 hours for 15 km', r'long route', r'illogical route', r'wrong pickup order'],
    'Waitlist / Booking Opacity': [r'waitlist', r'without informing.*waitlist', r'booking cut ?off', r'trip is not booked.*notification'],
    'Unresponsive Support / Closed Tickets': [r'closed ticket', r'not ready to help', r'no support response', r'pathetic helpdesk']
}

def fetch_all_reviews():
    print(f"Fetching app info for {APP_ID}...")
    app_info = app(APP_ID, lang='en', country='in')
    print(f"Total App Ratings: {app_info.get('ratings')}, Score: {app_info.get('score'):.2f}, Reviews: {app_info.get('reviews')}")
    
    collected_reviews = {}
    
    # 1. Fetch newest reviews (1500)
    print("Fetching newest reviews (1500)...")
    res_new, _ = reviews(APP_ID, lang='en', country='in', sort=Sort.NEWEST, count=1500)
    for r in res_new:
        collected_reviews[r['reviewId']] = r
    print(f"Total unique after newest: {len(collected_reviews)}")
    
    # 2. Fetch stratified score reviews to capture deep thematic issues
    for star, target_count in [(1, 1000), (2, 500), (3, 500), (4, 400), (5, 600)]:
        print(f"Fetching {star}-star reviews ({target_count})...")
        res_star, _ = reviews(APP_ID, lang='en', country='in', sort=Sort.NEWEST, filter_score_with=star, count=target_count)
        for r in res_star:
            collected_reviews[r['reviewId']] = r
        print(f"Total unique after {star}-star: {len(collected_reviews)}")
        
    all_revs = list(collected_reviews.values())
    print(f"Successfully collected {len(all_revs)} unique reviews.")
    return app_info, all_revs

def classify_review(text, score):
    text_lower = text.lower() if text else ""
    matched_stages = []
    for stage, patterns in STAGE_PATTERNS.items():
        if any(re.search(pat, text_lower) for pat in patterns):
            matched_stages.append(stage)
            
    if not matched_stages:
        if score <= 2:
            primary_stage = 'General Dissatisfaction'
        elif score >= 4:
            primary_stage = 'General Positive Feedback'
        else:
            primary_stage = 'General Commute Experience'
    else:
        primary_stage = matched_stages[0]
        
    # Match specific issue tags
    matched_issues = []
    for issue_name, patterns in SPECIFIC_ISSUE_TAGS.items():
        if any(re.search(pat, text_lower) for pat in patterns):
            matched_issues.append(issue_name)
            
    # Category Assignment
    if any(s in matched_stages for s in ['App Stability & System Performance', 'Boarding, Safety & Rating Gate']) and any(kw in text_lower for kw in ['crash', 'reinstall', 'logout', 'otp', 'white screen', 'freeze', 'bug']):
        category = 'Engineering / Core App Stability'
    elif 'Live Tracking & Real-Time ETA' in matched_stages or 'Routing Algorithm & Detours' in matched_stages:
        category = 'Algorithms / Telemetry & Routing'
    elif 'Self-Booking & Cutoff Policy' in matched_stages or 'Rating Gate' in text_lower or any(kw in text_lower for kw in ['waitlist', 'calendar', 'force', 'popup']):
        category = 'Product & UX Design'
    elif 'Driver Conduct & Fleet Quality' in matched_stages or 'Support, Helpdesk & Escalation' in matched_stages:
        category = 'Operations & Fleet Governance'
    else:
        category = 'General Service & Logistics'
        
    # Sentiment
    if score in [1, 2]:
        sentiment = 'Negative'
    elif score == 3:
        sentiment = 'Neutral'
    else:
        sentiment = 'Positive'
        
    return {
        'primary_stage': primary_stage,
        'all_stages': matched_stages,
        'category': category,
        'specific_issues': matched_issues,
        'sentiment': sentiment
    }

def run_pipeline():
    app_info, raw_reviews = fetch_all_reviews()
    
    rows = []
    for r in raw_reviews:
        text = r.get('content') or ''
        classification = classify_review(text, r.get('score'))
        
        row = {
            'reviewId': r.get('reviewId'),
            'userName': r.get('userName'),
            'score': r.get('score'),
            'thumbsUpCount': r.get('thumbsUpCount', 0),
            'reviewCreatedVersion': r.get('reviewCreatedVersion'),
            'at': str(r.get('at')),
            'date': str(r.get('at'))[:10] if r.get('at') else '',
            'content': text,
            'replyContent': r.get('replyContent'),
            'repliedAt': str(r.get('repliedAt')) if r.get('repliedAt') else None,
            'hasDeveloperReply': bool(r.get('replyContent')),
            'primary_stage': classification['primary_stage'],
            'all_stages': "|".join(classification['all_stages']),
            'category': classification['category'],
            'specific_issues': "|".join(classification['specific_issues']),
            'sentiment': classification['sentiment']
        }
        rows.append(row)
        
    df = pd.DataFrame(rows)
    df['at_dt'] = pd.to_datetime(df['at'], errors='coerce')
    df['month'] = df['at_dt'].dt.to_period('M').astype(str)
    
    # Save CSV
    csv_path = os.path.join(DATA_DIR, 'moveinsync_classified_reviews.csv')
    df.to_csv(csv_path, index=False, encoding='utf-8')
    print(f"Saved classified reviews to {csv_path}")
    
    # Generate Aggregations
    # 1. Monthly trend
    monthly_trend = df.groupby('month').agg(
        total_reviews=('score', 'count'),
        avg_score=('score', 'mean'),
        negative_count=('score', lambda x: (x <= 2).sum()),
        positive_count=('score', lambda x: (x >= 4).sum())
    ).reset_index().to_dict(orient='records')
    
    # 2. Version breakdown (top 15 versions)
    version_summary = df[df['reviewCreatedVersion'].notna()].groupby('reviewCreatedVersion').agg(
        count=('score', 'count'),
        avg_score=('score', 'mean'),
        one_star_pct=('score', lambda x: ((x == 1).sum() / len(x)) * 100)
    ).sort_values('count', ascending=False).head(15).reset_index().to_dict(orient='records')
    
    # 3. Stage breakdown for Negative reviews (1 & 2 stars)
    neg_df = df[df['score'] <= 2]
    stage_breakdown = neg_df['primary_stage'].value_counts().reset_index()
    stage_breakdown.columns = ['stage', 'count']
    stage_breakdown['percentage'] = (stage_breakdown['count'] / len(neg_df)) * 100
    stage_summary = stage_breakdown.to_dict(orient='records')
    
    # 4. Category breakdown
    cat_breakdown = neg_df['category'].value_counts().reset_index()
    cat_breakdown.columns = ['category', 'count']
    cat_breakdown['percentage'] = (cat_breakdown['count'] / len(neg_df)) * 100
    cat_summary = cat_breakdown.to_dict(orient='records')
    
    # 5. Developer Response Rate
    dev_response_rate = {
        'overall_reply_pct': (df['hasDeveloperReply'].sum() / len(df)) * 100,
        'neg_reply_pct': (neg_df['hasDeveloperReply'].sum() / len(neg_df)) * 100,
        'avg_reply_delay_days': 0 # placeholder
    }
    
    # 6. Top High-Impact Issues (sorted by thumbsUpCount + frequency)
    neg_sample_reviews = neg_df.sort_values('thumbsUpCount', ascending=False).head(50)[[
        'reviewId', 'score', 'thumbsUpCount', 'reviewCreatedVersion', 'date', 'content', 'primary_stage', 'specific_issues'
    ]].to_dict(orient='records')
    
    # 7. Overall app summary
    app_summary = {
        'title': app_info.get('title'),
        'all_time_score': round(float(app_info.get('score', 0)), 2),
        'total_ratings': int(app_info.get('ratings', 0)),
        'total_reviews': int(app_info.get('reviews', 0)),
        'histogram': app_info.get('histogram'),
        'analyzed_sample_size': len(df),
        'analyzed_negative_count': len(neg_df),
        'recent_avg_score': round(float(df['score'].mean()), 2),
        'date_range': f"{df['date'].min()} to {df['date'].max()}"
    }
    
    full_analysis = {
        'app_summary': app_summary,
        'monthly_trend': monthly_trend,
        'version_summary': version_summary,
        'stage_summary': stage_summary,
        'category_summary': cat_summary,
        'dev_response_rate': dev_response_rate,
        'top_negative_reviews': neg_sample_reviews
    }
    
    json_path = os.path.join(DATA_DIR, 'moveinsync_analysis.json')
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(full_analysis, f, indent=2)
    print(f"Saved analysis output to {json_path}")
    print("\n--- Pipeline Completed Successfully ---")

if __name__ == '__main__':
    run_pipeline()
