Run echo "Starting Supabase sync..."
  echo "Starting Supabase sync..."
  python scripts/sync_supabase.py temp_data
  shell: /usr/bin/bash -e {0}
  env:
    pythonLocation: /opt/hostedtoolcache/Python/3.11.13/x64
    PKG_CONFIG_PATH: /opt/hostedtoolcache/Python/3.11.13/x64/lib/pkgconfig
    Python_ROOT_DIR: /opt/hostedtoolcache/Python/3.11.13/x64
    Python2_ROOT_DIR: /opt/hostedtoolcache/Python/3.11.13/x64
    Python3_ROOT_DIR: /opt/hostedtoolcache/Python/3.11.13/x64
    LD_LIBRARY_PATH: /opt/hostedtoolcache/Python/3.11.13/x64/lib
    SUPABASE_URL: ***
    SUPABASE_SERVICE_ROLE_KEY:***
Starting Supabase sync...
[2025-07-14 11:18:01] 🚀 Starting sync from temp_data
[2025-07-14 11:18:01] 📖 Processed novel '黎明のラビリンス' with 1 episodes
[2025-07-14 11:18:01] 📖 Processed novel '季節の物語' with 4 episodes
[2025-07-14 11:18:01] 📖 Processed novel '星の神殿' with 4 episodes
[2025-07-14 11:18:01] 📊 Summary: 3 novels, 9 episodes
[2025-07-14 11:18:01] 🔄 Upserting 3 records to 'novels'...
[2025-07-14 11:18:02] ❌ Error upserting to 'novels': 400 Client Error: Bad Request for url: ***/rest/v1/novels
Error: Process completed with exit code 1.

これログもうちょっと出しましょうか
