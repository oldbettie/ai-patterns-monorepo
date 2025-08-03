// @feature:config-test @domain:config @backend
// @summary: Unit tests for configuration management

package config

import (
	"testing"
)

func TestAPIClient_New(t *testing.T) {
	client := NewAPIClient("http://test.example.com", "test-device-id")

	if client == nil {
		t.Error("NewAPIClient should not return nil")
	}

	if client.deviceID != "test-device-id" {
		t.Errorf("Expected deviceID to be 'test-device-id', got '%s'", client.deviceID)
	}
}

func TestAPIClient_MockMode(t *testing.T) {
	client := NewAPIClient("mock", "test-device")

	if client == nil {
		t.Error("NewAPIClient should not return nil even in mock mode")
	}
}
