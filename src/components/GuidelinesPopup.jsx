// src/components/GuidelinesPopup.jsx
import React from 'react';
import { X, BookOpen, AlertCircle } from 'lucide-react';

const GuidelinesPopup = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            Important Notice
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="text-center mb-4">
            <BookOpen className="w-12 h-12 text-red-600 mx-auto mb-3" />
            <h4 className="text-lg font-semibold text-gray-800 mb-2 bangla">
              গুরুত্বপূর্ণ দিকনির্দেশনা পড়ে নিন
            </h4>
            <p className="text-gray-600 bangla">
              রক্তদানের আগে আমাদের গুরুত্বপূর্ণ নির্দেশিকা পড়ে নিন। এতে রক্তদানের ইসলামিক বিধান, ফযীলত এবং প্রয়োজনীয় নির্দেশনা সম্পর্কে জানতে পারবেন।
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <h5 className="font-semibold text-red-800 mb-2 bangla">🚫 গুরুত্বপূর্ণ সতর্কতা:</h5>
            <ul className="text-sm text-red-700 space-y-1 bangla">
              <li>• "Not Eligible" ডোনারদের সাথে যোগাযোগ করবেন না</li>
              <li>• রক্তদানের পর অবশ্যই প্রোফাইল আপডেট করুন</li>
            </ul>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-all"
          >
            আমি পড়ে ফেলেছি
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuidelinesPopup;