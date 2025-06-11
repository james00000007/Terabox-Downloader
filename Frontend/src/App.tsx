import { useState, useRef } from 'react';
import { ThemeProvider } from './components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import Navbar from './components/Navbar';
import TeraboxForm from './components/TeraboxForm';
import FileDetails from './components/FileDetails';
import HistorySection from './components/HistorySection';
import { TeraboxFile } from './types/terabox';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from './components/ui/dialog';
import { addToHistory } from '@/lib/historyUtils';

// Load API base URL: local proxy in dev or real worker URL in production
const WORKER_URL = import.meta.env.VITE_WORKER_URL;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.1 
    }
  }
};

function App() {
  const [currentFile, setCurrentFile] = useState<TeraboxFile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showNotice, setShowNotice] = useState(true);
  // session-only cache for file details to avoid re-fetching same link
  const sessionCache = useRef<Record<string, TeraboxFile>>({});
  const { toast } = useToast();

  const handleFetchFile = async (link: string) => {
    // return cached file for this session if available
    if (sessionCache.current[link]) {
      setCurrentFile(sessionCache.current[link]);
      toast({
        title: "Loaded from cache",
        description: "Using cached file details for this session.",
      });
      return;
    }
    setIsLoading(true);
    try {
      // Choose endpoint: dev uses Vite proxy, prod uses Cloudflare Worker URL
      const apiBase = import.meta.env.MODE === 'development' ? '/api' : WORKER_URL;
      const response = await fetch(apiBase, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ link }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      // enrich response with original link and timestamp
      const fetchedAt = new Date().toISOString();
      const fileWithSource = { ...data, sourceLink: link, fetchedAt };
      // set current file including sourceLink and fetchedAt
      setCurrentFile(fileWithSource);
      // store in session cache
      sessionCache.current[link] = fileWithSource;      // Add to history using the utility function that handles 24-hour expiry
      addToHistory(fileWithSource);
      
      toast({
        title: "Success!",
        description: "File details successfully fetched.",
      });
    } catch (error) {
      console.error('Error fetching file:', error);
      toast({
        title: "Error",
        description: error instanceof Error 
          ? error.message 
          : "Failed to fetch file details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemeProvider defaultTheme="dark" storageKey="terabox-theme">
      {/* Unavailable notice popup */}
      <Dialog open={showNotice} onOpenChange={setShowNotice}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notice</DialogTitle>
            <DialogDescription>
              May be Currently unavailable due to recent changes in Terabox.
            </DialogDescription>
          </DialogHeader>
          <DialogClose>Close</DialogClose>
        </DialogContent>
      </Dialog>
      <div className="min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden overflow-y-auto">
        <Navbar />
        <main className="container mx-auto px-4 md:px-6 py-6 md:py-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-4xl mx-auto space-y-6 md:space-y-8"
          >
            <div className="bg-card/50 backdrop-blur-sm rounded-xl shadow-lg border border-border/50">
              <div className="p-4 md:p-6 lg:p-8">
                <TeraboxForm onSubmit={handleFetchFile} isLoading={isLoading} />
                
                <AnimatePresence mode="wait">
                  {currentFile && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="mt-6 md:mt-8"
                    >
                      <FileDetails file={currentFile} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
                <div id="container-81b555327b1ab8a56437c782db53ba33"></div>            
            <div className="bg-card/50 backdrop-blur-sm rounded-xl shadow-lg border border-border/50">
              <div className="p-4 md:p-6 lg:p-8">
                <HistorySection onSelectFile={setCurrentFile} />
              </div>
            </div>
            <a href='https://github.com/0xarchit/Terabox-Downloader' target='_blank' rel='noopener noreferrer' className="w-full">
              <div className="fixed bottom-2 left-1/2 -translate-x-1/2 px-4 text-xs text-foreground/50 break-words text-center">
                Developed by 0xarchit • Source: github.com/0xarchit/Terabox-Downloader
              </div>
            </a>
          </motion.div>
        </main>
        <Toaster />
      </div>
    </ThemeProvider>
  );
}

export default App;