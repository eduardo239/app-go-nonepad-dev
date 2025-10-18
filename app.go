package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"time"
)

type Page struct {
	ID        string    `json:"id"`
	Title     string    `json:"title"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// App struct
type App struct {
	ctx context.Context
	appDirOverride string // Used for testing
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

func (a *App) getAppDir() (string, error) {
	if a.appDirOverride != "" {
		return a.appDirOverride, nil
	}
	
	userConfigDir, err := os.UserConfigDir()
	if err != nil {
		return "", err
	}
	appDir := filepath.Join(userConfigDir, "nonepad")
	if err := os.MkdirAll(appDir, 0755); err != nil {
		return "", err
	}
	return appDir, nil
}

// GetPages returns all pages
func (a *App) GetPages() ([]Page, error) {
	appDir, err := a.getAppDir()
	if err != nil {
		return nil, err
	}

	pagesFile := filepath.Join(appDir, "pages.json")
	if _, err := os.Stat(pagesFile); os.IsNotExist(err) {
		return []Page{}, nil
	}

	data, err := os.ReadFile(pagesFile)
	if err != nil {
		return nil, err
	}

	var pages []Page
	if err := json.Unmarshal(data, &pages); err != nil {
		return nil, err
	}
	return pages, nil
}

// SavePages saves all pages
func (a *App) SavePages(pages []Page) error {
	appDir, err := a.getAppDir()
	if err != nil {
		return err
	}

	data, err := json.Marshal(pages)
	if err != nil {
		return err
	}

	return os.WriteFile(filepath.Join(appDir, "pages.json"), data, 0644)
}

// CreatePage creates a new page
func (a *App) CreatePage(title string) (Page, error) {
	page := Page{
		ID:        fmt.Sprintf("%d", time.Now().UnixNano()),
		Title:     title,
		Content:   "",
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	pages, err := a.GetPages()
	if err != nil {
		return Page{}, err
	}

	pages = append(pages, page)
	if err := a.SavePages(pages); err != nil {
		return Page{}, err
	}

	return page, nil
}

// UpdatePage updates a page
func (a *App) UpdatePage(id string, title string, content string) error {
	pages, err := a.GetPages()
	if err != nil {
		return err
	}

	pageFound := false
	for i := range pages {
		if pages[i].ID == id {
			pages[i].Title = title
			pages[i].Content = content
			pages[i].UpdatedAt = time.Now()
			pageFound = true
			break
		}
	}

	if !pageFound {
		return fmt.Errorf("page not found: %s", id)
	}

	// Write the updated pages to disk
	if err := a.SavePages(pages); err != nil {
		return fmt.Errorf("failed to save pages: %w", err)
	}

	return nil
}

// DeletePage deletes a page
func (a *App) DeletePage(id string) error {
	pages, err := a.GetPages()
	if err != nil {
		return err
	}

	for i := range pages {
		if pages[i].ID == id {
			pages = append(pages[:i], pages[i+1:]...)
			return a.SavePages(pages)
		}
	}
	return fmt.Errorf("page not found")
}

// SaveContent saves the textarea content to a file
func (a *App) SaveContent(content string) error {
	userConfigDir, err := os.UserConfigDir()
	if err != nil {
		return err
	}

	appDir := filepath.Join(userConfigDir, "nonepad")
	if err := os.MkdirAll(appDir, 0755); err != nil {
		return err
	}

	return os.WriteFile(filepath.Join(appDir, "content.txt"), []byte(content), 0644)
}

// LoadContent loads the previously saved content
func (a *App) LoadContent() string {
	userConfigDir, err := os.UserConfigDir()
	if err != nil {
		return ""
	}

	content, err := os.ReadFile(filepath.Join(userConfigDir, "nonepad", "content.txt"))
	if err != nil {
		return ""
	}

	return string(content)
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}
