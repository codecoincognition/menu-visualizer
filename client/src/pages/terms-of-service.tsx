import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 pb-20">
      <div className="max-w-4xl mx-auto">
        {/* Back to Home Button */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Menu Visualizer
            </Button>
          </Link>
        </div>

        {/* Terms Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Terms of Service for Menu Visualizer
          </h1>
          
          <p className="text-gray-600 mb-6">
            <strong>Last Updated:</strong> July 5, 2025
          </p>

          <div className="prose prose-gray max-w-none">
            <p className="mb-6">
              Welcome to Menu Visualizer! These terms and conditions outline the rules and regulations 
              for the use of our application.
            </p>

            <p className="mb-6">
              By accessing this app, we assume you accept these terms. Do not continue to use Menu 
              Visualizer if you do not agree to all of the terms stated on this page.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              1. Use of the Service
            </h2>
            <p className="mb-6">
              Menu Visualizer provides an AI-powered service to transform menu text into food images 
              ("Images"). You agree to use the service responsibly and not to upload any content that 
              is unlawful, offensive, or infringing on any third-party rights.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              2. Ownership and Rights to Generated Images
            </h2>
            <p className="mb-6">
              You are the owner of the menu text you provide. Subject to your compliance with these 
              Terms, Menu Visualizer grants you a perpetual, worldwide, non-exclusive, royalty-free 
              license to use, reproduce, and display the Images you generate for any personal or 
              commercial purpose.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              3. Limitation of Liability
            </h2>
            <p className="mb-6">
              The service is provided "as is." Menu Visualizer makes no warranties regarding the 
              accuracy or reliability of the service or the generated Images. We are not liable for 
              any damages arising from your use of the service.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              4. Changes to Terms
            </h2>
            <p className="mb-6">
              We reserve the right to amend these terms at any time. We will notify users of any 
              changes by updating the "Last Updated" date of these Terms.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              5. Governing Law
            </h2>
            <p className="mb-6">
              These terms will be governed by and construed in accordance with the laws of the state 
              of Georgia, United States, without regard to its conflict of law provisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}