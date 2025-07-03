import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AudioPlayerProps {
  text: string;
}

export default function AudioPlayer({ text }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isSupported, setIsSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const speeds = [1, 1.25, 1.5, 2];

  useEffect(() => {
    // Check if Speech Synthesis is supported
    if ('speechSynthesis' in window) {
      setIsSupported(true);
    } else {
      toast({
        title: "Text-to-Speech Not Supported",
        description: "Your browser doesn't support text-to-speech functionality",
        variant: "destructive",
      });
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (utteranceRef.current) {
        speechSynthesis.cancel();
      }
    };
  }, [toast]);

  const estimateDuration = (text: string, rate: number) => {
    // Rough estimate: average reading speed is about 200 words per minute
    const wordsPerMinute = 200 * rate;
    const words = text.split(' ').length;
    return Math.ceil((words / wordsPerMinute) * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (!isSupported) return;

    if (isPlaying) {
      // Pause
      speechSynthesis.pause();
      setIsPlaying(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    } else {
      // Play
      if (speechSynthesis.paused) {
        // Resume
        speechSynthesis.resume();
      } else {
        // Start new
        speechSynthesis.cancel(); // Cancel any existing speech
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = playbackRate;
        utterance.pitch = 1;
        utterance.volume = 1;

        // Try to get a good voice
        const voices = speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice => 
          voice.name.includes('Google') || 
          voice.name.includes('Microsoft') ||
          voice.default
        );
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        utterance.onstart = () => {
          const estimatedDuration = estimateDuration(text, playbackRate);
          setDuration(estimatedDuration);
          setCurrentTime(0);
          setProgress(0);
          
          // Start progress tracking
          intervalRef.current = setInterval(() => {
            setCurrentTime(prev => {
              const newTime = prev + 1;
              setProgress((newTime / estimatedDuration) * 100);
              return newTime;
            });
          }, 1000);
        };

        utterance.onend = () => {
          setIsPlaying(false);
          setProgress(0);
          setCurrentTime(0);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
        };

        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event);
          setIsPlaying(false);
          setProgress(0);
          setCurrentTime(0);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          toast({
            title: "Speech Error",
            description: "Failed to generate speech. Please try again.",
            variant: "destructive",
          });
        };

        utteranceRef.current = utterance;
        speechSynthesis.speak(utterance);
      }
      
      setIsPlaying(true);
    }
  };

  const handleSpeedChange = () => {
    const currentIndex = speeds.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % speeds.length;
    const newRate = speeds[nextIndex];
    setPlaybackRate(newRate);

    // If currently playing, restart with new rate
    if (isPlaying) {
      speechSynthesis.cancel();
      setIsPlaying(false);
      setCurrentTime(0);
      setProgress(0);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  const handleRegenerate = () => {
    speechSynthesis.cancel();
    setIsPlaying(false);
    setCurrentTime(0);
    setProgress(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    toast({
      title: "Audio Reset",
      description: "Click play to generate new audio",
    });
  };

  const handleDownload = () => {
    toast({
      title: "Download Not Available",
      description: "Browser-based text-to-speech doesn't support direct download. Use the play button to listen.",
    });
  };

  if (!isSupported) {
    return (
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Audio Version</h3>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-gray-500 text-center">
            Text-to-speech is not supported in your browser
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Audio Version</h3>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRegenerate}
            className="text-blue-600 hover:text-blue-700"
          >
            Regenerate
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="text-blue-600 hover:text-blue-700"
          >
            Download
          </Button>
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              onClick={handlePlayPause}
              disabled={!isSupported}
              className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </Button>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 min-w-0">
                  {formatTime(currentTime)}
                </span>
                <div className="flex-1 bg-gray-200 rounded-full h-2 relative min-w-0">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <span className="text-sm text-gray-500 min-w-0">
                  {formatTime(duration)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSpeedChange}
              className="text-sm px-2 py-1"
            >
              {playbackRate}x
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700"
            >
              <Volume2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
