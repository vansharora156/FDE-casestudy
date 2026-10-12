import pandas as pd

df = pd.read_csv('data/moveinsync_classified_reviews.csv')
recent_neg = df[(df['score'] <= 2) & (df['date'] >= '2026-08-01')].sort_values('date', ascending=False)

print(f"Total negative reviews since Aug 2026: {len(recent_neg)}")
print("\nSample recent complaints:")
for i, (_, r) in enumerate(recent_neg.head(20).iterrows()):
    content = str(r['content']).replace('\n', ' ')[:140]
    ver = r['reviewCreatedVersion']
    date = r['date']
    stage = r['primary_stage']
    print(f"[{i+1}] {date} (v{ver}) [{stage}]: {content}")
