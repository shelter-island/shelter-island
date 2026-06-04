#!/bin/bash

set -u

BASE_DIR="/Users/itouyasuhito/Documents/チームアイコン/YASU GAME PIPELINE"
LOG_DIR="${BASE_DIR}/Logs"
LOG_FILE="${LOG_DIR}/pipeline.log"
LOCK_DIR="${LOG_DIR}/.pipeline.lock"

mkdir -p "$LOG_DIR"

log() {
  printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*" >> "$LOG_FILE"
}

if ! mkdir "$LOCK_DIR" 2>/dev/null; then
  log "SKIP: pipeline is already running"
  exit 0
fi
trap 'rm -rf "$LOCK_DIR"' EXIT

log "RUN"
"/Users/itouyasuhito/Documents/チームアイコン/YASU GAME PIPELINE/Scripts/01_original_to_iphone.sh"
"/Users/itouyasuhito/Documents/チームアイコン/YASU GAME PIPELINE/Scripts/02_iphone_to_webp.sh"
log "DONE"
