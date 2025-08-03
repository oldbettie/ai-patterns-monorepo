// @feature:local-agent @domain:proxy @backend
// @summary: Simplified local proxy agent for traffic routing

package proxy

import (
	"family-privacy-proxy/pkg/router"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"net/url"
	"time"
)

// LocalAgent represents a simplified local proxy agent
type LocalAgent struct {
	router   router.Router
	port     int
	server   *http.Server
	listener net.Listener
}

// NewLocalAgent creates a new local proxy agent
func NewLocalAgent(router router.Router, port int) *LocalAgent {
	return &LocalAgent{
		router: router,
		port:   port,
	}
}

// Start starts the local proxy agent
func (a *LocalAgent) Start() error {
	listener, err := net.Listen("tcp", fmt.Sprintf("localhost:%d", a.port))
	if err != nil {
		return fmt.Errorf("failed to listen on port %d: %w", a.port, err)
	}

	a.listener = listener

	// Create HTTP server with proxy handler
	a.server = &http.Server{
		Handler:      http.HandlerFunc(a.handleRequest),
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		if err := a.server.Serve(listener); err != nil && err != http.ErrServerClosed {
			log.Printf("Proxy server error: %v", err)
		}
	}()

	return nil
}

// Stop stops the local proxy agent
func (a *LocalAgent) Stop() error {
	if a.server != nil {
		return a.server.Close()
	}
	return nil
}

// handleRequest handles all HTTP requests through the proxy
func (a *LocalAgent) handleRequest(w http.ResponseWriter, r *http.Request) {
	// Get routing decision
	decision := a.router.Route(r)

	log.Printf("Routing %s %s -> %s (%s)", r.Method, r.URL.String(), decision.Action, decision.Reason)

	switch decision.Action {
	case "DIRECT":
		a.handleDirect(w, r)
	case "PROXY":
		a.handleProxy(w, r, decision.WorkerURL)
	case "BLOCK":
		a.handleBlock(w, r)
	default:
		// Default to direct for unknown actions
		a.handleDirect(w, r)
	}
}

// handleDirect forwards the request directly to the target
func (a *LocalAgent) handleDirect(w http.ResponseWriter, r *http.Request) {
	// Create a new HTTP client for direct connections
	client := &http.Client{
		Timeout: 30 * time.Second,
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			// Allow up to 10 redirects
			if len(via) >= 10 {
				return fmt.Errorf("too many redirects")
			}
			return nil
		},
	}

	// Create the outbound request
	outReq, err := http.NewRequest(r.Method, r.URL.String(), r.Body)
	if err != nil {
		http.Error(w, "Failed to create request", http.StatusInternalServerError)
		return
	}

	// Copy headers
	for name, values := range r.Header {
		for _, value := range values {
			outReq.Header.Add(name, value)
		}
	}

	// Make the request
	resp, err := client.Do(outReq)
	if err != nil {
		http.Error(w, "Failed to connect to target", http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	// Copy response headers
	for name, values := range resp.Header {
		for _, value := range values {
			w.Header().Add(name, value)
		}
	}

	// Copy status code
	w.WriteHeader(resp.StatusCode)

	// Copy response body
	io.Copy(w, resp.Body)
}

// handleProxy forwards the request through a Cloudflare Worker
func (a *LocalAgent) handleProxy(w http.ResponseWriter, r *http.Request, workerURL string) {
	if workerURL == "" {
		// Fallback to direct if no worker URL available
		log.Printf("No worker URL available, falling back to direct connection")
		a.handleDirect(w, r)
		return
	}

	// Create a new HTTP client for proxy connections
	client := &http.Client{
		Timeout: 30 * time.Second,
	}

	// Construct the worker URL with the target URL as a parameter
	// This depends on how your Cloudflare Worker is implemented
	proxyURL := fmt.Sprintf("%s?target=%s", workerURL, url.QueryEscape(r.URL.String()))

	// Create the outbound request to the worker
	outReq, err := http.NewRequest(r.Method, proxyURL, r.Body)
	if err != nil {
		http.Error(w, "Failed to create proxy request", http.StatusInternalServerError)
		return
	}

	// Copy headers
	for name, values := range r.Header {
		for _, value := range values {
			outReq.Header.Add(name, value)
		}
	}

	// Add original URL in a custom header for the worker
	outReq.Header.Set("X-Original-URL", r.URL.String())
	outReq.Header.Set("X-Original-Host", r.Host)

	// Make the request to the worker
	resp, err := client.Do(outReq)
	if err != nil {
		log.Printf("Failed to connect to worker: %v", err)
		// Fallback to direct connection
		a.handleDirect(w, r)
		return
	}
	defer resp.Body.Close()

	// Copy response headers
	for name, values := range resp.Header {
		for _, value := range values {
			w.Header().Add(name, value)
		}
	}

	// Copy status code
	w.WriteHeader(resp.StatusCode)

	// Copy response body
	io.Copy(w, resp.Body)
}

// handleBlock blocks the request and returns a 403 Forbidden
func (a *LocalAgent) handleBlock(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/html")
	w.WriteHeader(http.StatusForbidden)

	blockPage := `<!DOCTYPE html>
<html>
<head>
    <title>Access Blocked</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; margin: 50px; }
        .block-message { background: #f8d7da; color: #721c24; padding: 20px; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="block-message">
        <h1>🚫 Access Blocked</h1>
        <p>This website has been blocked by your family proxy settings.</p>
        <p><strong>URL:</strong> %s</p>
    </div>
</body>
</html>`

	fmt.Fprintf(w, blockPage, r.URL.String())
}
