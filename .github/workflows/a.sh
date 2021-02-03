curl \
  -X POST \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Authorization: Bearer b0db85fb6958e8165cc92af5fd91f6a05f70261c" \
  https://api.github.com/repos/xunhuang/random/dispatches \
  -d '{"event_type":"opened"}'
