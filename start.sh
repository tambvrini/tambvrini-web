#!/usr/bin/env sh
python3 -m uvicorn backend.server:app --host 0.0.0.0 --port 8000
