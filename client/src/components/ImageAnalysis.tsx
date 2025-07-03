import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import AudioPlayer from "./AudioPlayer";

interface AnalysisResult {
  id: number;
  analysisText: string;
  success: boolean;
}

interface ImageAnalysisProps {
  result: AnalysisResult;
  imageData: string | null;
  onAnalyzeAnother: () => void;
  onViewCode: () => void;
}

export default function ImageAnalysis({ 
  result, 
  imageData, 
  onAnalyzeAnother, 
  onViewCode 
}: ImageAnalysisProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(result.analysisText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Text Copied",
        description: "Analysis text has been copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy text to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Analysis Results</h2>
        
        {/* Show uploaded image */}
        {imageData && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Analyzed Image</h3>
            <img
              src={imageData}
              alt="Analyzed"
              className="w-full max-w-md mx-auto rounded-lg shadow-sm border border-gray-200"
            />
          </div>
        )}

        {/* Text Analysis */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">AI Description</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyText}
              className="text-blue-600 hover:text-blue-700"
            >
              {copied ? (
                <Check className="w-4 h-4 mr-1" />
              ) : (
                <Copy className="w-4 h-4 mr-1" />
              )}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </Button>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="text-gray-700 leading-relaxed prose prose-sm max-w-none">
              <ReactMarkdown>{result.analysisText}</ReactMarkdown>
            </div>
          </div>
        </div>

        {/* Audio Output */}
        <AudioPlayer text={result.analysisText} />

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mt-8">
          <Button
            onClick={onAnalyzeAnother}
            variant="outline"
            className="bg-gray-600 text-white hover:bg-gray-700 border-gray-600"
          >
            Analyze Another Image
          </Button>
          <Button
            onClick={onViewCode}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            View Code Examples
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
