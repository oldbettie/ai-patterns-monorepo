// @feature:clipboard-monitoring @domain:clipboard @backend
// @summary: Windows-specific clipboard implementation

//go:build windows

package clipboard

import (
	"clipboard-agent/pkg/config"
	"errors"
	"syscall"
	"unsafe"
)

var (
	user32               = syscall.NewLazyDLL("user32.dll")
	kernel32             = syscall.NewLazyDLL("kernel32.dll")
	openClipboard        = user32.NewProc("OpenClipboard")
	closeClipboard       = user32.NewProc("CloseClipboard")
	getClipboardData     = user32.NewProc("GetClipboardData")
	setClipboardData     = user32.NewProc("SetClipboardData")
	emptyClipboard       = user32.NewProc("EmptyClipboard")
	globalAlloc          = kernel32.NewProc("GlobalAlloc")
	globalFree           = kernel32.NewProc("GlobalFree")
	globalLock           = kernel32.NewProc("GlobalLock")
	globalUnlock         = kernel32.NewProc("GlobalUnlock")
	globalSize           = kernel32.NewProc("GlobalSize")
)

const (
	CF_TEXT      = 1
	CF_BITMAP    = 2
	CF_DIB       = 8
	GMEM_MOVEABLE = 0x0002
)

// getCurrentClipboard gets current clipboard content on Windows
func getCurrentClipboard(processor *ItemProcessor) (*config.ClipboardItem, error) {
	ret, _, _ := openClipboard.Call(0)
	if ret == 0 {
		return nil, errors.New("failed to open clipboard")
	}
	defer closeClipboard.Call()

	// Try to get text first
	handle, _, _ := getClipboardData.Call(CF_TEXT)
	if handle != 0 {
		ptr, _, _ := globalLock.Call(handle)
		if ptr != 0 {
			defer globalUnlock.Call(handle)
			
			text := (*(*[1 << 20]byte)(unsafe.Pointer(ptr)))[:]
			// Find null terminator
			var length int
			for i, b := range text {
				if b == 0 {
					length = i
					break
				}
			}
			
			if length > 0 {
				textStr := string(text[:length])
				item := processor.ProcessText(textStr)
				return &item, nil
			}
		}
	}

	return nil, nil
}

// writeTextToClipboard writes text to clipboard on Windows
func writeTextToClipboard(text string) error {
	ret, _, _ := openClipboard.Call(0)
	if ret == 0 {
		return errors.New("failed to open clipboard")
	}
	defer closeClipboard.Call()

	emptyClipboard.Call()

	textBytes := []byte(text + "\x00") // Add null terminator
	handle, _, _ := globalAlloc.Call(GMEM_MOVEABLE, uintptr(len(textBytes)))
	if handle == 0 {
		return errors.New("failed to allocate memory")
	}

	ptr, _, _ := globalLock.Call(handle)
	if ptr == 0 {
		globalFree.Call(handle)
		return errors.New("failed to lock memory")
	}

	// Copy text to allocated memory
	copy((*(*[1 << 20]byte)(unsafe.Pointer(ptr)))[:], textBytes)
	globalUnlock.Call(handle)

	ret, _, _ = setClipboardData.Call(CF_TEXT, handle)
	if ret == 0 {
		globalFree.Call(handle)
		return errors.New("failed to set clipboard data")
	}

	return nil
}

// writeImageToClipboard writes image to clipboard on Windows
func writeImageToClipboard(imageData []byte, format string) error {
	// Basic bitmap support - would need more sophisticated implementation for production
	return errors.New("image clipboard support not implemented on Windows yet")
}