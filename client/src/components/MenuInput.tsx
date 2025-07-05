import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, Loader2, CheckCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface MenuItem {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  createdAt: Date;
}

interface ProcessMenuResponse {
  sessionId: number;
  menuItems: MenuItem[];
  success: boolean;
}

interface MenuInputProps {
  onMenuProcessed: (menuItems: MenuItem[]) => void;
}

interface ProcessingStatus {
  message: string;
  current?: number;
  total?: number;
  items?: string[];
  isProcessing: boolean;
  completedItems: MenuItem[];
}

export default function MenuInput({ onMenuProcessed }: MenuInputProps) {
  const [menuText, setMenuText] = useState("");
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus | null>(null);
  const { toast } = useToast();

  const processMenuMutation = useMutation({
    mutationFn: async (data: { menuText?: string; file?: File }): Promise<ProcessMenuResponse> => {
      const formData = new FormData();
      
      if (data.file) {
        formData.append('menuFile', data.file);
      }
      if (data.menuText) {
        formData.append('menuText', data.menuText);
      }

      const response = await fetch('/api/process-menu', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process menu');
      }

      return response.json();
    },
    onSuccess: (data) => {
      onMenuProcessed(data.menuItems);
      toast({
        title: "Menu processed successfully!",
        description: `Found ${data.menuItems.length} food items`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error processing menu",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const processMenuWithStream = useCallback(async (data: { menuText?: string; file?: File }) => {
    const formData = new FormData();
    
    if (data.file) {
      formData.append('menuFile', data.file);
    }
    
    if (data.menuText) {
      formData.append('menuText', data.menuText);
    }

    setProcessingStatus({
      message: 'Starting menu processing...',
      isProcessing: true,
      completedItems: []
    });

    try {
      const response = await fetch('/api/process-menu-stream', {
        method: 'POST',
        body: formData,
      });

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.substring(6));
              
              // Get the event type from previous line if available
              const eventMatch = lines[lines.indexOf(line) - 1]?.match(/^event: (.+)$/);
              const eventType = eventMatch ? eventMatch[1] : '';
              
              if (eventType === 'status') {
                setProcessingStatus(prev => prev ? { ...prev, message: data.message } : null);
              } else if (eventType === 'parsed') {
                setProcessingStatus(prev => prev ? { 
                  ...prev, 
                  message: data.message,
                  total: data.count,
                  items: data.items
                } : null);
              } else if (eventType === 'processing') {
                setProcessingStatus(prev => prev ? { 
                  ...prev, 
                  message: data.message,
                  current: data.current,
                  total: data.total
                } : null);
              } else if (eventType === 'item-complete') {
                setProcessingStatus(prev => prev ? { 
                  ...prev, 
                  message: data.message,
                  current: data.current,
                  total: data.total,
                  completedItems: [...prev.completedItems, data.item]
                } : null);
              } else if (eventType === 'complete') {
                setProcessingStatus(null);
                onMenuProcessed(data.menuItems);
                setMenuText("");
                toast({
                  title: "Menu processed successfully!",
                  description: data.message,
                });
                return;
              } else if (eventType === 'error') {
                setProcessingStatus(null);
                toast({
                  title: "Error processing menu",
                  description: data.message,
                  variant: "destructive",
                });
                return;
              }
            } catch (e) {
              // Ignore parsing errors for incomplete chunks
            }
          }
        }
      }
    } catch (error) {
      setProcessingStatus(null);
      toast({
        title: "Connection error",
        description: "Lost connection while processing menu",
        variant: "destructive",
      });
    }
  }, [onMenuProcessed, toast]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuText.trim()) {
      toast({
        title: "Please enter menu text",
        description: "Add some menu items to visualize",
        variant: "destructive",
      });
      return;
    }
    processMenuWithStream({ menuText });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Support both images and text files
    if (file.type.startsWith('image/') || file.type === 'text/plain') {
      if (file.type === 'text/plain') {
        // For text files, also update the textarea
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          setMenuText(text);
        };
        reader.readAsText(file);
      }
      
      // Process the file directly
      processMenuWithStream({ file });
      
      toast({
        title: "Processing file...",
        description: `Analyzing ${file.name}`,
      });
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file or text file (.txt)",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">Visualize Your Menu</h1>
        <p className="text-lg text-gray-600">
          Upload a menu image to see dishes come to life with names and pictures.
        </p>
      </div>

      {/* Example Menu Image */}
      <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
        <div className="aspect-video bg-white rounded-lg shadow-sm flex items-center justify-center">
          <div className="text-center p-8">
            <FileText className="w-16 h-16 text-orange-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Sample Menu</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• Grilled Salmon with lemon and herbs</p>
              <p>• Caesar Salad with romaine lettuce</p>
              <p>• Pasta Carbonara with bacon</p>
              <p>• Margherita Pizza with fresh basil</p>
              <p>• Chicken Tacos with salsa</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Input Section */}
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Menu Uploaded Yet</h2>
          <p className="text-gray-600">
            Tap the button below to upload your menu and start visualizing your dishes.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Textarea
              placeholder="Paste your menu text here or upload a text file..."
              value={menuText}
              onChange={(e) => setMenuText(e.target.value)}
              className="min-h-32 resize-none"
            />
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={processingStatus?.isProcessing || !menuText.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {processingStatus?.isProcessing ? "Processing..." : "Process Menu"}
            </Button>

            <div className="relative">
              <input
                type="file"
                accept="image/*,.txt"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button type="button" variant="outline" className="w-full">
                <Upload className="w-4 h-4 mr-2" />
                Upload Menu
              </Button>
            </div>
          </div>
        </form>

        {/* Processing Status */}
        {processingStatus && (
          <Card className="mt-4">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm font-medium">{processingStatus.message}</span>
                </div>
                
                {processingStatus.total && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Progress</span>
                      <span>{processingStatus.current || 0} / {processingStatus.total}</span>
                    </div>
                    <Progress 
                      value={((processingStatus.current || 0) / processingStatus.total) * 100} 
                      className="w-full"
                    />
                  </div>
                )}

                {processingStatus.items && processingStatus.items.length > 0 && (
                  <div className="text-sm">
                    <p className="font-medium text-gray-700 mb-1">Found menu items:</p>
                    <div className="text-gray-600 space-y-1">
                      {processingStatus.items.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          {processingStatus.completedItems.some(completed => completed.name === item) ? (
                            <CheckCircle className="w-3 h-3 text-green-500" />
                          ) : (
                            <div className="w-3 h-3 border border-gray-300 rounded-full" />
                          )}
                          <span className={processingStatus.completedItems.some(completed => completed.name === item) ? "text-green-700" : ""}>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}