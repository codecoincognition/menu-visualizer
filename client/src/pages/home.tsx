import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Settings, Info, Loader2, ArrowLeft, Volume2, VolumeX } from "lucide-react";
import logoPath from "@assets/menu_image_1751732090803.png";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useMutation } from "@tanstack/react-query";
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

export default function Home() {
  const [menuText, setMenuText] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [sessionData, setSessionData] = useState<{ sessionId: number; originalText: string } | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);
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
      setMenuItems(data.menuItems);
      if (data.sessionId) {
        // Fetch session data to get original input
        fetch(`/api/menu-sessions/${data.sessionId}`)
          .then(res => res.json())
          .then(session => {
            setSessionData({ sessionId: data.sessionId, originalText: session.originalText });
          })
          .catch(err => console.error('Failed to fetch session:', err));
      }
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
    processMenuMutation.mutate({ menuText });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

  const handleGoBack = () => {
    setMenuItems([]);
    setSessionData(null);
    setMenuText("");
  };

  const handleReadMenu = () => {
    if (isReading) {
      // Stop reading
      speechSynthesis.cancel();
      setIsReading(false);
      setCurrentUtterance(null);
    } else {
      // Start reading
      const menuText = menuItems.map(item => `${item.name}. ${item.description}`).join('. ');
      
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(menuText);
        utterance.rate = 0.8;
        utterance.pitch = 1;
        utterance.volume = 1;
        
        utterance.onend = () => {
          setIsReading(false);
          setCurrentUtterance(null);
        };
        
        utterance.onerror = () => {
          setIsReading(false);
          setCurrentUtterance(null);
          toast({
            title: "Speech synthesis error",
            description: "Unable to read menu items aloud",
            variant: "destructive",
          });
        };
        
        setCurrentUtterance(utterance);
        setIsReading(true);
        speechSynthesis.speak(utterance);
      } else {
        toast({
          title: "Speech synthesis not supported",
          description: "Your browser doesn't support text-to-speech",
          variant: "destructive",
        });
      }
    }
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
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Input Your Menu</h2>
                  {menuItems.length > 0 && (
                    <Button
                      onClick={handleGoBack}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      New Menu
                    </Button>
                  )}
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Unified Input Area */}
                  <div className="relative">
                    <Textarea
                      placeholder="Paste your menu items here, one per line...&#10;&#10;• Grilled Salmon with herbs&#10;• Caesar Salad with croutons&#10;• Pasta Carbonara&#10;• Margherita Pizza&#10;&#10;...or browse for a file"
                      value={menuText}
                      onChange={(e) => setMenuText(e.target.value)}
                      className="min-h-48 resize-none text-base leading-relaxed"
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      style={{
                        backgroundColor: dragActive ? '#f3f4f6' : 'white',
                        borderColor: dragActive ? '#3b82f6' : ''
                      }}
                      disabled={processMenuMutation.isPending}
                    />
                    
                    {/* File Upload Integration */}
                    <div className="absolute top-4 right-4">
                      <input
                        type="file"
                        accept="image/*,.txt"
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        id="file-upload"
                        disabled={processMenuMutation.isPending}
                      />
                      <label htmlFor="file-upload" className="cursor-pointer text-blue-600 hover:text-blue-700 text-sm font-medium">
                        browse for a file
                      </label>
                    </div>
                  </div>

                  {/* Try Sample Menu Link */}
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={loadSampleMenu}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium underline"
                      disabled={processMenuMutation.isPending}
                    >
                      Try a Sample Menu
                    </button>
                  </div>

                  {/* Primary CTA Button */}
                  <Button
                    type="submit"
                    disabled={processMenuMutation.isPending || !menuText.trim()}
                    className={`w-full py-4 text-lg font-semibold transition-all duration-200 ${
                      menuText.trim() 
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
                </form>
              </div>
            </Card>
          </div>

          {/* Right Column - Output & Visualization Panel */}
          <div>
            <Card className="p-6 h-full min-h-96">
              {menuItems.length === 0 ? (
                /* Empty State */
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
              ) : (
                /* Results Display */
                <div className="space-y-6">
                  {/* Original Input Section */}
                  {sessionData?.originalText && (
                    <Card className="border-gray-200">
                      <CardContent className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Original Input</h3>
                        {sessionData.originalText.startsWith('Uploaded image:') ? (
                          <div className="text-sm text-gray-600">
                            <p className="font-medium">📁 {sessionData.originalText}</p>
                            <p className="text-xs text-gray-500 mt-1">Image was processed and analyzed for menu items</p>
                          </div>
                        ) : (
                          <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
                            {sessionData.originalText}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Menu Items Header */}
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">Menu Items ({menuItems.length})</h2>
                    <Button
                      onClick={handleReadMenu}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      {isReading ? (
                        <>
                          <VolumeX className="w-4 h-4" />
                          Stop Reading
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-4 h-4" />
                          Read Menu
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Menu Items Grid */}
                  <div className="grid gap-4">
                    {menuItems.map((item) => (
                      <Card key={item.id} className="overflow-hidden">
                        <div className="aspect-video relative mb-3">
                          <img 
                            src={item.imageUrl} 
                            alt={item.name}
                            className="w-full h-full object-cover rounded-t-lg"
                          />
                        </div>
                        <div className="p-4 pt-0">
                          <h3 className="font-semibold text-gray-900 mb-2 text-lg">{item.name}</h3>
                          <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
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