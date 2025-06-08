import { TeraboxFile } from "@/types/terabox";

export interface HistoryItem extends TeraboxFile {
  fetchedAt: string;
}

/**
 * Removes history items older than 24 hours
 * @param historyItems Array of history items to filter
 * @returns Filtered array with only items from the last 24 hours
 */
export const cleanExpiredHistory = (
  historyItems: HistoryItem[]
): HistoryItem[] => {
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  return historyItems.filter((item) => {
    const fetchedDate = new Date(item.fetchedAt);
    return fetchedDate > twentyFourHoursAgo;
  });
};

/**
 * Adds a new item to history and cleans expired items
 * @param newItem The new history item to add
 * @param maxItems Maximum number of items to keep (default: 10)
 * @returns Updated history array
 */
export const addToHistory = (
  newItem: HistoryItem,
  maxItems: number = 10
): HistoryItem[] => {
  const existingHistory = JSON.parse(
    localStorage.getItem("terabox-history") || "[]"
  ) as HistoryItem[];

  // Clean expired items first
  const cleanedHistory = cleanExpiredHistory(existingHistory);

  // Remove any existing item with the same file name to avoid duplicates
  const filteredHistory = cleanedHistory.filter(
    (item: HistoryItem) => item.file_name !== newItem.file_name
  );

  // Add new item at the beginning and limit the total number
  const newHistory = [newItem, ...filteredHistory].slice(0, maxItems);

  // Save to localStorage
  localStorage.setItem("terabox-history", JSON.stringify(newHistory));

  return newHistory;
};

/**
 * Gets the current history from localStorage with expired items automatically removed
 * @returns Current history array with expired items filtered out
 */
export const getCleanedHistory = (): HistoryItem[] => {
  const storedHistory = localStorage.getItem("terabox-history");
  if (!storedHistory) return [];

  const parsedHistory = JSON.parse(storedHistory) as HistoryItem[];
  const cleanedHistory = cleanExpiredHistory(parsedHistory);

  // Update localStorage if any items were removed
  if (cleanedHistory.length !== parsedHistory.length) {
    localStorage.setItem("terabox-history", JSON.stringify(cleanedHistory));
  }

  return cleanedHistory;
};
