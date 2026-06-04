#!/bin/bash

set -u

PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"

BASE_DIR="/Users/itouyasuhito/Documents/チームアイコン"
IN_DIR="${BASE_DIR}/PNG IN"
OUT_DIR="${BASE_DIR}/WEBP OUT"
LOG_FILE="${BASE_DIR}/Scripts/png-in-to-webp-out.log"
STATE_FILE="${BASE_DIR}/Scripts/png-in-to-webp-out.state"
LOCK_DIR="${BASE_DIR}/Scripts/.png-in-to-webp-out.lock"
WIDTH=720
HEIGHT=1280
QUALITY=82
ARCHIVE_OLD=1

mkdir -p "$IN_DIR" "$OUT_DIR" "$(dirname "$LOG_FILE")"
touch "$STATE_FILE"

WATCH_MODE=0
if [ "${1:-}" = "--watch-scan" ]; then
  WATCH_MODE=1
  shift
fi

log() {
  printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*" >> "$LOG_FILE"
}

acquire_lock() {
  if ! mkdir "$LOCK_DIR" 2>/dev/null; then
    log "SKIP: another conversion is already running"
    exit 0
  fi

  trap 'rm -rf "$LOCK_DIR"' EXIT
}

file_signature() {
  stat -f '%N|%z|%m' "$1" 2>/dev/null || true
}

already_processed() {
  local signature="$1"
  [ -n "$signature" ] && grep -Fqx "$signature" "$STATE_FILE"
}

mark_processed() {
  local signature="$1"
  [ -n "$signature" ] && printf '%s\n' "$signature" >> "$STATE_FILE"
}

notify() {
  if command -v osascript >/dev/null 2>&1; then
    osascript -e "display notification \"$1\" with title \"PNG IN to WEBP OUT\"" >/dev/null 2>&1 || true
  fi
}

fail() {
  echo "Error: $1" >&2
  log "ERROR: $1"
  notify "$1"
  exit 1
}

command -v sips >/dev/null 2>&1 || fail "sips was not found."
command -v magick >/dev/null 2>&1 || fail "ImageMagick was not found. Run: brew install imagemagick"
command -v cwebp >/dev/null 2>&1 || fail "cwebp was not found. Run: brew install webp"
command -v file >/dev/null 2>&1 || fail "file command was not found."

is_supported_image() {
  local src="$1"
  local mime description

  [ -f "$src" ] || {
    log "SKIP: not a regular file: $src"
    return 1
  }

  description=$(file "$src" 2>/dev/null || true)
  mime=$(file -b --mime-type "$src" 2>/dev/null || true)

  case "$description" in
    *"PNG image data"*|*"JPEG image data"*) ;;
    *)
      log "SKIP: file command did not identify image data: $src | $description"
      return 1
      ;;
  esac

  case "$mime" in
    image/png|image/jpeg) return 0 ;;
    *)
      log "SKIP: unsupported MIME type: $src | $mime"
      return 1
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

unique_output_path() {
  local stem="$1"
  local relative_dir="$2"
  local target_dir="$OUT_DIR"
  if [ -n "$relative_dir" ]; then
    target_dir="${OUT_DIR}/${relative_dir}"
  fi

  mkdir -p "$target_dir"

  local candidate="${target_dir}/${stem}.webp"
  local index=1

  while [ -e "$candidate" ]; do
    candidate="${target_dir}/${stem}_${index}.webp"
    index=$((index + 1))
  done

  printf '%s\n' "$candidate"
}

