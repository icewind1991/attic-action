#!/usr/bin/env bash
set -euo pipefail

attic=$1 atticArgs=${2:--j8} cache=$3 pathsToPush=$4 pushFilter=$5

if [[ $pathsToPush == "" ]]; then
    pathsToPush=$(comm -13 <(sort /tmp/store-path-pre-build) <("$(dirname "$0")"/list-nix-store.sh))

    if [[ $pushFilter != "" ]]; then
        pathsToPush=$(echo "$pathsToPush" | grep -vEe "$pushFilter")
    fi
fi

echo "$pathsToPush" | xargs "$attic" push $atticArgs "$cache"
