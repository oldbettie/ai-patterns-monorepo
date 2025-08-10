// @feature:clipboard-monitoring @domain:clipboard @backend
// @summary: Generic clipboard implementation using external tools (fallback)

//go:build !windows && !darwin

package clipboard

import (
	"clipboard-agent/pkg/config"
	"errors"
	"os/exec"
	"runtime"
	"strings"
)

// getCurrentClipboard gets current clipboard content using platform-specific tools
func getCurrentClipboard(processor *ItemProcessor) (*config.ClipboardItem, error) {
	text, err := getClipboardText()
	if err != nil {
		return nil, err
	}
	
	if text == "" {
		return nil, nil
	}
	
	item := processor.ProcessText(text)
	return &item, nil
}

// writeTextToClipboard writes text to clipboard using platform-specific tools
func writeTextToClipboard(text string) error {
	var cmd *exec.Cmd
	
	switch runtime.GOOS {
	case "linux":
		// Try xclip first, then xsel, then wl-copy (Wayland)
		if commandExists("xclip") {
			cmd = exec.Command("xclip", "-selection", "clipboard")
		} else if commandExists("xsel") {
			cmd = exec.Command("xsel", "--clipboard", "--input")
		} else if commandExists("wl-copy") {
			cmd = exec.Command("wl-copy")
		} else {
			return errors.New("no clipboard tool found (install xclip, xsel, or wl-copy)")
		}
	default:
		return errors.New("unsupported platform for generic clipboard")
	}
	
	cmd.Stdin = strings.NewReader(text)
	return cmd.Run()
}

// writeImageToClipboard writes image to clipboard (limited support)
func writeImageToClipboard(imageData []byte, format string) error {
	// Image clipboard support is limited on generic platforms
	return errors.New("image clipboard not supported on this platform")
}

// getClipboardText gets text from clipboard using platform-specific tools
func getClipboardText() (string, error) {
	var cmd *exec.Cmd
	
	switch runtime.GOOS {
	case "linux":
		// Try xclip first, then xsel, then wl-paste (Wayland)
		if commandExists("xclip") {
			cmd = exec.Command("xclip", "-selection", "clipboard", "-out")
		} else if commandExists("xsel") {
			cmd = exec.Command("xsel", "--clipboard", "--output")
		} else if commandExists("wl-paste") {
			cmd = exec.Command("wl-paste")
		} else {
			return "", errors.New("no clipboard tool found (install xclip, xsel, or wl-paste)")
		}
	default:
		return "", errors.New("unsupported platform for generic clipboard")
	}
	
	output, err := cmd.Output()
	if err != nil {
		return "", err
	}
	
	return strings.TrimSpace(string(output)), nil
}

// commandExists checks if a command exists in PATH
func commandExists(cmd string) bool {
	_, err := exec.LookPath(cmd)
	return err == nil
}