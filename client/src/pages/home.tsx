import { useState } from "react";
import MenuInput from "@/components/MenuInput";
import MenuResults from "@/components/MenuResults";
import { Settings } from "lucide-react";

interface MenuItem {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  createdAt: Date;
}

export default function Home() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  const handleMenuProcessed = (items: MenuItem[]) => {
    setMenuItems(items);
  };

  const handleGoBack = () => {
    setMenuItems([]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        {menuItems.length === 0 && (
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Menu Visualizer</h1>
            <Settings className="w-6 h-6 text-gray-600" />
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {menuItems.length === 0 ? (
            <MenuInput onMenuProcessed={handleMenuProcessed} />
          ) : (
            <MenuResults 
              menuItems={menuItems} 
              onBack={handleGoBack}
            />
          )}
        </div>
      </div>
    </div>
  );
}