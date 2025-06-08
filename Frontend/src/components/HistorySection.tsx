import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, ChevronDown, ChevronUp, FileIcon, Calendar, Trash } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { TeraboxFile } from '@/types/terabox';
import { formatDistanceToNow } from 'date-fns';
import { formatFileSize } from '@/lib/formatFileSize';
import { useTheme } from './theme-provider';
import { getCleanedHistory, cleanExpiredHistory, type HistoryItem } from '@/lib/historyUtils';

interface HistorySectionProps {
  onSelectFile: (file: TeraboxFile) => void;
}

export default function HistorySection({ onSelectFile }: HistorySectionProps) {
  const { theme } = useTheme() || { theme: 'light' }; // Fallback for theme context
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    // Load and clean history on component mount
    const cleanedHistory = getCleanedHistory();
    setHistory(cleanedHistory);
  }, []);

  // Periodically clean expired history (every hour)
  useEffect(() => {
    const interval = setInterval(() => {
      const cleanedHistory = getCleanedHistory();
      setHistory(cleanedHistory);
    }, 60 * 60 * 1000); // Run every hour

    return () => clearInterval(interval);
  }, []);

  const clearHistory = () => {
    localStorage.removeItem('terabox-history');
    setHistory([]);
  };

  const removeHistoryItem = (index: number) => {
    const newHistory = [...history];
    newHistory.splice(index, 1);
    const cleanedHistory = cleanExpiredHistory(newHistory);
    setHistory(cleanedHistory);
    localStorage.setItem('terabox-history', JSON.stringify(cleanedHistory));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="overflow-hidden">
        <CardHeader className="bg-primary/5 py-4 px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 text-foreground">
                <History />
              </div>
              <CardTitle className="text-lg">Recent History</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="h-8 p-0 w-8"
            >
              {isOpen ? (
                <ChevronUp className="h-5 w-5 text-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-foreground" />
              )}
            </Button>
          </div>
        </CardHeader>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CardContent className="pt-3 pb-4 px-0">
                {history.length > 0 ? (
                  <>
                    <div className="flex justify-center py-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearHistory}
                        className="text-xs h-7 text-foreground"
                      >
                        <Trash
                          className="h-3.5 w-3.5 mr-1 text-destructive"
                          style={{ color: theme === 'dark' ? '#f87171' : '#dc2626' }} // Fallback for theme-specific color
                        />
                        Clear History
                      </Button>
                    </div>
                    {/* Responsive natural list without fixed height */}
                    <Accordion type="multiple" className="w-full space-y-2 px-2 sm:px-4">
                      {history.map((item, index) => (
                        <AccordionItem
                          key={`${item.file_name}-${index}`} 
                          value={`${item.file_name}-${index}`} 
                          className="border rounded-md"
                        >
                          <AccordionTrigger className="px-4 py-3 hover:bg-muted/30 rounded-md">
                            <div className="flex items-center w-full text-left">
                              <div className="mr-3">
                                <FileIcon className="h-5 w-5 text-foreground" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">
                                  {item.file_name}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                  <Badge variant="outline" className="text-xs">
                                    {formatFileSize(item.file_size)}
                                  </Badge>
                                  <Calendar className="h-3 w-3 text-foreground" />
                                  {item.fetchedAt && formatDistanceToNow(new Date(item.fetchedAt), { addSuffix: true })}
                                </div>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pt-2 pb-4 px-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                              <div className="text-xs sm:text-sm text-muted-foreground break-all w-full sm:w-2/3">
                                <span className="font-medium">Link: </span>
                                <a href={item.sourceLink} target="_blank" rel="noopener noreferrer" className="underline break-all">
                                  {item.sourceLink}
                                </a>
                              </div>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
                                <Button size="sm" className="w-full sm:w-auto" onClick={() => onSelectFile(item)}>
                                  Load File
                                </Button>
                                <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => removeHistoryItem(index)}>
                                  Remove
                                </Button>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                   </>
                 ) : (
                  <div className="px-6">
                    <Alert className="bg-muted/30">
                      <AlertDescription className="text-sm text-muted-foreground">
                        Your download history will appear here after you fetch file details.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}