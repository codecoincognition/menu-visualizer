import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, Loader2, CheckCircle, Settings, Info, Mic } from "lucide-react";
import logoPath from "@assets/menu_image_1751732090803.png";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AudioInput from "./AudioInput";

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
  onMenuProcessed: (menuItems: MenuItem[], sessionId?: number) => void;
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
  const [audioText, setAudioText] = useState("");
  const [dragActive, setDragActive] = useState(false);
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
      onMenuProcessed(data.menuItems, data.sessionId);
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
      processMenuMutation.mutate({ file });
      
      toast({
        title: "Processing file...",
        description: "Your menu file is being analyzed",
      });
    } else {
      toast({
        title: "Unsupported file type",
        description: "Please upload an image or text file",
        variant: "destructive",
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/') || file.type === 'text/plain') {
        if (file.type === 'text/plain') {
          const reader = new FileReader();
          reader.onload = (e) => {
            const text = e.target?.result as string;
            setMenuText(text);
          };
          reader.readAsText(file);
        }
        processMenuMutation.mutate({ file });
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const loadSampleMenu = () => {
    const sampleText = `• Grilled Salmon with herbs and lemon
• Caesar Salad with romaine lettuce and croutons
• Pasta Carbonara with pancetta and parmesan
• Margherita Pizza with fresh basil
• Chicken Tacos with salsa and cilantro`;
    setMenuText(sampleText);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header with Logo and Settings */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src={logoPath} 
                alt="Menu to Image Logo" 
                className="w-10 h-10 object-contain"
              />
              <span className="text-xl font-semibold text-gray-900">Menu Visualizer</span>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    About Menu Visualizer
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="flex justify-center">
                    <img 
                      src={logoPath} 
                      alt="Menu to Image Logo" 
                      className="w-16 h-16 object-contain"
                    />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-semibold">Menu Visualizer</h3>
                    <p className="text-sm text-gray-600">
                      Transform your menu text into beautiful food images with AI
                    </p>
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-500">Version 1.0.0</p>
                      <p className="text-xs text-gray-500">Powered by Google Gemini AI</p>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Main Headline */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Transform your menu text into beautiful food images with AI
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Input & Control Panel */}
          <div className="space-y-6">
            <Card className="p-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">Input Your Menu</h2>
                
                {/* Option 1: Paste Menu Text */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <h3 className="font-medium text-gray-900">Paste Menu Text</h3>
                  </div>
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Paste your menu items here, one per line...&#10;&#10;• Grilled Salmon with herbs&#10;• Caesar Salad with croutons&#10;• Pasta Carbonara&#10;• Margherita Pizza"
                      value={menuText}
                      onChange={(e) => setMenuText(e.target.value)}
                      className="min-h-32 resize-none"
                    />
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={loadSampleMenu}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium underline"
                      >
                        Try a Sample Menu
                      </button>
                    </div>
                  </div>
                </div>

                <div className="text-center text-gray-400 font-medium">OR</div>

                {/* Option 2: Upload Menu Image */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <h3 className="font-medium text-gray-900">Upload Menu Image</h3>
                  </div>
                  <Card 
                    className={`border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
                      dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                  >
                    <input
                      type="file"
                      accept="image/*,.txt"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      id="file-upload"
                    />
                    <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      <label htmlFor="file-upload" className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium">
                        Upload Menu Photo
                      </label>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Drag & drop or click to browse
                    </p>
                    <p className="text-xs text-gray-500">
                      Supports JPG, PNG images
                    </p>
                  </Card>
                </div>

                <div className="text-center text-gray-400 font-medium">OR</div>

                {/* Option 3: Audio Input */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <h3 className="font-medium text-gray-900">Speak Menu Items</h3>
                  </div>
                  <AudioInput 
                    onTranscriptionChange={setAudioText}
                    transcribedText={audioText}
                  />
                </div>

                {/* Primary CTA Button */}
                <Button
                  onClick={() => {
                    const textToProcess = audioText.trim() || menuText.trim();
                    if (!textToProcess) {
                      toast({
                        title: "Please provide menu input",
                        description: "Enter text, upload an image, or record audio",
                        variant: "destructive",
                      });
                      return;
                    }
                    processMenuMutation.mutate({ menuText: textToProcess });
                  }}
                  disabled={processMenuMutation.isPending || (!menuText.trim() && !audioText.trim())}
                  className={`w-full py-4 text-lg font-semibold transition-all duration-200 ${
                    (menuText.trim() || audioText.trim()) 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {processMenuMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      ✨ Visualize Menu
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </div>

          {/* Right Column - Output & Visualization Panel */}
          <div>
            <Card className="p-6 h-full min-h-96">
              <div className="h-full flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <div className="text-gray-400">
                          <div className="w-8 h-8 mx-auto mb-2 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <h3 className="text-lg font-medium text-gray-600">Your beautiful food images will appear here</h3>
                  <p className="text-sm text-gray-500">
                    AI-generated images will showcase each menu item with professional food photography
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Processing Overlay */}
      {processMenuMutation.isPending && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <img 
                  src={logoPath} 
                  alt="Menu to Image Logo" 
                  className="w-16 h-16 object-contain"
                />
              </div>
              <div className="space-y-2">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                <h3 className="text-lg font-semibold text-gray-900">Processing Your Menu</h3>
                <p className="text-sm text-gray-600">
                  Our AI is analyzing your menu and generating custom food images...
                </p>
              </div>
              <div className="space-y-3">
                <div className="text-xs text-gray-500 space-y-1">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                    <span>Parsing menu items</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-300"></div>
                    <span>Generating AI descriptions</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-700"></div>
                    <span>Creating custom food images</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                </div>
              </div>
              <p className="text-xs text-gray-400">
                This may take 10-30 seconds depending on the number of items
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}