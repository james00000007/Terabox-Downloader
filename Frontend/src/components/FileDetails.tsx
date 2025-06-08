import { motion } from 'framer-motion';
import { Download, Copy, Check } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TeraboxFile } from '@/types/terabox';
import FilePreview from './FilePreview';
import { useState } from 'react';
import { formatFileSize } from '@/lib/formatFileSize';

interface FileDetailsProps {
  file: TeraboxFile;
}

export default function FileDetails({ file }: FileDetailsProps) {
  const [copied, setCopied] = useState(false);
  const [copiedSource, setCopiedSource] = useState(false);

  const handleCopySource = async () => {
    try {
      if (file.sourceLink) {
        await navigator.clipboard.writeText(file.sourceLink);
        setCopiedSource(true);
        setTimeout(() => setCopiedSource(false), 2000);
      }
    } catch (error) {
      console.error('Copy original link failed:', error);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(file.proxy_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-x-hidden w-full">
        <CardHeader className="bg-primary/5">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl font-semibold pr-4 break-words whitespace-normal">
                {file.file_name}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{formatFileSize(file.file_size)}</Badge>
                <Badge variant="secondary">
                  {file.file_name.split('.').pop()?.toUpperCase() || 'FILE'}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 w-full overflow-x-hidden">
          <FilePreview file={file} />
        </CardContent>

        <CardFooter className="flex flex-col gap-4 p-4 sm:p-6 overflow-x-hidden">
          {/* Row 1: Original link and copy button */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full overflow-x-hidden">
            <div className="flex-1 text-sm text-muted-foreground break-all">
              <span className="font-medium">Original Link: </span>
              <a
                href={file.sourceLink}
                target="_blank"
                rel="noopener noreferrer"
                className="underline break-all"
              >{file.sourceLink}</a>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopySource}
              className="w-full sm:w-auto"
            >
              {copiedSource ? (
                <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
              ) : (
                <Copy className="h-4 w-4 text-gray-700 dark:text-gray-300" />
              )}
              <span className="ml-2">Copy Link</span>
            </Button>
          </div>
          {/* Row 2: Download and proxy copy buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-4 w-full">
            <Button
              className="relative w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white gap-2"
              onClick={() => window.open(file.proxy_url, '_blank')}
            >
              <Download className="w-4 h-4" />
              Download
              <motion.div
                className="absolute inset-0 rounded-md bg-white"
                initial={{ scale: 0, opacity: 0 }}
                whileTap={{ scale: 1, opacity: 0.3 }}
                transition={{ duration: 0.2 }}
              />
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={handleCopy}
              className="w-full sm:w-auto"
            >
              {copied ? (
                <Check
                  className="h-4 w-4 text-green-600 dark:text-green-400"
                  style={{ stroke: 'currentColor', strokeWidth: '2' }}
                />
              ) : (
                <Copy
                  className="h-4 w-4 text-gray-700 dark:text-gray-300"
                  style={{ stroke: 'currentColor', strokeWidth: '2' }}
                />
              )}
              <span className="sr-only">Copy Proxy URL</span>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}