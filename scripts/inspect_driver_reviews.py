from google_play_scraper import Sort, reviews

try:
    r_drv, _ = reviews('com.moveinsync.driver.dco', lang='en', country='in', sort=Sort.NEWEST, filter_score_with=1, count=10)
    for i, rev in enumerate(r_drv):
        date = str(rev.get('at'))[:10]
        content = rev.get('content', '').replace('\n', ' ')
        print(f"[Driver 1-Star {i+1}] ({date}): {content[:150]}")
except Exception as e:
    print("Error:", e)
