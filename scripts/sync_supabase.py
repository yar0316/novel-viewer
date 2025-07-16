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
    "Prefer": "return=minimal",  # INSERT用ヘッダー
}

def log(message):
    """タイムスタンプ付きログ出力"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] {message}")

def validate_novel_data(novel_data):
    """小説データの妥当性をチェック"""
    required_fields = ['title', 'author']
    for field in required_fields:
        if field not in novel_data or not novel_data[field]:
            return False, f"Required field '{field}' is missing or empty"
    
    # tagsが配列であることを確認
    if 'tags' in novel_data and not isinstance(novel_data['tags'], list):
        return False, "tags must be an array"
    
    return True, "OK"

def insert_data(table_name, data):
    """SupabaseにデータをINSERTする"""
    if not data:
        log(f"⚠️  No data to insert for table '{table_name}'")
        return None
    
    # novelsテーブルの場合はデータ妥当性をチェック
    if table_name == 'novels':
        for i, record in enumerate(data):
            is_valid, error_msg = validate_novel_data(record)
            if not is_valid:
                log(f"❌ Data validation failed for record {i+1}: {error_msg}")
                log(f"🔍 Invalid record: {json.dumps(record, indent=2, ensure_ascii=False, default=str)}")
                return None
    
    url = f"{SUPABASE_URL}/rest/v1/{table_name}"
    
    try:
        log(f"➕ Inserting {len(data)} records to '{table_name}'...")
        log(f"📤 Request URL: {url}")
        log(f"📋 Headers: {json.dumps({k: v for k, v in HEADERS.items() if k != 'Authorization'}, indent=2)}")
        
        # レスポンスデータを取得するためにヘッダーを追加
        headers_with_return = HEADERS.copy()
        headers_with_return["Prefer"] = "return=representation"  # INSERTでレスポンスデータを取得
        
        response = requests.post(url, headers=headers_with_return, json=data)
        log(f"📥 Response status: {response.status_code}")
        
        response.raise_for_status()
        log(f"✅ Successfully inserted {len(data)} records to '{table_name}'")
        
        # レスポンスデータを返す
        return response.json()
        
    except requests.exceptions.RequestException as e:
        log(f"❌ Error inserting to '{table_name}': {e}")
        if hasattr(e, 'response') and e.response:
            log(f"Response status: {e.response.status_code}")
            log(f"Response body: {e.response.text}")
            
            # Supabaseエラーの詳細解析
            try:
                error_json = e.response.json()
                log(f"📋 Supabase error details: {json.dumps(error_json, indent=2, ensure_ascii=False)}")
                
                # 具体的なエラーメッセージがあるかチェック
                if 'message' in error_json:
                    log(f"💡 Error message: {error_json['message']}")
                if 'hint' in error_json:
                    log(f"💡 Hint: {error_json['hint']}")
                if 'details' in error_json:
                    log(f"💡 Details: {error_json['details']}")
                    
            except:
                log("📋 Could not parse error response as JSON")
        
        # データの詳細出力
        log(f"🔍 Data being sent to '{table_name}':")
        for i, record in enumerate(data[:3]):  # 最初の3件のみ表示
            log(f"  Record {i+1}: {json.dumps(record, indent=2, ensure_ascii=False, default=str)}")
            # データ型の確認
            log(f"  Record {i+1} types:")
            for key, value in record.items():
                log(f"    {key}: {type(value).__name__} = {value}")
        if len(data) > 3:
            log(f"  ... and {len(data) - 3} more records")
        
        sys.exit(1)
    
    return None

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
    
    # 必須フィールドの確認（idは自動採番のため不要）
    required_fields = ['title', 'author']
    for field in required_fields:
        if field not in novel_data:
            log(f"❌ Missing required field '{field}' in {info_file}")
            return None, []
    
    # IDが存在する場合は一時的に保存（episodeとの関連付けに使用）
    temp_novel_id = novel_data.get('id', novel_data['title'])  # IDがない場合はタイトルを使用
    
    # データベースの自動採番を使用するため、idフィールドを削除
    if 'id' in novel_data:
        del novel_data['id']
    
    # 一時IDを保存（後でマッピングに使用）
    novel_data['temp_novel_id'] = temp_novel_id
    
    # フィールド名をデータベーススキーマに合わせて変更
    if 'description' in novel_data:
        novel_data['summary'] = novel_data.pop('description')
    
    # データベーススキーマに存在しないフィールドを削除
    fields_to_remove = ['status']
    for field in fields_to_remove:
        if field in novel_data:
            del novel_data[field]
    
    # tagsフィールドが存在しない場合は空の配列を設定
    if 'tags' not in novel_data:
        novel_data['tags'] = []
    
    # tagsが文字列の場合は配列に変換
    if isinstance(novel_data.get('tags'), str):
        novel_data['tags'] = [novel_data['tags']]
    
    # tagsが配列でない場合は空の配列に設定
    if not isinstance(novel_data.get('tags'), list):
        novel_data['tags'] = []
    
    # tagsの各要素が文字列であることを確認
    novel_data['tags'] = [str(tag).strip() for tag in novel_data['tags'] if tag]
    
    # 日付フィールドを適切なTIMESTAMP形式に変換
    if 'created_at' in novel_data:
        # YYYY-MM-DD形式をTIMESTAMP形式に変換
        try:
            from datetime import datetime as dt
            created_date = dt.strptime(novel_data['created_at'], '%Y-%m-%d')
            novel_data['created_at'] = created_date.isoformat() + 'Z'
        except ValueError:
            # 変換失敗時は現在日時を使用
            novel_data['created_at'] = datetime.now().isoformat() + 'Z'
    
    # 現在時刻を更新日時として設定
    novel_data['updated_at'] = datetime.now().isoformat() + 'Z'
    
    # デバッグ: 処理後のデータを確認
    log(f"🔍 Processed novel data: {json.dumps(novel_data, indent=2, ensure_ascii=False, default=str)}")
    
    # エピソードファイルを処理
    episodes_data = []
    episode_files = sorted(novel_path.glob("*.md"))
    
    for episode_file in episode_files:
        try:
            with open(episode_file, 'r', encoding='utf-8') as f:
                post = frontmatter.load(f)
            
            episode = post.metadata.copy()
            episode['temp_novel_id'] = temp_novel_id  # 一時的にinfo.ymlのIDを保存
            episode['content'] = post.content
            
            # episodesテーブルのスキーマに存在しないフィールドを削除
            if 'updated_at' in episode:
                del episode['updated_at']
            
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
    
    # 書名ディレクトリを探す（novels廃止、直接書名ディレクトリを探索）
    all_novels = []
    all_episodes = []
    
    # データディレクトリ直下の各書名ディレクトリを処理
    for book_dir in data_dir.iterdir():
        if book_dir.is_dir() and not book_dir.name.startswith('.'):
            # manuscript ディレクトリがあるかチェック
            manuscript_dir = book_dir / "manuscript"
            if manuscript_dir.exists() and manuscript_dir.is_dir():
                novel_data, episodes_data = process_novel_directory(manuscript_dir)
                if novel_data:
                    all_novels.append(novel_data)
                    all_episodes.extend(episodes_data)
            else:
                log(f"⚠️  Skipping {book_dir.name}: manuscript directory not found")
    
    if not all_novels:
        log("⚠️  No valid novels found to sync")
        return
    
    # Supabaseに同期
    log(f"📊 Summary: {len(all_novels)} novels, {len(all_episodes)} episodes")
    
    # temp_novel_idを保存してからデータベースに送信するデータを準備
    novels_to_upsert = []
    temp_id_mapping = {}  # 元のIDを保存
    
    for i, novel_data in enumerate(all_novels):
        # temp_novel_idを保存
        temp_id = novel_data.get('temp_novel_id', novel_data.get('title'))
        temp_id_mapping[i] = temp_id
        
        # データベースに送信するデータをコピーしてtemp_novel_idを削除
        novel_copy = novel_data.copy()
        if 'temp_novel_id' in novel_copy:
            del novel_copy['temp_novel_id']
        novels_to_upsert.append(novel_copy)
    
    # 1. novelsをINSERTして、実際のIDを取得
    novel_response = insert_data("novels", novels_to_upsert)
    
    if novel_response and all_episodes:
        # 2. レスポンスから実際のnovel IDを取得してepisodesに設定
        log("🔗 Mapping novel IDs to episodes...")
        
        # temp_novel_idと実際のIDのマッピングを作成
        id_mapping = {}
        for i, novel_response_item in enumerate(novel_response):
            if i in temp_id_mapping:
                temp_id = temp_id_mapping[i]
                actual_id = novel_response_item['id']  # DB自動採番ID
                if temp_id:
                    id_mapping[temp_id] = actual_id
                    log(f"  {temp_id} → {actual_id}")
        
        # 3. episodesのnovel_idを実際のIDに更新
        for episode in all_episodes:
            temp_id = episode.get('temp_novel_id')
            if temp_id in id_mapping:
                episode['novel_id'] = id_mapping[temp_id]
                del episode['temp_novel_id']  # 一時フィールドを削除
            else:
                log(f"⚠️  Could not map episode {episode.get('id')} to novel ID")
        
        # 4. episodesをINSERT
        insert_data("episodes", all_episodes)
    
    log("🎉 Sync completed successfully!")

if __name__ == "__main__":
    main()