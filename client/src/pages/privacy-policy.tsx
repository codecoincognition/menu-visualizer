import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicy() {
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

        {/* Privacy Policy Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Privacy Policy for Menu Visualizer
          </h1>
          
          <p className="text-gray-600 mb-6">
            <strong>Last Updated:</strong> July 5, 2025
          </p>

          <div className="prose prose-gray max-w-none">
            <p className="mb-6">
              Your privacy is important to us. This Privacy Policy explains how Menu Visualizer 
              ("we," "us," or "our") collects, uses, and protects your information.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              1. Information We Collect
            </h2>
            <ul className="list-disc ml-6 mb-6 space-y-2">
              <li>
                <strong>Information You Provide:</strong> We collect the menu text and any other 
                data you input into the service. If you create an account, we collect information 
                like your email address and name.
              </li>
              <li>
                <strong>Usage Data:</strong> We automatically collect information about how you 
                interact with our service, such as your IP address and browser type.
              </li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              2. How We Use Your Information
            </h2>
            <p className="mb-4">We use the information we collect to:</p>
            <ul className="list-disc ml-6 mb-6 space-y-2">
              <li>Provide, operate, and maintain our service.</li>
              <li>Generate the images as requested by you.</li>
              <li>Improve, personalize, and expand our service.</li>
              <li>Communicate with you for customer service or marketing purposes.</li>
            </ul>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-900">
                <strong>Important Note on AI Training:</strong> We respect your data. Your specific 
                menu text uploads will <strong>not</strong> be used to train our AI models without 
                your explicit, opt-in consent.
              </p>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              3. Data Security
            </h2>
            <p className="mb-6">
              We use commercially reasonable measures to protect your information from unauthorized 
              access or disclosure. However, no method of transmission over the Internet is 100% secure.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              4. Data Sharing
            </h2>
            <p className="mb-6">
              We do not sell your personal information. We may share information with third-party 
              service providers who help us operate our service (e.g., hosting providers), or if 
              required by law.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              5. Your Rights
            </h2>
            <p className="mb-6">
              Depending on your location, you may have rights regarding your personal data, such 
              as the right to access or delete your information. Please contact us to make such 
              a request.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              6. Contact Us
            </h2>
            <p className="mb-6">
              If you have any questions about this Privacy Policy, please contact us at 
              support@menuvisualizer.com.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}