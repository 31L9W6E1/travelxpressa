import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

export default function Disclaimer() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Legal Disclaimer</h1>

      <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
          <div>
            <h2 className="text-xl font-semibold text-red-800 mb-2">Important Notice</h2>
            <p className="text-red-700">
              DS-160 Helper is an independent, privately-operated service. We are <strong>NOT</strong> affiliated with, endorsed by, or connected to:
            </p>
            <ul className="list-disc pl-6 mt-2 text-red-700">
              <li>The U.S. Department of State</li>
              <li>Any U.S. Embassy or Consulate</li>
              <li>Any U.S. Government Agency</li>
              <li>USCIS (U.S. Citizenship and Immigration Services)</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="prose prose-blue max-w-none">
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Nature of Service</h2>
          <p className="text-gray-700 mb-4">
            DS-160 Helper is a form preparation assistance service. We help users:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700">
            <li>Understand the DS-160 form requirements</li>
            <li>Organize and prepare their information</li>
            <li>Identify potential errors before submission</li>
            <li>Save their progress and work at their own pace</li>
          </ul>
          <p className="text-gray-700 mb-4">
            <strong>We do NOT submit applications to the U.S. government.</strong> All final submissions must be made through the official government website at{' '}
            <a
              href="https://ceac.state.gov/genniv/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              ceac.state.gov
            </a>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">No Legal Advice</h2>
          <p className="text-gray-700 mb-4">
            This service does NOT provide:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700">
            <li>Legal advice</li>
            <li>Immigration advice</li>
            <li>Visa interview coaching</li>
            <li>Guarantees of visa approval</li>
          </ul>
          <p className="text-gray-700 mb-4">
            The information provided is for general guidance only. For legal advice, please consult a licensed immigration attorney.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">No Guarantee of Outcome</h2>
          <p className="text-gray-700 mb-4">
            Using our service does NOT guarantee:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700">
            <li>Visa approval</li>
            <li>Interview scheduling</li>
            <li>Faster processing times</li>
            <li>Any specific outcome from the U.S. government</li>
          </ul>
          <p className="text-gray-700 mb-4">
            Visa decisions are made solely by U.S. Consular Officers based on factors including but not limited to the information in your application, your interview, and applicable U.S. laws and regulations.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">User Responsibility</h2>
          <p className="text-gray-700 mb-4">
            You are solely responsible for:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700">
            <li>The accuracy of all information you provide</li>
            <li>Reviewing your application before official submission</li>
            <li>Understanding the visa requirements for your situation</li>
            <li>Submitting your application through official channels</li>
            <li>Attending your visa interview (if required)</li>
            <li>Complying with all U.S. immigration laws</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Official Resources</h2>
          <p className="text-gray-700 mb-4">
            For official information, please visit:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700">
            <li>
              <a
                href="https://travel.state.gov"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                U.S. Department of State - Bureau of Consular Affairs
              </a>
            </li>
            <li>
              <a
                href="https://ceac.state.gov/genniv/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                Official DS-160 Online Application
              </a>
            </li>
            <li>
              <a
                href="https://www.usembassy.gov"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                U.S. Embassy & Consulate Websites
              </a>
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Limitation of Liability</h2>
          <p className="text-gray-700 mb-4">
            DS-160 Helper and its operators, employees, and affiliates shall not be held liable for:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700">
            <li>Visa denials or delays</li>
            <li>Errors in user-provided information</li>
            <li>Changes to U.S. visa requirements or processes</li>
            <li>Technical issues with official government systems</li>
            <li>Any losses resulting from use of our service</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Acknowledgment</h2>
          <p className="text-gray-700 mb-4">
            By using DS-160 Helper, you acknowledge that you have read, understood, and agree to this disclaimer. You understand that this is a private assistance service and not an official government resource.
          </p>
        </section>
      </div>

      <div className="mt-8 pt-8 border-t flex justify-between">
        <Link to="/" className="text-blue-600 hover:text-blue-800">
          &larr; Back to Home
        </Link>
        <div className="space-x-4">
          <Link to="/terms" className="text-blue-600 hover:text-blue-800">
            Terms of Service
          </Link>
          <Link to="/privacy" className="text-blue-600 hover:text-blue-800">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
