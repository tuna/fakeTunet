#!/bin/bash
gunicorn tsinghuanet:app --bind=0.0.0.0:80 --timeout 1 -w 16
