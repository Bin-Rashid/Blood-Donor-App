// src/components/PhoneRequestModal.jsx
import React, { useState } from 'react';
import { X, User, Phone, Home, AlertTriangle, MessageCircle, CheckCircle, Copy } from 'lucide-react';

const PhoneRequestModal = ({ isOpen, onClose, onSubmit, donorName, donorBloodType, donorLocation, donorPhone }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    patientProblem: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showPhoneNumber, setShowPhoneNumber] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim() || !formData.phone.trim() || !formData.patientProblem.trim()) {
      alert('Please fill in all required fields');
      return;
    }
    
    if (formData.phone.length < 11) {
      alert('Please enter a valid phone number');
      return;
    }
    
    setLoading(true);
    
    try {
      await onSubmit(formData);
      setSubmitted(true);
      // Don't show phone number immediately, wait for user to acknowledge
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleShowPhoneNumber = () => {
    setShowPhoneNumber(true);
  };

  const handleCopyPhoneNumber = () => {
    if (donorPhone) {
      navigator.clipboard.writeText(donorPhone);
      alert('Phone number copied to clipboard!');
    }
  };

  const handleCallDonor = () => {
    if (donorPhone) {
      window.open(`tel:${donorPhone}`, '_blank');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Phone number validation - only numbers
    if (name === 'phone') {
      const numbersOnly = value.replace(/\D/g, '');
      if (numbersOnly.length > 11) return;
      setFormData(prev => ({ ...prev, [name]: numbersOnly }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const resetModal = () => {
    setFormData({
      name: '',
      phone: '',
      address: '',
      patientProblem: ''
    });
    setSubmitted(false);
    setShowPhoneNumber(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-red-500" />
              {submitted ? 'Request Submitted' : 'Request Phone Number'}
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              {submitted ? 'Thank you for your request' : 'Provide your details to get donor\'s contact'}
            </p>
          </div>
          <button
            onClick={resetModal}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Donor Info */}
        <div className="p-6 bg-red-50 border-y border-red-100">
          <h3 className="font-semibold text-gray-700 mb-2">Donor Information</h3>
          <div className="space-y-1 text-sm text-gray-600">
            <p><span className="font-medium">Name:</span> {donorName}</p>
            <p><span className="font-medium">Blood Type:</span> {donorBloodType || 'Unknown'}</p>
            <p><span className="font-medium">Location:</span> {donorLocation || 'Not specified'}</p>
          </div>
        </div>

        {/* Submitted Success View */}
        {submitted && (
          <div className="p-6 space-y-6">
            {/* Success Message */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h3 className="font-bold text-green-700 text-lg mb-2">Request Submitted Successfully!</h3>
              <p className="text-green-600 text-sm">
                Your information has been sent to the administrator. 
                You can now access the donor's phone number.
              </p>
            </div>

            {/* Phone Number Section */}
            <div className="space-y-4">
              <div className="text-center">
                <h4 className="font-semibold text-gray-700 mb-3">Donor's Phone Number</h4>
                
                {showPhoneNumber ? (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-red-100 to-red-50 p-4 rounded-xl border-2 border-red-200">
                      <div className="text-2xl font-bold text-red-700 tracking-wider">
                        {donorPhone}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Phone number revealed
                      </p>
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={handleCopyPhoneNumber}
                        className="flex-1 btn-outline flex items-center justify-center gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        Copy
                      </button>
                      <button
                        onClick={handleCallDonor}
                        className="flex-1 btn-primary flex items-center justify-center gap-2"
                      >
                        <Phone className="w-4 h-4" />
                        Call Now
                      </button>
                    </div>
                    
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-700">
                      <AlertTriangle className="w-4 h-4 inline mr-1" />
                      Please use this number responsibly for blood donation purposes only.
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-gray-100 p-6 rounded-xl">
                      <div className="text-lg font-mono text-gray-700">
                        •••••••••{donorPhone ? donorPhone.slice(-4) : '••••'}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Click the button below to reveal the phone number
                      </p>
                    </div>
                    
                    <button
                      onClick={handleShowPhoneNumber}
                      className="w-full btn-primary flex items-center justify-center gap-2"
                    >
                      <Phone className="w-4 h-4" />
                      Reveal Phone Number
                    </button>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-700 text-sm mb-2">Next Steps:</h4>
                <ul className="text-sm text-blue-600 space-y-1">
                  <li>1. Call the donor and politely introduce yourself</li>
                  <li>2. Explain the patient's situation and blood requirement</li>
                  <li>3. Schedule a convenient time for donation</li>
                  <li>4. Arrange transportation if needed</li>
                  <li>5. Thank the donor for their generosity</li>
                </ul>
              </div>

              {/* Close Button */}
              <button
                onClick={resetModal}
                className="w-full btn-outline"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Form View (Before Submission) */}
        {!submitted && (
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <User className="w-4 h-4 inline mr-1" />
                  Your Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className="form-input w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Your Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="01XXXXXXXXX"
                  className="form-input w-full"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Must be 11 digits</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Home className="w-4 h-4 inline mr-1" />
                  Your Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Your current address"
                  className="form-input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <AlertTriangle className="w-4 h-4 inline mr-1" />
                  Patient's Problem / Need for Blood *
                </label>
                <textarea
                  name="patientProblem"
                  value={formData.patientProblem}
                  onChange={handleChange}
                  placeholder="Describe the patient's condition and need for blood..."
                  rows="3"
                  className="form-input w-full"
                  required
                />
              </div>

              {/* Terms and Conditions */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-yellow-700">
                    <p className="font-medium">Important:</p>
                    <ul className="list-disc pl-4 mt-1 space-y-1">
                      <li>Your information will be sent to the administrator</li>
                      <li>Only use the donor's contact for legitimate blood donation requests</li>
                      <li>Phone number will be revealed after form submission</li>
                      <li>Do not misuse or share the contact information</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetModal}
                  className="flex-1 btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <MessageCircle className="w-4 h-4" />
                      Submit & Get Number
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PhoneRequestModal;