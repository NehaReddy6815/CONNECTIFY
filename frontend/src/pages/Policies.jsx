import React from "react";
import { useNavigate } from "react-router-dom";

const Policies = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 px-4 py-10">
      <div className="max-w-4xl w-full mx-auto bg-white border border-gray-300 rounded-lg shadow p-6 sm:p-10 space-y-6">
        <h1 className="text-3xl font-semibold text-gray-800">Policies</h1>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-700">Terms of Service</h2>
          <p className="text-gray-600 text-sm">
By using Connectify, you agree to abide by our terms, which include rules about account usage, prohibited content, and privacy protections.

Account Responsibilities: Users must provide accurate information during registration and are responsible for maintaining the confidentiality of their login credentials.

Prohibited Content: You may not post content that is illegal, offensive, discriminatory, or infringes on someone else's intellectual property.

Community Guidelines: Harassment, spamming, or misleading others is strictly forbidden. Violations may result in account suspension or termination.

Termination of Service: Connectify reserves the right to suspend or terminate accounts at its discretion for violations of these terms.


          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-700">Privacy Policy</h2>
          <p className="text-gray-600 text-sm">
           
We value your privacy and are committed to protecting your personal information.

Data Collection: We collect information you provide directly (e.g., name, email, username) and data generated through your activity (e.g., posts, likes).

Usage of Data: Your data is used to personalize your experience, improve the platform, and communicate important updates.

Sharing of Data: Your personal information will not be sold or shared with third parties without consent, except where required by law.

Data Security: We employ encryption and other security measures to protect your data.
           
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-xl font-semibold text-gray-700">Disclaimer</h3>
          <p className="text-gray-600 text-sm">
          
By continuing to use Connectify, you accept these policies. We may update these policies from time to time, and users will be notified of any significant changes.
          
          </p>
        </section>

        <button
          onClick={() => navigate("/")}
          className="mt-6 bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 transition-colors duration-200"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default Policies;
