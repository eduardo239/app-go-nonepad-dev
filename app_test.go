package main

import (
	"os"
	"path/filepath"
	"testing"
)

func setupTestEnvironment(t *testing.T) (*App, string) {
	// Create a temporary directory for tests
	tempDir, err := os.MkdirTemp("", "nonepad-test")
	if err != nil {
		t.Fatalf("Failed to create temp dir: %v", err)
	}

	// Create the app directory in the temp directory
	appDir := filepath.Join(tempDir, "nonepad")
	if err := os.MkdirAll(appDir, 0755); err != nil {
		t.Fatalf("Failed to create app dir: %v", err)
	}

	// Create an empty pages file
	if err := os.WriteFile(filepath.Join(appDir, "pages.json"), []byte("[]"), 0644); err != nil {
		t.Fatalf("Failed to create empty pages file: %v", err)
	}

	// Set up a test app instance with the test directory
	app := &App{
		appDirOverride: appDir,
	}

	t.Cleanup(func() {
		cleanupTestEnvironment(tempDir)
	})

	return app, tempDir
}

func cleanupTestEnvironment(tempDir string) {
	os.RemoveAll(tempDir)
}

func TestCreatePage(t *testing.T) {
	app, tempDir := setupTestEnvironment(t)
	defer cleanupTestEnvironment(tempDir)

	// Test creating a page
	page, err := app.CreatePage("Test Page")
	if err != nil {
		t.Errorf("CreatePage failed: %v", err)
	}

	if page.Title != "Test Page" {
		t.Errorf("Expected page title 'Test Page', got '%s'", page.Title)
	}

	if page.Content != "" {
		t.Errorf("Expected empty content, got '%s'", page.Content)
	}

	// Verify the page was saved
	pages, err := app.GetPages()
	if err != nil {
		t.Errorf("GetPages failed: %v", err)
	}

	if len(pages) != 1 {
		t.Errorf("Expected 1 page, got %d", len(pages))
	}
}

func TestUpdatePage(t *testing.T) {
	app, tempDir := setupTestEnvironment(t)
	defer cleanupTestEnvironment(tempDir)

	// Create a test page
	page, err := app.CreatePage("Test Page")
	if err != nil {
		t.Fatalf("CreatePage failed: %v", err)
	}

	// Update the page
	newTitle := "Updated Title"
	newContent := "Updated Content"
	err = app.UpdatePage(page.ID, newTitle, newContent)
	if err != nil {
		t.Errorf("UpdatePage failed: %v", err)
	}

	// Verify the update
	pages, err := app.GetPages()
	if err != nil {
		t.Errorf("GetPages failed: %v", err)
	}

	if len(pages) != 1 {
		t.Fatalf("Expected 1 page, got %d", len(pages))
	}

	updatedPage := pages[0]
	if updatedPage.Title != newTitle {
		t.Errorf("Expected title '%s', got '%s'", newTitle, updatedPage.Title)
	}
	if updatedPage.Content != newContent {
		t.Errorf("Expected content '%s', got '%s'", newContent, updatedPage.Content)
	}
}

func TestDeletePage(t *testing.T) {
	app, tempDir := setupTestEnvironment(t)
	defer cleanupTestEnvironment(tempDir)

	// Create a test page
	page, err := app.CreatePage("Test Page")
	if err != nil {
		t.Fatalf("CreatePage failed: %v", err)
	}

	// Delete the page
	err = app.DeletePage(page.ID)
	if err != nil {
		t.Errorf("DeletePage failed: %v", err)
	}

	// Verify the deletion
	pages, err := app.GetPages()
	if err != nil {
		t.Errorf("GetPages failed: %v", err)
	}

	if len(pages) != 0 {
		t.Errorf("Expected 0 pages, got %d", len(pages))
	}
}