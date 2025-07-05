import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, MicOff, Square } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// TypeScript declarations for Speech Recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface AudioInputProps {
  onTranscriptionChange: (text: string) => void;
  transcribedText: string;
}

export default function AudioInput({ onTranscriptionChange, transcribedText }: AudioInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  console.log('AudioInput component rendered', { isSupported, transcribedText });

  // Check if speech recognition is supported
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsSupported(true);
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';
        
        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = '';
          let interimTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }
          
          if (finalTranscript) {
            onTranscriptionChange(transcribedText + (transcribedText ? '\n' : '') + finalTranscript);
          }
        };
        
        recognitionRef.current.onstart = () => {
          setIsListening(true);
        };
        
        recognitionRef.current.onend = () => {
          setIsListening(false);
          setIsRecording(false);
        };
        
        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          setIsRecording(false);
          toast({
            title: "Audio Recognition Error",
            description: "There was an issue with voice recognition. Please try again.",
            variant: "destructive",
          });
        };
      }
    } else {
      setIsSupported(false);
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [transcribedText, onTranscriptionChange, toast]);

  const startRecording = () => {
    if (recognitionRef.current && isSupported) {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
        toast({
          title: "Recording Started",
          description: "Speak your menu items clearly. Say each item name.",
        });
      } catch (error) {
        console.error('Error starting recognition:', error);
        toast({
          title: "Recording Error",
          description: "Could not start voice recognition. Please check microphone permissions.",
          variant: "destructive",
        });
      }
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      setIsListening(false);
    }
  };

  const clearTranscription = () => {
    onTranscriptionChange("");
  };

  // Always show the component for now
  const testRecording = () => {
    toast({
      title: "Audio Feature Coming Soon",
      description: "Speech recognition will be available in supported browsers",
    });
  };

  return (
    <div className="space-y-4">
      <Card className={`border-2 ${isListening ? 'border-red-500 bg-red-50' : 'border-dashed border-gray-300'}`}>
        <CardContent className="p-6 text-center">
          <div className="flex justify-center mb-4">
            {isListening ? (
              <div className="relative">
                <Mic className="h-12 w-12 text-red-500 animate-pulse" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
              </div>
            ) : (
              <Mic className="h-12 w-12 text-gray-400" />
            )}
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {isListening ? "Listening..." : "Speak Menu Items"}
          </h3>
          
          <p className="text-gray-600 mb-4">
            {isListening 
              ? "Speak clearly and mention each food item name" 
              : "Click the microphone to start recording your menu items"
            }
          </p>
          
          <div className="flex justify-center gap-2">
            <Button 
              onClick={testRecording}
              className="flex items-center gap-2"
            >
              <Mic className="h-4 w-4" />
              Start Recording
            </Button>
            
            {transcribedText && (
              <Button 
                onClick={clearTranscription}
                variant="outline"
                className="flex items-center gap-2"
              >
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {transcribedText && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Transcribed Menu Items
          </label>
          <Textarea
            value={transcribedText}
            onChange={(e) => onTranscriptionChange(e.target.value)}
            placeholder="Your spoken menu items will appear here..."
            className="min-h-[100px] resize-none"
            rows={4}
          />
          <p className="text-xs text-gray-500">
            You can edit the transcribed text above before visualizing the menu
          </p>
        </div>
      )}
    </div>
  );
}