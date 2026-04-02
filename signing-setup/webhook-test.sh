#!/bin/bash
# webhook-test.sh
# Run this from your terminal to test that ntfy notifications are working
# Usage: bash webhook-test.sh YOUR_TOPIC_NAME
#
# Example: bash webhook-test.sh zjpainting-signed-7x4k2

TOPIC=${1:-"your-topic-name-here"}

if [ "$TOPIC" = "your-topic-name-here" ]; then
  echo "Usage: bash webhook-test.sh YOUR_TOPIC_NAME"
  echo "Example: bash webhook-test.sh zjpainting-signed-7x4k2"
  exit 1
fi

echo "Sending test notification to ntfy topic: $TOPIC"

curl -s \
  -H "Title: Test — Proposal Signed ✓" \
  -H "Tags: white_check_mark" \
  -H "Priority: high" \
  -d "This is a test. If you see this on Zach's phone, the webhook is working." \
  "https://ntfy.sh/$TOPIC"

echo ""
echo "Done. Check Zach's phone for the notification."
echo "If nothing appeared, make sure:"
echo "  1. The ntfy app is installed and notifications are allowed"
echo "  2. The topic name '$TOPIC' matches exactly what's subscribed in the app"
