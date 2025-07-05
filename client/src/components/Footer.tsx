import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 px-4 z-10">
      <div className="text-center text-sm text-gray-600">
        © 2025 Menu Visualizer. All Rights Reserved. | {" "}
        <Link 
          href="/terms-of-service" 
          className="text-gray-600 hover:text-gray-900 underline"
        >
          Terms of Service
        </Link>
        {" "} | {" "}
        <Link 
          href="/privacy-policy" 
          className="text-gray-600 hover:text-gray-900 underline"
        >
          Privacy Policy
        </Link>
      </div>
    </footer>
  );
}