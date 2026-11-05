#!/usr/bin/env bash
set -Eeuo pipefail

ROOT=/var/www/mesob-backend-releases
LIVE=/var/www/mesob-adama/backend
URL=https://mesobbackend.adamacity.gov.et

health() {
    curl --fail --silent --show-error --max-time 20 "$URL/up" >/dev/null
    curl --fail --silent --show-error --max-time 20 "$URL/" >/dev/null
}

case "${1:-}" in
  init)
    if [[ -L "$LIVE" ]]; then
        echo "Production symlink already configured"
        health
        exit 0
    fi

    [[ -d "$LIVE" ]] || { echo "Live backend missing"; exit 1; }
    [[ -f "$LIVE/.env" ]] || { echo "Live .env missing"; exit 1; }

    BASE="/var/www/mesob-adama/backend-before-auto-deploy"
    [[ ! -e "$BASE" ]] || { echo "Backup destination exists"; exit 1; }

    health
    mv "$LIVE" "$BASE"

    if ! ln -s "$BASE" "$LIVE"; then
        mv "$BASE" "$LIVE"
        exit 1
    fi

    if ! health; then
        rm "$LIVE"
        mv "$BASE" "$LIVE"
        echo "Cutover failed; original backend restored"
        exit 1
    fi

    printf '%s\n' "$BASE" > "$ROOT/baseline-path"
    echo "INITIAL_CUTOVER=PASS"
    ;;

  deploy)
    ID="${2:?Missing release ID}"
    [[ "$ID" =~ ^be_[a-f0-9]{40}_[0-9]+_[0-9]+$ ]] ||
        { echo "Invalid release ID"; exit 1; }

    [[ -L "$LIVE" ]] || { echo "Initial cutover not completed"; exit 1; }
    [[ -f "$ROOT/baseline-path" ]] || exit 1

    BASE="$(cat "$ROOT/baseline-path")"
    RELEASE="$ROOT/releases/$ID"
    PREVIOUS="$(readlink -f "$LIVE")"

    [[ -d "$RELEASE" ]] || exit 1
    [[ -f "$RELEASE/public/index.php" ]] || exit 1
    [[ -f "$RELEASE/vendor/autoload.php" ]] || exit 1
    [[ -f "$BASE/.env" ]] || exit 1
    [[ -d "$BASE/storage" ]] || exit 1

    [[ ! -e "$RELEASE/.env" && ! -L "$RELEASE/.env" ]] || exit 1
    [[ ! -e "$RELEASE/storage" && ! -L "$RELEASE/storage" ]] || exit 1

    ln -s "$BASE/.env" "$RELEASE/.env"
    ln -s "$BASE/storage" "$RELEASE/storage"

    mkdir -p "$RELEASE/bootstrap/cache"

    # Apache/PHP runs as www-data.
    # Allow both the deploy user and Apache to write Laravel cache files.
    # Laravel needs bootstrap/cache writable by Apache.
    # Restrict this permission to the release cache directory.
    chmod 1777 "$RELEASE/bootstrap/cache"

    if [[ "$(stat -c '%a' "$RELEASE/bootstrap/cache")" != "1777" ]]; then
        echo "Laravel bootstrap/cache permissions failed"
        exit 1
    fi

    printf '%s\n' "$ID" > "$RELEASE/public/mesob-release.txt"

    rollback() {
        echo "Deployment failed; restoring previous release"
        ln -s "$PREVIOUS" "$LIVE.rollback"
        mv -Tf "$LIVE.rollback" "$LIVE"
    }

    trap rollback ERR

    ln -s "$RELEASE" "$LIVE.next"
    mv -Tf "$LIVE.next" "$LIVE"

    FOUND="$(curl --fail --silent --show-error --max-time 20 \
      "$URL/mesob-release.txt?check=$ID")"

    [[ "$FOUND" == "$ID" ]] || {
        echo "New release not visible through Apache"
        false
    }

    health
    trap - ERR

    echo "DEPLOYMENT=SUCCESS"
    echo "ACTIVE_RELEASE=$ID"
    ;;

  *)
    echo "Usage: $0 init | deploy RELEASE_ID"
    exit 2
    ;;
esac
