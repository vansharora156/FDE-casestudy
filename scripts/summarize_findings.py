import json

with open('data/moveinsync_analysis.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print('=== APP SUMMARY ===')
for k, v in data['app_summary'].items():
    print(f"  {k}: {v}")

print('\n=== NEGATIVE REVIEWS BY STAGE ===')
for s in data['stage_summary']:
    print(f"  {s['stage']}: {s['count']} ({s['percentage']:.1f}%)")

print('\n=== NEGATIVE REVIEWS BY CATEGORY ===')
for c in data['category_summary']:
    print(f"  {c['category']}: {c['count']} ({c['percentage']:.1f}%)")

print('\n=== DEVELOPER RESPONSE RATE ===')
print(f"  Overall reply rate: {data['dev_response_rate']['overall_reply_pct']:.2f}%")
print(f"  Negative review reply rate: {data['dev_response_rate']['neg_reply_pct']:.2f}%")

print('\n=== RECENT MONTHLY TREND ===')
for m in data['monthly_trend'][-12:]:
    print(f"  {m['month']}: Avg Score = {m['avg_score']:.2f} (Total: {m['total_reviews']}, Neg: {m['negative_count']}, Pos: {m['positive_count']})")

print('\n=== VERSION BREAKDOWN ===')
for v in data['version_summary'][:8]:
    print(f"  v{v['reviewCreatedVersion']}: Avg Score = {v['avg_score']:.2f} | 1-Star Pct = {v['one_star_pct']:.1f}% | Reviews = {v['count']}")

print('\n=== TOP IMPACTFUL NEGATIVE REVIEWS ===')
for i, r in enumerate(data['top_negative_reviews'][:5]):
    safe_content = r['content'][:200].encode('ascii', errors='replace').decode('ascii')
    print(f"[{i+1}] ({r['date']} | v{r['reviewCreatedVersion']} | Upvotes: {r['thumbsUpCount']} | {r['primary_stage']}):")
    print(f"    {safe_content}...")

