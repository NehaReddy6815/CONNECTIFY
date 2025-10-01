import React from "react";
import Navbar from "../components/Navbar";
import BottomMenu from "../components/BottomMenu";

const Policies = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50">
      {/* Navbar */}
      <div className="sticky top-0 z-10">
        <Navbar />
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto px-4 py-8 max-w-3xl w-full mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
            Legal Information
          </h1>

          {/* Terms of Service */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-pink-500 mb-3">
              Terms of Service
            </h2>
            <p className="text-gray-700 text-sm leading-6">
              Welcome to Connectify. By accessing or using our service, you agree
              to be bound by these Terms of Service.
              <br />
              <br />
              Use of our platform is at your own risk. You must be at least 13
              years old to use Connectify.
              <br />
              <br />
              We may modify these terms at any time. Continued use of the
              platform constitutes acceptance of the updated terms.
            </p>
          </section>

          {/* Privacy Policy */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-pink-500 mb-3">
              Privacy Policy
            </h2>
            <p className="text-gray-700 text-sm leading-6">
              Connectify is committed to protecting your privacy. We collect
              personal information such as your name, email, and profile details
              for account creation and improving user experience.
              <br />
              <br />
              We will never sell your personal information. Data may be shared
              with third-party services only as required for functionality or
              legal obligations.
              <br />
              <br />
              You can request to view, update, or delete your personal data at
              any time.
            </p>
          </section>

          {/* Cookies Policy */}
          <section>
            <h2 className="text-2xl font-semibold text-pink-500 mb-3">
              Cookies Policy
            </h2>
            <p className="text-gray-700 text-sm leading-6">
              Connectify uses cookies to enhance your experience, remember
              preferences, and analyze site traffic.
              <br />
              <br />
              Cookies are small files stored on your device. You can disable
              cookies in your browser settings, but some functionality may be
              affected.
              <br />
              <br />
              By continuing to use our website, you consent to the use of
              cookies as described.
            </p>
          </section>

          <div className="text-center mt-8">
            <a
              href="/"
              className="inline-block bg-pink-500 text-white px-6 py-2 rounded-md hover:bg-pink-600 transition-colors text-sm"
            >
              Back to Home
            </a>
          </div>
        </div>
      </main>

      {/* Bottom Menu */}
      <div className="sticky bottom-0 z-10">
        <BottomMenu />
      </div>
    </div>
  );
};

export default Policies;
