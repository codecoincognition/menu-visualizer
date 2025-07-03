import { useState } from "react";
import ImageUpload from "@/components/ImageUpload";
import ImageAnalysis from "@/components/ImageAnalysis";
import CodeExamples from "@/components/CodeExamples";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";

interface AnalysisResult {
  id: number;
  analysisText: string;
  success: boolean;
}

export default function Home() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [showCodeModal, setShowCodeModal] = useState(false);

  const handleAnalysisComplete = (result: AnalysisResult, imageData: string) => {
    setAnalysisResult(result);
    setUploadedImage(imageData);
  };

  const handleAnalyzeAnother = () => {
    setAnalysisResult(null);
    setUploadedImage(null);
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Multimodal AI App</h1>
              <p className="text-gray-600 mt-1">Learn to build AI apps with image analysis and text-to-speech</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                Educational Template
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Instructions Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <Info className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">How to Use This Template</h3>
              <div className="text-gray-600 space-y-2">
                <p>1. Upload an image using the drag-and-drop area below</p>
                <p>2. The AI will analyze your image and generate a description</p>
                <p>3. Listen to the audio version of the description</p>
                <p>4. Explore the code to understand how multimodal AI apps work</p>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        {!analysisResult && (
          <ImageUpload onAnalysisComplete={handleAnalysisComplete} />
        )}

        {/* Results Section */}
        {analysisResult && (
          <ImageAnalysis
            result={analysisResult}
            imageData={uploadedImage}
            onAnalyzeAnother={handleAnalyzeAnother}
            onViewCode={() => setShowCodeModal(true)}
          />
        )}

        {/* Code Examples Modal */}
        <CodeExamples
          isOpen={showCodeModal}
          onClose={() => setShowCodeModal(false)}
        />


      </main>
    </div>
  );
}
