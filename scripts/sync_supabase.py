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

def update_data(table_name, data, match_field):
    """SupabaseのデータをUPDATEする"""
    if not data:
        log(f"⚠️  No data to update for table '{table_name}'")
        return None
    
    url = f"{SUPABASE_URL}/rest/v1/{table_name}"
    
    try:
        log(f"🔄 Updating {len(data)} records in '{table_name}'...")
        
        # レスポンスデータを取得するためにヘッダーを追加
        headers_with_return = HEADERS.copy()
        headers_with_return["Prefer"] = "return=representation"
        
        updated_records = []
        for record in data:
            if match_field not in record:
                log(f"⚠️  Skipping record without {match_field}: {record}")
                continue
            
            # マッチフィールドの値を取得してURLに追加
            match_value = record[match_field]
            update_url = f"{url}?{match_field}=eq.{match_value}"
            
            # マッチフィールドをデータから除外（UPDATEでは不要）
            update_record = {k: v for k, v in record.items() if k != match_field}
            
            response = requests.patch(update_url, headers=headers_with_return, json=update_record)
            log(f"📥 Update response status for {match_field}={match_value}: {response.status_code}")
            
            response.raise_for_status()
            
            if response.json():
                updated_records.extend(response.json())
        
        log(f"✅ Successfully updated {len(updated_records)} records in '{table_name}'")
        return updated_records
        
    except requests.exceptions.RequestException as e:
        log(f"❌ Error updating '{table_name}': {e}")
        if hasattr(e, 'response') and e.response:
            log(f"Response status: {e.response.status_code}")
            log(f"Response body: {e.response.text}")
        sys.exit(1)
    
    return None

