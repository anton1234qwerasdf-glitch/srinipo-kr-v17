#!/usr/bin/env bash
set -Eeuo pipefail

image="${1:?Usage: deploy.sh IMAGE EXPECTED_VERSION}"
expected_version="${2:?Expected app version is required}"
container="${SRINIPO_CONTAINER:-srinipo-web}"
port="${SRINIPO_PORT:-8888}"
attempts="${SRINIPO_HEALTH_ATTEMPTS:-20}"
backup="${container}-rollback"

[[ "$image" =~ ^srinipo-app:[a-zA-Z0-9_.-]+$ ]] || { echo "Unexpected image name"; exit 2; }
[[ "$container" =~ ^srinipo-[a-z0-9-]+$ ]] || exit 2
[[ "$port" =~ ^[0-9]{4,5}$ ]] && (( port >= 1024 && port <= 65535 )) || exit 2
[[ "$attempts" =~ ^[0-9]+$ ]] && (( attempts >= 1 && attempts <= 60 )) || exit 2
docker image inspect "$image" >/dev/null
if docker container inspect "$backup" >/dev/null 2>&1; then
  echo "Existing rollback container requires inspection: $backup"
  exit 2
fi

response="$(mktemp)"
old_stopped=false
old_renamed=false
new_started=false
success=false
finish() {
  rc=$?
  trap - EXIT
  if [[ "$success" != true ]]; then
    if [[ "$new_started" == true ]]; then
      docker logs --tail 30 "$container" || true
      docker rm -f "$container" || true
    fi
    if [[ "$old_renamed" == true ]]; then
      docker rename "$backup" "$container" || true
    fi
    if [[ "$old_stopped" == true ]]; then
      restored=false
      if docker start "$container"; then
        for ((j=1; j<=attempts; j++)); do
          if curl --fail --silent --max-time 2 "http://127.0.0.1:${port}/" >/dev/null; then
            restored=true
            break
          fi
          sleep 1
        done
      fi
      if [[ "$restored" == true ]]; then
        echo "ROLLBACK_OK: previous container restored and HTTP response verified"
      else
        echo "ROLLBACK_FAILED: inspect container $container" >&2
      fi
    fi
  fi
  rm -f "$response"
  exit "$rc"
}
trap finish EXIT

if docker container inspect "$container" >/dev/null 2>&1; then
  old_image="$(docker inspect --format '{{.Config.Image}}' "$container")"
  [[ "$old_image" == srinipo-app:* ]] || { echo "Refusing to replace an unrelated container"; exit 2; }
  docker stop "$container"
  old_stopped=true
  docker rename "$container" "$backup"
  old_renamed=true
fi

# Create separately so cleanup also handles a failed start.
docker create --name "$container" --restart unless-stopped \
  -p "127.0.0.1:${port}:80" "$image" >/dev/null
new_started=true
docker start "$container"
healthy=false
for ((i=1; i<=attempts; i++)); do
  if curl --fail --silent --max-time 2 "http://127.0.0.1:${port}/health" -o "$response" &&
    python3 - "$response" "$expected_version" <<'PY'
import json,sys
try:
    data=json.load(open(sys.argv[1]))
    valid=data.get("status")=="ok" and data.get("service")=="srinipo-app" and data.get("version")==sys.argv[2]
except (ValueError, OSError, AttributeError):
    valid=False
raise SystemExit(0 if valid else 1)
PY
  then
    healthy=true
    break
  fi
  sleep 1
done
[[ "$healthy" == true ]] || { echo "Health check failed"; exit 1; }
actual="$(docker inspect --format '{{.Image}}' "$container")"
expected="$(docker image inspect --format '{{.Id}}' "$image")"
[[ "$actual" == "$expected" ]] || { echo "Running image differs from requested image"; exit 1; }
success=true
if [[ "$old_renamed" == true ]]; then
  docker rm "$backup"
fi
echo "DEPLOY_OK: $image at http://127.0.0.1:${port}"
cat "$response"
echo
