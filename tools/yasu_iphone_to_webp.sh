#!/bin/bash

set -u

PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"

BASE_DIR="/Users/itouyasuhito/Documents/チームアイコン/YASU GAME PIPELINE"
IN_DIR="${BASE_DIR}/02_IPHONE SIZE OUT"
OUT_DIR="${BASE_DIR}/03_WEBP OUT"
LOG_DIR="${BASE_DIR}/Logs"
STATE_FILE="${LOG_DIR}/02_iphone_to_webp.state"
LOG_FILE="${LOG_DIR}/02_iphone_to_webp.log"
LOCK_DIR="${LOG_DIR}/.02_iphone_to_webp.lock"
QUALITY=82

mkdir -p "$IN_DIR" "$OUT_DIR" "$LOG_DIR"
touch "$STATE_FILE"

log() {
  printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*" >> "$LOG_FILE"
}

fail() {
  log "ERROR: $1"
  echo "Error: $1" >&2
  exit 1
}

command -v cwebp >/dev/null 2>&1 || fail "cwebp was not found."
command -v file >/dev/null 2>&1 || fail "file command was not found."

acquire_lock() {
  if ! mkdir "$LOCK_DIR" 2>/dev/null; then
    log "SKIP: another iphone-to-webp run is already running"
    exit 0
  fi
  trap 'rm -rf "$LOCK_DIR"' EXIT
}

wait_until_stable() {
  local file="$1"
  local old_size=-1
  local new_size=-2
  local tries=0

  while [ "$old_size" != "$new_size" ] && [ "$tries" -lt 10 ]; do
    old_size="$new_size"
    sleep 1
    new_size=$(stat -f%z "$file" 2>/dev/null || echo -1)
    tries=$((tries + 1))
  done
}

file_signature() {
  stat -f '%N|%z|%m' "$1" 2>/dev/null || true
}

state_output_for() {
  local signature="$1"
  awk -F '\t' -v sig="$signature" '$1 == sig { print $2; exit }' "$STATE_FILE"
}

mark_processed() {
  local signature="$1"
  local output="$2"
  printf '%s\t%s\n' "$signature" "$output" >> "$STATE_FILE"
}

is_supported_png() {
  local src="$1"
  local name description mime

  [ -f "$src" ] || {
    log "SKIP: not a regular file: $src"
    return 1
  }

  name=$(basename "$src")
  case "$name" in
    .*|.DS_Store)
      log "SKIP: hidden/system file: $src"
      return 1
      ;;
  esac

  case "$(printf '%s' "${name##*.}" | tr '[:upper:]' '[:lower:]')" in
    png) ;;
    *)
      log "SKIP: unsupported extension: $src"
      return 1
      ;;
  esac

  wait_until_stable "$src"
  description=$(file "$src" 2>/dev/null || true)
  mime=$(file -b --mime-type "$src" 2>/dev/null || true)

  case "$description" in
    *"PNG image data"*) ;;
    *)
      log "SKIP: not PNG image data: $src | $description"
      return 1
      ;;
  esac

  [ "$mime" = "image/png" ] || {
    log "SKIP: unsupported MIME type: $src | $mime"
    return 1
  }
}

relative_dir_for() {
  local src="$1"
  local dir rel
  dir=$(dirname "$src")
  rel="${dir#$IN_DIR}"
  rel="${rel#/}"
  printf '%s\n' "$rel"
}

unique_output_path() {
  local stem="$1"
  local relative_dir="$2"
  local target_dir="$OUT_DIR"
  local candidate index

  if [ -n "$relative_dir" ]; then
    target_dir="${OUT_DIR}/${relative_dir}"
  fi
  mkdir -p "$target_dir"

  candidate="${target_dir}/${stem}.webp"
  index=1
  while [ -e "$candidate" ]; do
    candidate="${target_dir}/${stem}_${index}.webp"
    index=$((index + 1))
  done

  printf '%s\n' "$candidate"
}

process_file() {
  local src="$1"
  local name stem relative_dir out signature previous_output

  is_supported_png "$src" || return 0

  signature=$(file_signature "$src")
  previous_output=$(state_output_for "$signature")
  if [ -n "$previous_output" ] && [ -f "$previous_output" ]; then
    log "SKIP: already processed: $src -> $previous_output"
    return 0
  fi

  name=$(basename "$src")
  stem="${name%.*}"
  relative_dir=$(relative_dir_for "$src")
  out=$(unique_output_path "$stem" "$relative_dir")

  log "START: $src"
  if cwebp -quiet -q "$QUALITY" -m 6 -metadata none "$src" -o "$out"; then
    log "SUCCESS: $src -> $out"
    mark_processed "$signature" "$out"
  else
    log "FAIL: cwebp conversion failed: $src"
    rm -f "$out"
  fi
}

log "RUN"
acquire_lock

while IFS= read -r -d '' file; do
  process_file "$file"
done < <(find "$IN_DIR" -type f -iname '*.png' -print0)

log "DONE"
