#!/bin/bash

set -u

PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"

BASE_DIR="/Users/itouyasuhito/Documents/チームアイコン/YASU GAME PIPELINE"
IN_DIR="${BASE_DIR}/01_ORIGINAL IN"
OUT_DIR="${BASE_DIR}/02_IPHONE SIZE OUT"
LOG_DIR="${BASE_DIR}/Logs"
STATE_FILE="${LOG_DIR}/01_original_to_iphone.state"
LOG_FILE="${LOG_DIR}/01_original_to_iphone.log"
LOCK_DIR="${LOG_DIR}/.01_original_to_iphone.lock"
WIDTH=720
HEIGHT=1280
DEFAULT_PIPELINE_MODE="${PIPELINE_MODE:-FILL}"

case "$DEFAULT_PIPELINE_MODE" in
  FILL|FIT) ;;
  *)
    DEFAULT_PIPELINE_MODE="FILL"
    ;;
esac

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

command -v magick >/dev/null 2>&1 || fail "ImageMagick was not found."
command -v sips >/dev/null 2>&1 || fail "sips was not found."
command -v file >/dev/null 2>&1 || fail "file command was not found."

acquire_lock() {
  if ! mkdir "$LOCK_DIR" 2>/dev/null; then
    log "SKIP: another original-to-iphone run is already running"
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

is_supported_image() {
  local src="$1"
  local name ext description mime

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

  ext=$(printf '%s' "${name##*.}" | tr '[:upper:]' '[:lower:]')
  case "$ext" in
    png|jpg|jpeg) ;;
    *)
      log "SKIP: unsupported extension: $src"
      return 1
      ;;
  esac

  wait_until_stable "$src"
  description=$(file "$src" 2>/dev/null || true)
  mime=$(file -b --mime-type "$src" 2>/dev/null || true)

  case "$description" in
    *"PNG image data"*|*"JPEG image data"*) ;;
    *)
      log "WARN: file command did not confirm PNG/JPEG image data, rescue will still try: $src | $description"
      ;;
  esac

  case "$mime" in
    image/png|image/jpeg) return 0 ;;
    *)
      log "WARN: MIME type is not image/png or image/jpeg, rescue will still try: $src | $mime"
      return 0
      ;;
  esac
}

relative_dir_for() {
  local src="$1"
  local dir rel
  dir=$(dirname "$src")
  rel="${dir#$IN_DIR}"
  rel="${rel#/}"
  printf '%s\n' "$rel"
}

mode_for_relative_dir() {
  local relative_dir="$1"

  case "$relative_dir" in
    FIT|FIT/*) printf '%s\n' "FIT" ;;
    FILL|FILL/*) printf '%s\n' "FILL" ;;
    *) printf '%s\n' "$DEFAULT_PIPELINE_MODE" ;;
  esac
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

  candidate="${target_dir}/${stem}.png"
  index=1
  while [ -e "$candidate" ]; do
    candidate="${target_dir}/${stem}_${index}.png"
    index=$((index + 1))
  done

  printf '%s\n' "$candidate"
}

render_iphone_png() {
  local input="$1"
  local output="$2"
  local mode="$3"

  if [ "$mode" = "FILL" ]; then
    magick "$input" -auto-orient -resize "${WIDTH}x${HEIGHT}^" -gravity center -extent "${WIDTH}x${HEIGHT}" "$output" 2>>"$LOG_FILE"
  else
    magick "$input" -auto-orient -resize "${WIDTH}x${HEIGHT}>" -background black -gravity center -extent "${WIDTH}x${HEIGHT}" "$output" 2>>"$LOG_FILE"
  fi
}

attempt_with_temp() {
  local label="$1"
  local temp="$2"
  local out="$3"
  local mode="$4"

  if [ -f "$temp" ] && render_iphone_png "$temp" "$out" "$mode"; then
    log "RESCUE SUCCESS (${label}): $temp -> $out"
    return 0
  fi

  log "RESCUE FAILED (${label})"
  rm -f "$out"
  return 1
}

convert_with_rescue() {
  local src="$1"
  local out="$2"
  local mode="$3"
  local tmpdir rgb magick_saved sips_saved flattened

  log "TRY normal: $src"
  if render_iphone_png "$src" "$out" "$mode"; then
    log "SUCCESS normal: $src -> $out"
    return 0
  fi
  rm -f "$out"
  log "FAILED normal: $src"

  tmpdir=$(mktemp -d)
  rgb="${tmpdir}/rgb.png"
  magick_saved="${tmpdir}/magick-resaved.png"
  sips_saved="${tmpdir}/sips-resaved.png"
  flattened="${tmpdir}/flattened.png"

  log "TRY rescue RGB: $src"
  if magick "$src" -auto-orient -colorspace sRGB "$rgb" 2>>"$LOG_FILE" && attempt_with_temp "RGB convert" "$rgb" "$out" "$mode"; then
    rm -rf "$tmpdir"
    return 0
  fi

  log "TRY rescue ImageMagick resave: $src"
  if magick "$src" -auto-orient "$magick_saved" 2>>"$LOG_FILE" && attempt_with_temp "ImageMagick resave" "$magick_saved" "$out" "$mode"; then
    rm -rf "$tmpdir"
    return 0
  fi

  log "TRY rescue sips resave: $src"
  if sips -s format png "$src" --out "$sips_saved" >/dev/null 2>>"$LOG_FILE" && attempt_with_temp "sips resave" "$sips_saved" "$out" "$mode"; then
    rm -rf "$tmpdir"
    return 0
  fi

  log "TRY rescue screenshot-style flatten: $src"
  if magick "$src" -auto-orient -background black -alpha remove -alpha off -flatten "$flattened" 2>>"$LOG_FILE" && attempt_with_temp "screenshot-style flatten" "$flattened" "$out" "$mode"; then
    rm -rf "$tmpdir"
    return 0
  fi

  rm -rf "$tmpdir"
  log "FAILED: all rescue attempts failed: $src"
  return 1
}

process_file() {
  local src="$1"
  local name stem relative_dir out signature previous_output mode

  is_supported_image "$src" || return 0

  signature=$(file_signature "$src")
  previous_output=$(state_output_for "$signature")
  if [ -n "$previous_output" ] && [ -f "$previous_output" ]; then
    log "SKIP: already processed: $src -> $previous_output"
    return 0
  fi

  name=$(basename "$src")
  stem="${name%.*}"
  relative_dir=$(relative_dir_for "$src")
  mode=$(mode_for_relative_dir "$relative_dir")
  out=$(unique_output_path "$stem" "$relative_dir")

  log "START: $src"
  log "[MODE] $mode for $src"
  if convert_with_rescue "$src" "$out" "$mode"; then
    log "SUCCESS: $src -> $out"
    mark_processed "$signature" "$out"
  else
    log "FAILED: could not create iPhone PNG: $src"
    rm -f "$out"
  fi
}

log "RUN"
log "[DEFAULT MODE] $DEFAULT_PIPELINE_MODE"
acquire_lock

while IFS= read -r -d '' file; do
  process_file "$file"
done < <(find "$IN_DIR" -type f \( -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' \) -print0)

log "DONE"
