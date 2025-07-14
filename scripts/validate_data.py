#!/usr/bin/env python3
"""
小説データの構造を検証するスクリプト
"""

import sys
import yaml
import frontmatter
from pathlib import Path

def log(message):
    """ログ出力"""
    print(f"[VALIDATE] {message}")

def validate_novel_directory(novel_dir):
    """小説ディレクトリの構造を検証"""
    novel_path = Path(novel_dir)
    errors = []
    warnings = []
    
    # info.ymlの存在確認
    info_file = novel_path / "info.yml"
    if not info_file.exists():
        errors.append(f"Missing info.yml in {novel_path.name}")
        return errors, warnings
    
    # info.ymlの内容検証
    try:
        with open(info_file, 'r', encoding='utf-8') as f:
            novel_data = yaml.safe_load(f)
    except Exception as e:
        errors.append(f"Invalid YAML in {info_file}: {e}")
        return errors, warnings
    
    # 必須フィールドの確認（idは自動採番のため不要）
    required_fields = ['title', 'author']
    for field in required_fields:
        if field not in novel_data:
            errors.append(f"Missing required field '{field}' in {info_file}")
    
    # エピソードファイルの検証
    episode_files = list(novel_path.glob("*.md"))
    if not episode_files:
        warnings.append(f"No episode files found in {novel_path.name}")
    
    episode_ids = set()
    for episode_file in episode_files:
        try:
            with open(episode_file, 'r', encoding='utf-8') as f:
                post = frontmatter.load(f)
            
            # 必須フィールドの確認
            if 'id' not in post.metadata:
                errors.append(f"Missing 'id' in {episode_file.name}")
            else:
                episode_id = post.metadata['id']
                if episode_id in episode_ids:
                    errors.append(f"Duplicate episode ID '{episode_id}' in {novel_path.name}")
                episode_ids.add(episode_id)
            
            if 'title' not in post.metadata:
                warnings.append(f"Missing 'title' in {episode_file.name}")
            
            if not post.content.strip():
                warnings.append(f"Empty content in {episode_file.name}")
                
        except Exception as e:
            errors.append(f"Error reading {episode_file}: {e}")
    
    return errors, warnings

def main():
    """メイン処理"""
    if len(sys.argv) != 2:
        print("Usage: python validate_data.py <data_directory>")
        sys.exit(1)
    
    data_dir = Path(sys.argv[1])
    
    if not data_dir.exists():
        log(f"❌ Data directory {data_dir} does not exist")
        sys.exit(1)
    
    log(f"🔍 Validating data structure in {data_dir}")
    
    total_errors = []
    total_warnings = []
    novel_count = 0
    
    # データディレクトリ直下の各書名ディレクトリを検証
    for book_dir in data_dir.iterdir():
        if book_dir.is_dir() and not book_dir.name.startswith('.'):
            # manuscript ディレクトリがあるかチェック
            manuscript_dir = book_dir / "manuscript"
            if manuscript_dir.exists() and manuscript_dir.is_dir():
                novel_count += 1
                errors, warnings = validate_novel_directory(manuscript_dir)
                total_errors.extend(errors)
                total_warnings.extend(warnings)
            else:
                total_warnings.append(f"Skipping {book_dir.name}: manuscript directory not found")
    
    # 結果の出力
    log(f"📊 Validated {novel_count} novels")
    
    if total_warnings:
        log(f"⚠️  {len(total_warnings)} warnings:")
        for warning in total_warnings:
            log(f"  - {warning}")
    
    if total_errors:
        log(f"❌ {len(total_errors)} errors:")
        for error in total_errors:
            log(f"  - {error}")
        sys.exit(1)
    
    log("✅ All validations passed!")

if __name__ == "__main__":
    main()