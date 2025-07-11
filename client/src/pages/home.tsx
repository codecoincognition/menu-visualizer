import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Settings,
  Info,
  Loader2,
  ArrowLeft,
  Volume2,
  VolumeX,
} from "lucide-react";
import logoPath from "@assets/menu_image_1751732090803.png";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

// Speech Recognition API types
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

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

function ProcessingOverlay() {
  const [currentMessage, setCurrentMessage] = useState(
    "Starting menu processing...",
  );
  const [messageIndex, setMessageIndex] = useState(0);

  const messages = [
    "Analyzing your menu input...",
    "Extracting food items...",
    "Generating AI descriptions...",
    "Creating beautiful food images...",
    "Finalizing results...",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => {
        const next = (prev + 1) % messages.length;
        setCurrentMessage(messages[next]);
        return next;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <img
              src={logoPath}
              alt="Menu to Image Logo"
              className="w-16 h-16 object-contain"
            />
          </div>
          <div className="space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
            <h3 className="text-lg font-semibold text-gray-900">
              Processing Your Menu
            </h3>
            <p className="text-base text-gray-700 min-h-[1.5rem] transition-all duration-500">
              {currentMessage}
            </p>
          </div>
          <p className="text-xs text-gray-400">
            This may take 10-30 seconds depending on the number of items
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [menuText, setMenuText] = useState("");
  const [audioText, setAudioText] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [sessionData, setSessionData] = useState<{
    sessionId: number;
    originalText: string;
  } | null>(null);
  const [uploadedImageData, setUploadedImageData] = useState<string | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [currentUtterance, setCurrentUtterance] =
    useState<SpeechSynthesisUtterance | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const { toast } = useToast();

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setAudioText(transcript);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.onerror = (event: any) => {
        setIsListening(false);
        toast({
          title: "Speech Recognition Error",
          description: "Please check your microphone permissions and try again.",
          variant: "destructive",
        });
      };
      
      setRecognition(recognition);
    }
  }, [toast]);

  const startListening = () => {
    if (recognition) {
      setAudioText("");
      setIsListening(true);
      recognition.start();
    } else {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition. Please use text input instead.",
        variant: "destructive",
      });
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const processMenuMutation = useMutation({
    mutationFn: async (data: {
      menuText?: string;
      file?: File;
    }): Promise<ProcessMenuResponse> => {
      const formData = new FormData();

      if (data.file) {
        formData.append("menuFile", data.file);
      }
      if (data.menuText) {
        formData.append("menuText", data.menuText);
      }

      const response = await fetch("/api/process-menu", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process menu");
      }

      return response.json();
    },
    onSuccess: (data) => {
      setMenuItems(data.menuItems);
      if (data.sessionId) {
        // Fetch session data to get original input
        fetch(`/api/menu-sessions/${data.sessionId}`)
          .then((res) => res.json())
          .then((session) => {
            setSessionData({
              sessionId: data.sessionId,
              originalText: session.originalText,
            });
          })
          .catch((err) => console.error("Failed to fetch session:", err));
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
    const textToProcess = menuText.trim() || audioText.trim();
    if (!textToProcess) {
      toast({
        title: "Please enter menu text",
        description: "Add some menu items to visualize",
        variant: "destructive",
      });
      return;
    }
    processMenuMutation.mutate({ menuText: textToProcess });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith("image/") || file.type === "text/plain") {
      if (file.type === "text/plain") {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          setMenuText(text);
        };
        reader.readAsText(file);
      } else if (file.type.startsWith("image/")) {
        // Store the image data for display
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageData = e.target?.result as string;
          setUploadedImageData(imageData);
        };
        reader.readAsDataURL(file);
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
      if (file.type.startsWith("image/") || file.type === "text/plain") {
        if (file.type === "text/plain") {
          const reader = new FileReader();
          reader.onload = (e) => {
            const text = e.target?.result as string;
            setMenuText(text);
          };
          reader.readAsText(file);
        } else if (file.type.startsWith("image/")) {
          // Store the image data for display
          const reader = new FileReader();
          reader.onload = (e) => {
            const imageData = e.target?.result as string;
            setUploadedImageData(imageData);
          };
          reader.readAsDataURL(file);
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
    setUploadedImageData(null);
  };

  const handleReadMenu = () => {
    if (isReading) {
      // Stop reading
      speechSynthesis.cancel();
      setIsReading(false);
      setCurrentUtterance(null);
    } else {
      // Start reading
      const menuText = menuItems
        .map((item) => `${item.name}. ${item.description}`)
        .join(". ");

      if ("speechSynthesis" in window) {
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
    <div className="min-h-screen bg-gray-50 pb-20">
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
              <span className="text-xl font-semibold text-gray-900">
                Menu Visualizer
              </span>
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
                      Transform your menu text into beautiful food images with
                      AI
                    </p>
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-500">Version 1.0.0</p>
                      <p className="text-xs text-gray-500">
                        Powered by Google Gemini AI
                      </p>
                      <p className="text-xs text-gray-500">
                        Developed by Vikas Sah (vikassah@gmail.com)
                      </p>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Main Headline */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Transform your menu text into beautiful food images with AI
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Input & Control Panel */}
          <div className="space-y-4">
            <Card className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Input Your Menu
                  </h2>
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
                  {/* Option 1: Paste Menu Text */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">
                        1
                      </div>
                      <h3 className="font-medium text-gray-900 text-sm">
                        Paste Menu Text
                      </h3>
                    </div>
                    <Textarea
                      placeholder="Paste your menu items here, one per line...&#10;&#10;• Grilled Salmon with herbs&#10;• Caesar Salad with croutons&#10;• Pasta Carbonara&#10;• Margherita Pizza"
                      value={menuText}
                      onChange={(e) => setMenuText(e.target.value)}
                      className="min-h-24 resize-none text-sm leading-relaxed"
                      disabled={processMenuMutation.isPending}
                    />
                    
                    {/* Try Sample Menu Link */}
                    <div className="text-left">
                      <button
                        type="button"
                        onClick={loadSampleMenu}
                        className="text-blue-600 hover:text-blue-700 text-xs font-medium underline"
                        disabled={processMenuMutation.isPending}
                      >
                        Try a Sample Menu
                      </button>
                    </div>
                  </div>

                  {/* OR Divider */}
                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-2 bg-white text-gray-500">OR</span>
                    </div>
                  </div>

                  {/* Option 2: Upload Menu Image */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-semibold">
                        2
                      </div>
                      <h3 className="font-medium text-gray-900 text-sm">
                        Upload Menu Image
                      </h3>
                    </div>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*,.txt"
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        id="file-upload"
                        disabled={processMenuMutation.isPending}
                        onDragEnter={handleDragOver}
                      />
                      <div
                        className={`border-2 border-dashed rounded-lg p-4 text-center transition-all duration-200 cursor-pointer ${
                          dragActive
                            ? "border-green-500 bg-green-50"
                            : "border-gray-300 hover:border-green-400 hover:bg-gray-50"
                        }`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                      >
                        <div className="space-y-1">
                          <div className="text-gray-400">
                            <svg
                              className="w-6 h-6 mx-auto"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              Upload Menu Photo
                            </p>
                            <p className="text-xs text-gray-500">
                              Drag & drop or click to browse
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* OR Divider */}
                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-2 bg-white text-gray-500">OR</span>
                    </div>
                  </div>

                  {/* Option 3: Audio Input */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-semibold">
                        3
                      </div>
                      <h3 className="font-medium text-gray-900 text-sm">
                        Speak Menu Items
                      </h3>
                    </div>
                    <div className="border-2 border-dashed border-orange-300 rounded-lg p-4 text-center">
                      <div className="space-y-2">
                        <div className="text-orange-500">
                          <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Record Menu Items
                          </p>
                          <p className="text-xs text-gray-500 mb-2">
                            Click to record your voice speaking menu items
                          </p>
                          <Button 
                            type="button"
                            onClick={isListening ? stopListening : startListening}
                            className={`${isListening ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-600 hover:bg-orange-700'} text-white text-xs px-3 py-1`}
                            disabled={processMenuMutation.isPending}
                          >
                            {isListening ? (
                              <>🔴 Stop Recording</>
                            ) : (
                              <>🎤 Start Recording</>
                            )}
                          </Button>
                        </div>
                        {audioText && (
                          <div className="mt-2">
                            <Textarea
                              value={audioText}
                              onChange={(e) => setAudioText(e.target.value)}
                              placeholder="Your spoken menu items will appear here..."
                              className="min-h-16 text-xs"
                              disabled={processMenuMutation.isPending}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Primary CTA Button */}
                  <Button
                    type="submit"
                    disabled={processMenuMutation.isPending || (!menuText.trim() && !audioText.trim())}
                    className={`w-full py-3 text-base font-semibold transition-all duration-200 ${
                      (menuText.trim() || audioText.trim())
                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {processMenuMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>✨ Visualize Menu</>
                    )}
                  </Button>
                </form>
              </div>
            </Card>
          </div>

          {/* Right Column - Output & Visualization Panel */}
          <div>
            <Card className="p-6 h-full min-h-96">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Results</h2>
              </div>
              {menuItems.length === 0 ? (
                /* Empty State */
                <div className="h-full flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center"
                        >
                          <div className="text-gray-400">
                            <div className="w-8 h-8 mx-auto mb-2 bg-gray-200 rounded"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <h3 className="text-lg font-medium text-gray-600">
                      Once you provide your input, your beautiful food images
                      will appear here
                    </h3>
                    <p className="text-sm text-gray-500">
                      AI-generated images will showcase each menu item with
                      professional food photography
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
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          Original Input
                        </h3>
                        {sessionData.originalText.startsWith(
                          "Uploaded image:",
                        ) ? (
                          <div className="space-y-3">
                            {uploadedImageData && (
                              <div className="max-w-md">
                                <img 
                                  src={uploadedImageData} 
                                  alt="Original uploaded menu"
                                  className="w-full h-auto rounded-lg border border-gray-200 shadow-sm"
                                />
                              </div>
                            )}
                            <div className="text-sm text-gray-600">
                              <p className="font-medium">
                                📁 {sessionData.originalText}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Image was processed and analyzed for menu items
                              </p>
                            </div>
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
                    <h2 className="text-2xl font-bold text-gray-900">
                      Menu Items ({menuItems.length})
                    </h2>
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
                  <div className="grid grid-cols-2 gap-4">
                    {menuItems.map((item) => (
                      <div key={item.id} className="group">
                        <div className="relative">
                          <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-200">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                            />
                            {/* Hover overlay with description */}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-200 flex items-center justify-center p-4">
                              <p className="text-white text-sm text-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 leading-relaxed">
                                {item.description}
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 text-center">
                            <h3 className="font-semibold text-gray-900 text-base leading-tight">
                              {item.name}
                            </h3>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Processing Overlay */}
      {processMenuMutation.isPending && <ProcessingOverlay />}
    </div>
  );
}
