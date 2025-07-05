import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Volume2, VolumeX } from "lucide-react";

interface MenuItem {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  createdAt: Date;
}

interface MenuResultsProps {
  menuItems: MenuItem[];
  onBack: () => void;
}

export default function MenuResults({ menuItems, onBack }: MenuResultsProps) {
  const [isReading, setIsReading] = useState(false);
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);

  const handleReadMenu = () => {
    if (isReading) {
      // Stop reading
      window.speechSynthesis.cancel();
      setIsReading(false);
      setCurrentUtterance(null);
      return;
    }

    // Start reading
    const menuText = menuItems
      .map(item => `${item.name}. ${item.description}`)
      .join(". ");
    
    const utterance = new SpeechSynthesisUtterance(menuText);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    utterance.onstart = () => setIsReading(true);
    utterance.onend = () => {
      setIsReading(false);
      setCurrentUtterance(null);
    };
    utterance.onerror = () => {
      setIsReading(false);
      setCurrentUtterance(null);
    };
    
    setCurrentUtterance(utterance);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Menu Visualizer</h1>
        <div className="w-20" /> {/* Spacer for centering */}
      </div>

      {/* Menu Items Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Menu Items</h2>
        <Button
          onClick={handleReadMenu}
          variant="outline"
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
      <div className="space-y-4">
        {menuItems.map((item, index) => (
          <Card key={item.id} className="p-6 flex gap-6 items-center">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {item.name}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {item.description}
              </p>
            </div>
            <div className="w-32 h-32 bg-gray-100 rounded-xl flex-shrink-0 overflow-hidden">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to a solid color placeholder
                  const target = e.target as HTMLImageElement;
                  target.style.background = `linear-gradient(135deg, #${Math.floor(Math.random()*16777215).toString(16)}, #${Math.floor(Math.random()*16777215).toString(16)})`;
                  target.src = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128'><rect width='128' height='128' fill='%23f3f4f6'/><text x='64' y='64' text-anchor='middle' dy='0.3em' font-family='Arial' font-size='12' fill='%23666'>" + encodeURIComponent(item.name) + "</text></svg>";
                }}
              />
            </div>
          </Card>
        ))}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Button variant="ghost" className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            Home
          </Button>
          
          <Button variant="ghost" className="flex items-center gap-2 font-medium">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            Menu
          </Button>
          
          <Button variant="ghost" className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
            </svg>
            Favorites
          </Button>
          
          <Button variant="ghost" className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            Profile
          </Button>
        </div>
      </div>
    </div>
  );
}