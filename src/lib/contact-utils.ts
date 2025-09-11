export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const result = document.execCommand('copy');
    document.body.removeChild(textArea);
    return result;
  }
};

export const shareContent = async (title: string, url: string): Promise<void> => {
  if (navigator.share) {
    try {
      await navigator.share({ title, url });
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        await copyToClipboard(url);
      }
    }
  } else {
    await copyToClipboard(url);
  }
};

interface Bookmark {
  id: string;
  title: string;
  savedAt: string;
}

interface BookmarkStorage {
  [key: string]: Bookmark[];
}

export const saveToBookmarks = (postId: string, postType: string, title: string): void => {
  const bookmarks: BookmarkStorage = JSON.parse(localStorage.getItem('vietlinker_bookmarks') || '{}');
  if (!bookmarks[postType]) {
    bookmarks[postType] = [];
  }
  const bookmark: Bookmark = { id: postId, title, savedAt: new Date().toISOString() };
  const existingIndex = bookmarks[postType].findIndex((b: Bookmark) => b.id === postId);
  if (existingIndex === -1) {
    bookmarks[postType].push(bookmark);
    localStorage.setItem('vietlinker_bookmarks', JSON.stringify(bookmarks));
  }
};

export const removeFromBookmarks = (postId: string, postType: string): void => {
  const bookmarks: BookmarkStorage = JSON.parse(localStorage.getItem('vietlinker_bookmarks') || '{}');
  if (bookmarks[postType]) {
    bookmarks[postType] = bookmarks[postType].filter((b: Bookmark) => b.id !== postId);
    localStorage.setItem('vietlinker_bookmarks', JSON.stringify(bookmarks));
  }
};

export const isBookmarked = (postId: string, postType: string): boolean => {
  const bookmarks: BookmarkStorage = JSON.parse(localStorage.getItem('vietlinker_bookmarks') || '{}');
  return bookmarks[postType]?.some((b: Bookmark) => b.id === postId) || false;
};

export const showToast = (message: string): void => {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #10b981;
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    z-index: 10000;
    font-family: system-ui, -apple-system, sans-serif;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  `;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3000);
};
