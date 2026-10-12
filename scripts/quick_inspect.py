from google_play_scraper import Sort, reviews

r, _ = reviews('com.moveinsync.ets', lang='en', country='in', sort=Sort.NEWEST, filter_score_with=1, count=15)
for i, rev in enumerate(r):
    ver = rev.get('reviewCreatedVersion')
    date = str(rev.get('at'))[:10]
    content = rev.get('content', '').replace('\n', ' ')
    print(f"[{i+1}] ({date} | v{ver}): {content[:150]}")
