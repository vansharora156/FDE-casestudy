import json
import os

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')
DASHBOARD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'dashboard')
os.makedirs(DASHBOARD_DIR, exist_ok=True)

with open(os.path.join(DATA_DIR, 'moveinsync_analysis.json'), 'r', encoding='utf-8') as f:
    analysis_data = json.load(f)

# Also load a rich sample of classified reviews (e.g. 300 reviews across all stars) for the interactive explorer
import pandas as pd
df = pd.read_csv(os.path.join(DATA_DIR, 'moveinsync_classified_reviews.csv'))
sample_df = df.sort_values(['thumbsUpCount', 'date'], ascending=[False, False]).head(250)

reviews_list = []
for _, r in sample_df.iterrows():
    reviews_list.append({
        'reviewId': str(r.get('reviewId')),
        'userName': str(r.get('userName')),
        'score': int(r.get('score')),
        'thumbsUpCount': int(r.get('thumbsUpCount', 0)),
        'version': str(r.get('reviewCreatedVersion')) if pd.notna(r.get('reviewCreatedVersion')) else 'N/A',
        'date': str(r.get('date')),
        'content': str(r.get('content')),
        'stage': str(r.get('primary_stage')),
        'category': str(r.get('category')),
        'issues': str(r.get('specific_issues')) if pd.notna(r.get('specific_issues')) else '',
        'hasReply': bool(r.get('hasDeveloperReply')),
        'replyContent': str(r.get('replyContent')) if pd.notna(r.get('replyContent')) else ''
    })

analysis_data['explorer_reviews'] = reviews_list

js_content = f"// Auto-generated MoveInSync Play Store Intelligence Data\nwindow.MOVEINSYNC_DATA = {json.dumps(analysis_data, indent=2)};\n"

with open(os.path.join(DASHBOARD_DIR, 'data.js'), 'w', encoding='utf-8') as f:
    f.write(js_content)

print(f"Exported dashboard data to {os.path.join(DASHBOARD_DIR, 'data.js')} with {len(reviews_list)} explorer reviews.")
