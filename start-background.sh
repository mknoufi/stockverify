#!/bin/bash
# Start all services in background (non-blocking)

cd "$(dirname "$0")"
RUN_IN_BACKGROUND=true bash start-all.sh
