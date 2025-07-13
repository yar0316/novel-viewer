#!/usr/bin/env python3
"""
小説データをSupabaseに同期するスクリプト
GitHub Actionsから実行される
"""

import os
import sys
import json
import glob
import requests
import yaml
import frontmatter
from datetime import datetime
from pathlib import Path

# 環境変数からSupabase情報を取得
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SERVICE_KEY:
    print("❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.")
    sys.exit(1)

# Supabase REST API用のヘッダー
HEADERS = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "resolution=merge-duplicates",  # UPSERTのキー
}

def log(message):
    """タイムスタンプ付きログ出力"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] {message}")

def upsert_data(table_name, data):
    """SupabaseにデータをUPSERTする"""
    if not data:
        log(f"⚠️  No data to upsert for table '{table_name}'")
        return
    
    url = f"{SUPABASE_URL}/rest/v1/{table_name}"
    
    try:
        log(f"🔄 Upserting {len(data)} records to '{table_name}'...")
        response = requests.post(url, headers=HEADERS, json=data)
        response.raise_for_status()
        log(f"✅ Successfully upserted {len(data)} records to '{table_name}'")
        
    except requests.exceptions.RequestException as e:
        log(f"❌ Error upserting to '{table_name}': {e}")
        if hasattr(e, 'response') and e.response:
            log(f"Response status: {e.response.status_code}")
            log(f"Response body: {e.response.text}")
        sys.exit(1)

def process_novel_directory(novel_dir):
    """小説ディレクトリを処理してデータを抽出"""
    novel_path = Path(novel_dir)
    
    # info.ymlから小説情報を取得
    info_file = novel_path / "info.yml"
    if not info_file.exists():
        log(f"⚠️  Skipping {novel_path.name}: info.yml not found")
        return None, []
    
    try:
        with open(info_file, 'r', encoding='utf-8') as f:
            novel_data = yaml.safe_load(f)
    except Exception as e:
        log(f"❌ Error reading {info_file}: {e}")
        return None, []
    
    # 必須フィールドの確認
    required_fields = ['id', 'title', 'author']
    for field in required_fields:
        if field not in novel_data:
            log(f"❌ Missing required field '{field}' in {info_file}")
            return None, []
    
    # 現在時刻を更新日時として設定
    novel_data['updated_at'] = datetime.now().isoformat()
    
    # エピソードファイルを処理
    episodes_data = []
    episode_files = sorted(novel_path.glob("*.md"))
    
    for episode_file in episode_files:
        try:
            with open(episode_file, 'r', encoding='utf-8') as f:
                post = frontmatter.load(f)
            
            episode = post.metadata.copy()
            episode['novel_id'] = novel_data['id']
            episode['content'] = post.content
            episode['updated_at'] = datetime.now().isoformat()
            
            # 必須フィールドの確認
            if 'id' not in episode:
                log(f"⚠️  Episode {episode_file.name} missing 'id', skipping")
                continue
            
            episodes_data.append(episode)
            
        except Exception as e:
            log(f"❌ Error processing {episode_file}: {e}")
            continue
    
    log(f"📖 Processed novel '{novel_data['title']}' with {len(episodes_data)} episodes")
    return novel_data, episodes_data

def main():
    """メイン処理"""
    if len(sys.argv) != 2:
        print("Usage: python sync_supabase.py <data_directory>")
        sys.exit(1)
    
    data_dir = Path(sys.argv[1])
    
    if not data_dir.exists():
        log(f"❌ Data directory {data_dir} does not exist")
        sys.exit(1)
    
    log(f"🚀 Starting sync from {data_dir}")
    
    # novelsディレクトリを探す
    novels_dir = data_dir / "novels"
    if not novels_dir.exists():
        log(f"❌ Novels directory {novels_dir} does not exist")
        sys.exit(1)
    
    all_novels = []
    all_episodes = []
    
    # 各小説ディレクトリを処理
    for novel_dir in novels_dir.iterdir():
        if novel_dir.is_dir():
            novel_data, episodes_data = process_novel_directory(novel_dir)
            if novel_data:
                all_novels.append(novel_data)
                all_episodes.extend(episodes_data)
    
    if not all_novels:
        log("⚠️  No valid novels found to sync")
        return
    
    # Supabaseに同期
    log(f"📊 Summary: {len(all_novels)} novels, {len(all_episodes)} episodes")
    
    upsert_data("novels", all_novels)
    if all_episodes:
        upsert_data("episodes", all_episodes)
    
    log("🎉 Sync completed successfully!")

if __name__ == "__main__":
    main()