source_stem_exists() {
  local relative_dir="$1"
  local stem="$2"
  local source_dir="$IN_DIR"
  local candidate candidate_name candidate_stem

  if [ -n "$relative_dir" ]; then
    source_dir="${IN_DIR}/${relative_dir}"
  fi

  [ -d "$source_dir" ] || return 1

  while IFS= read -r -d '' candidate; do
    candidate_name=$(basename "$candidate")
    candidate_stem="${candidate_name%.*}"
    if [ "$candidate_stem" = "$stem" ]; then
      return 0
    fi
  done < <(find "$source_dir" -maxdepth 1 -type f \( -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' \) -print0)

  return 1
}

source_exists_for_webp() {
  local relative_dir="$1"
  local webp_stem="$2"
  local base_stem="$webp_stem"

  source_stem_exists "$relative_dir" "$webp_stem" && return 0

  case "$webp_stem" in
    *_[0-9]*)
      base_stem=$(printf '%s\n' "$webp_stem" | sed -E 's/_[0-9]+$//')
      [ "$base_stem" != "$webp_stem" ] && source_stem_exists "$relative_dir" "$base_stem" && return 0
      ;;
  esac

  return 1
}

unique_archive_path() {
  local relative_path="$1"
  local archive_root="${OUT_DIR}/_old/$(date '+%Y%m%d-%H%M%S')"
  local candidate="${archive_root}/${relative_path}"
  local dir stem ext index

  dir=$(dirname "$candidate")
  mkdir -p "$dir"

  stem="${candidate%.*}"
  ext="${candidate##*.}"
  index=1

  while [ -e "$candidate" ]; do
    candidate="${stem}_${index}.${ext}"
    index=$((index + 1))
  done

  printf '%s\n' "$candidate"
}

cleanup_stale_outputs() {
  local webp relative_path relative_dir filename stem archive_path

  while IFS= read -r -d '' webp; do
    relative_path="${webp#$OUT_DIR/}"
    case "$relative_path" in
      _old/*) continue ;;
    esac

    relative_dir=$(dirname "$relative_path")
    [ "$relative_dir" = "." ] && relative_dir=""

    filename=$(basename "$webp")
    stem="${filename%.*}"

    if source_exists_for_webp "$relative_dir" "$stem"; then
      log "KEEP: source exists for: $webp"
      continue
    fi

    if [ "$ARCHIVE_OLD" -eq 1 ]; then
      archive_path=$(unique_archive_path "$relative_path")
      mv "$webp" "$archive_path"
      log "ARCHIVE OLD: $webp -> $archive_path"
    else
      log "OLD CANDIDATE: $webp"
    fi
  done < <(find "$OUT_DIR" -type f -iname '*.webp' -print0)
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

process_file() {
  local src="$1"

  local name ext stem signature relative_dir
  name=$(basename "$src")
  case "$name" in
    .*)
      log "SKIP: hidden file: $src"
      return 0
      ;;
  esac

  case "$name" in
    .DS_Store)
      log "SKIP: .DS_Store: $src"
      return 0
      ;;
  esac

  ext=$(printf '%s' "${name##*.}" | tr '[:upper:]' '[:lower:]')
  case "$ext" in
    png|jpg|jpeg) ;;
    *)
      log "SKIP: unsupported extension: $src"
      return 0
      ;;
  esac

  wait_until_stable "$src"
  is_supported_image "$src" || return 0

  signature=$(file_signature "$src")
  if [ "$WATCH_MODE" -eq 1 ] && already_processed "$signature"; then
    log "SKIP: already processed: $src"
    return 0
  fi

  log "START: $src"
  signature=$(file_signature "$src")

  local info original_w original_h target_w target_h scale out tmpdir resized canvas
  info=$(sips -g pixelWidth -g pixelHeight "$src" 2>/dev/null) || {
    echo "Skipped unreadable image: $src" >&2
    log "FAIL: unreadable image: $src"
    return 0
  }

  original_w=$(printf '%s\n' "$info" | awk '/pixelWidth:/ {print $2; exit}')
  original_h=$(printf '%s\n' "$info" | awk '/pixelHeight:/ {print $2; exit}')

  [ -n "$original_w" ] && [ -n "$original_h" ] || {
    echo "Skipped image with unknown size: $src" >&2
    log "FAIL: unknown image size: $src"
    return 0
  }

  read -r target_w target_h <<EOF
$(awk -v w="$original_w" -v h="$original_h" -v maxw="$WIDTH" -v maxh="$HEIGHT" '
BEGIN {
  scale_w = maxw / w;
  scale_h = maxh / h;
  scale = scale_w < scale_h ? scale_w : scale_h;
  if (scale > 1) scale = 1;
  tw = int(w * scale + 0.5);
  th = int(h * scale + 0.5);
  if (tw < 1) tw = 1;
  if (th < 1) th = 1;
  print tw, th;
}')
EOF

  stem="${name%.*}"
  relative_dir=$(relative_dir_for "$src")
  out=$(unique_output_path "$stem" "$relative_dir")
  tmpdir=$(mktemp -d)
  resized="${tmpdir}/resized.png"
  canvas="${tmpdir}/canvas.png"

  if ! sips --resampleHeightWidth "$target_h" "$target_w" -s format png "$src" --out "$resized" >/dev/null 2>&1; then
    echo "Resize failed: $src" >&2
    log "FAIL: resize failed: $src"
    rm -rf "$tmpdir"
    return 0
  fi

  if ! magick -size "${WIDTH}x${HEIGHT}" xc:black "$resized" -gravity center -compose over -composite "$canvas"; then
    echo "Canvas failed: $src" >&2
    log "FAIL: canvas failed: $src"
    rm -rf "$tmpdir"
    return 0
  fi

  if ! cwebp -quiet -q "$QUALITY" -m 6 -metadata none "$canvas" -o "$out"; then
    echo "WebP conversion failed: $src" >&2
    log "FAIL: webp conversion failed: $src"
    rm -rf "$tmpdir"
    return 0
  fi

  rm -rf "$tmpdir"
  echo "Saved: $out"
  log "SUCCESS: $src -> $out"
  if [ "$WATCH_MODE" -eq 1 ]; then
    mark_processed "$signature"
  fi
}

log "RUN: $*"
acquire_lock

if [ "$#" -gt 0 ]; then
  for item in "$@"; do
    if [ -d "$item" ]; then
      while IFS= read -r -d '' file; do
        process_file "$file"
      done < <(find "$item" -type f \( -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' \) -print0)
    else
      process_file "$item"
    fi
  done
else
  while IFS= read -r -d '' file; do
    process_file "$file"
  done < <(find "$IN_DIR" -type f \( -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' \) -print0)
fi

cleanup_stale_outputs
log "DONE"
notify "Conversion finished."
