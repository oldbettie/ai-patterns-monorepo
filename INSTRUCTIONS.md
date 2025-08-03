Here are several ways to test if your proxy is working
correctly:

1. Web Interface Testing

Start the proxy:
./run.sh

Check Web UI: http://localhost:8080

-   View proxy status (should show "Running")
-   Monitor routing statistics in real-time
-   Check active rules and their hit counts

2. Direct Proxy Testing

Test with curl using the proxy:

# Test DIRECT routing (should be fast, no proxy)

curl -x 127.0.0.1:8081 -I https://store.steampowered.com

# Test PROXY routing (should route through proxy if configured)

curl -x 127.0.0.1:8081 -I https://facebook.com

# Test BLOCK routing (should be blocked)

curl -x 127.0.0.1:8081 -I https://example-blocked-site.com

3. Browser Testing

Configure browser proxy:

-   Set HTTP/HTTPS proxy to 127.0.0.1:8081
-   Visit different websites that match your rules
-   Check the web interface analytics to see rule hits

4. Check Default Rules

● Read(configs/default.json)
⎿  Read 96 lines (ctrl+r to expand)

● Update Todos
⎿  ☒ Explain how to test proxy functionality  
 ☐ Provide testing commands and verification methods

● Test these specific default rules:

# Should go DIRECT (fast, no proxy)

curl -x 127.0.0.1:8081 -I https://store.steampowered.com
curl -x 127.0.0.1:8081 -I https://www.epicgames.com
curl -x 127.0.0.1:8081 -I https://netflix.com
curl -x 127.0.0.1:8081 -I https://youtube.com

# Should go through PROXY (if you have remote proxies

configured)
curl -x 127.0.0.1:8081 -I https://facebook.com
curl -x 127.0.0.1:8081 -I https://instagram.com
curl -x 127.0.0.1:8081 -I https://twitter.com

5. Logs & Monitoring

Check console logs:

-   Look for "Configuration updated" messages when editing config
-   Watch for routing decisions in proxy server logs
-   Monitor connection counts and errors

Web interface analytics:

-   /api/analytics shows routing statistics
-   Rule hit counts show which rules are being applied
-   Performance metrics show latency differences

6. Hot Reload Testing

Test configuration changes:

# Edit configs/default.json while proxy is running

# Add a new rule, change priorities, etc.

# Check web interface to see changes applied instantly
