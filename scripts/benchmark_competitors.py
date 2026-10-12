import pandas as pd
from google_play_scraper import app

competitors = {
    'MoveInSync': 'com.moveinsync.ets',
    'Routematic (Driver/Commuter)': 'com.nivaata.routematic.tripsheet',
    'Safetrax Commuter': 'in.mtap.iincube.safetrax.commuter'
}

print("=== COMPETITIVE BENCHMARK ===")
for name, app_id in competitors.items():
    try:
        info = app(app_id, lang='en', country='in')
        print(f"\n{name} ({app_id}):")
        print(f"  Score: {info.get('score'):.2f}")
        print(f"  Ratings: {info.get('ratings'):,}")
        print(f"  Reviews: {info.get('reviews'):,}")
        hist = info.get('histogram', [0,0,0,0,0])
        total = sum(hist)
        if total > 0:
            print(f"  1-Star: {hist[0]} ({hist[0]/total*100:.1f}%) | 5-Star: {hist[4]} ({hist[4]/total*100:.1f}%)")
    except Exception as e:
        print(f"Error fetching {name}: {e}")