def delete_data(table_name, ids, match_field):
    """SupabaseからデータをDELETEする"""
    if not ids:
        log(f"⚠️  No data to delete from table '{table_name}'")
        return None
    
    url = f"{SUPABASE_URL}/rest/v1/{table_name}"
    
    try:
        log(f"🗑️  Deleting {len(ids)} records from '{table_name}'...")
        
        deleted_count = 0
        for id_value in ids:
            delete_url = f"{url}?{match_field}=eq.{id_value}"
            
            response = requests.delete(delete_url, headers=HEADERS)
            log(f"📥 Delete response status for {match_field}={id_value}: {response.status_code}")
            
            response.raise_for_status()
            deleted_count += 1
        
        log(f"✅ Successfully deleted {deleted_count} records from '{table_name}'")
        return deleted_count
        
    except requests.exceptions.RequestException as e:
        log(f"❌ Error deleting from '{table_name}': {e}")
        if hasattr(e, 'response') and e.response:
            log(f"Response status: {e.response.status_code}")
            log(f"Response body: {e.response.text}")
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
    
    # 必須フィールドの確認
    required_fields = ['title', 'author', 'published']
    for field in required_fields:
        if field not in novel_data:
            log(f"❌ Missing required field '{field}' in {info_file}")
            return None, []
    
    # publishedがfalseの場合は処理をスキップ
    if not novel_data.get('published', False):
        log(f"⚠️  Skipping {novel_path.name}: published=false")
        return None, []
    
    # updatedフィールドのデフォルト値設定
    updated = novel_data.get('updated', False)
    novel_id = novel_data.get('id')
    
    # 処理ロジックの判定
    if novel_id is not None and updated:
        # IDが指定されていてupdated=trueの場合は更新
        operation = 'update'
        log(f"📝 Novel '{novel_data['title']}' will be updated (id={novel_id})")
    elif novel_id is None:
        # IDが指定されていない場合は新規作成
        operation = 'insert'
        log(f"➕ Novel '{novel_data['title']}' will be inserted as new")
    else:
        # それ以外の場合は無視
        log(f"⚠️  Skipping {novel_path.name}: id exists but updated=false")
        return None, []
    
    # 一時IDを保存（episodeとの関連付けに使用）
    temp_novel_id = novel_id if novel_id is not None else novel_data['title']
    novel_data['temp_novel_id'] = temp_novel_id
    novel_data['operation'] = operation
    
    # フィールド名をデータベーススキーマに合わせて変更
    if 'description' in novel_data:
        novel_data['summary'] = novel_data.pop('description')
    
    # データベーススキーマに存在しないフィールドを削除
    fields_to_remove = ['status', 'published', 'updated']
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
            
            # statusフィールドのデフォルト値設定
            episode_status = episode.get('status', 'new')
            
            # statusに応じた処理フラグを設定
            if episode_status == 'draft':
                # 下書きは無視
                log(f"⚠️  Skipping episode {episode_file.name}: status=draft")
                continue
            elif episode_status == 'deleted':
                # 削除対象としてマーク
                episode['operation'] = 'delete'
            elif episode_status == 'updated':
                # 更新対象としてマーク
                episode['operation'] = 'update'
            elif episode_status == 'new':
                # 新規作成対象としてマーク
                episode['operation'] = 'insert'
            else:
                log(f"⚠️  Unknown status '{episode_status}' for episode {episode_file.name}, treating as 'new'")
                episode['operation'] = 'insert'
            
            # episodesテーブルのスキーマに存在しないフィールドを削除
            fields_to_remove = ['updated_at', 'status']
            for field in fields_to_remove:
                if field in episode:
                    del episode[field]
            
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
    
    # 小説の操作別に分類
    novels_to_insert = []
    novels_to_update = []
    temp_id_mapping = {}  # 元のIDを保存
    
    for i, novel_data in enumerate(all_novels):
        # temp_novel_idを保存
        temp_id = novel_data.get('temp_novel_id', novel_data.get('title'))
        temp_id_mapping[i] = temp_id
        
        # データベースに送信するデータをコピー
        novel_copy = novel_data.copy()
        operation = novel_copy.pop('operation', 'insert')
        novel_copy.pop('temp_novel_id', None)
        
        if operation == 'update':
            novels_to_update.append(novel_copy)
        else:
            novels_to_insert.append(novel_copy)
    
    # 1. 小説の処理
    novel_response = None
    id_mapping = {}
    
    # 新規小説をINSERT
    if novels_to_insert:
        novel_response = insert_data("novels", novels_to_insert)
        if novel_response:
            # 新規作成された小説のIDマッピングを作成
            insert_index = 0
            for i, novel_data in enumerate(all_novels):
                if novel_data.get('operation') == 'insert':
                    temp_id = temp_id_mapping[i]
                    if insert_index < len(novel_response):
                        actual_id = novel_response[insert_index]['id']
                        id_mapping[temp_id] = actual_id
                        log(f"  新規: {temp_id} → {actual_id}")
                        insert_index += 1
    
    # 既存小説をUPDATE
    if novels_to_update:
        update_response = update_data("novels", novels_to_update, "id")
        if update_response:
            # 更新された小説のIDマッピングを作成
            for i, novel_data in enumerate(all_novels):
                if novel_data.get('operation') == 'update':
                    temp_id = temp_id_mapping[i]
                    actual_id = novel_data.get('id')  # 更新の場合は元のIDを使用
                    if actual_id:
                        id_mapping[temp_id] = actual_id
                        log(f"  更新: {temp_id} → {actual_id}")
    
    # 2. エピソードの処理
    if all_episodes and id_mapping:
        log("🔗 Processing episodes...")
        
        # エピソードの操作別に分類
        episodes_to_insert = []
        episodes_to_update = []
        episodes_to_delete = []
        
        for episode in all_episodes:
            temp_id = episode.get('temp_novel_id')
            operation = episode.get('operation', 'insert')
            
            # novel_idを実際のIDに更新
            if temp_id in id_mapping:
                episode['novel_id'] = id_mapping[temp_id]
                episode.pop('temp_novel_id', None)
                episode.pop('operation', None)
                
                if operation == 'delete':
                    episodes_to_delete.append(episode['id'])
                elif operation == 'update':
                    episodes_to_update.append(episode)
                else:  # insert or new
                    episodes_to_insert.append(episode)
            else:
                log(f"⚠️  Could not map episode {episode.get('id')} to novel ID")
        
        # エピソードの削除
        if episodes_to_delete:
            delete_data("episodes", episodes_to_delete, "id")
        
        # エピソードの更新
        if episodes_to_update:
            update_data("episodes", episodes_to_update, "id")
        
        # エピソードの新規作成
        if episodes_to_insert:
            insert_data("episodes", episodes_to_insert)
    
    log("🎉 Sync completed successfully!")

if __name__ == "__main__":
    main()