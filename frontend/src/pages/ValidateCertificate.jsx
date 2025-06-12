import { useState } from 'react';
import { Search, CheckCircle, XCircle, Award } from 'lucide-react';
import axios from 'axios';

const CertificateValidator = () => {
  const [certificateId, setCertificateId] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleValidation = async (e) => {
    if (e) e.preventDefault();
    if (!certificateId.trim()) return;

    setLoading(true);
    
    try {
      const response = await axios.get(`http://localhost:8080/api/v1/certificates/validate/${certificateId}`);
      
      if (response.data.success) {
        setValidationResult({
          found: true,
          data: response.data.data
        });
      } else {
        setValidationResult({
          found: false,
          message: response.data.message
        });
      }
    } catch (error) {
      setValidationResult({
        found: false,
        message: error.response?.data?.message || 'Error validating certificate'
      });
    } finally {
      setLoading(false);
    }
    console.log(validationResult.data);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f1f5f9] to-[#e2e8f0] dark:from-[#1e1e2f] dark:to-[#0f172a] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Award className="w-16 h-16 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Certificate Validator
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Verify the authenticity of certificates by entering the certificate ID
          </p>
        </div>

        {/* Validation Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
          <div className="space-y-6">
            <div>
              <label htmlFor="certificateId" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Certificate ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="certificateId"
                  value={certificateId}
                  onChange={(e) => setCertificateId(e.target.value)}
                  placeholder="Enter certificate ID (e.g., SKILL-2024-00123)"
                  className="w-full px-4 py-3 pl-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleValidation(e);
                    }
                  }}
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              </div>
            </div>
            
            <button
              onClick={handleValidation}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:disabled:bg-indigo-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Validating...</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span>Validate Certificate</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Validation Results */}
        {validationResult && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
            {validationResult.found ? (
              <>
                {/* Success Header */}
                <div className="bg-green-50 dark:bg-green-900/20 border-b border-green-200 dark:border-green-800 p-6">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                    <div>
                      <h2 className="text-2xl font-bold text-green-800 dark:text-green-400">Certificate Valid</h2>
                      <p className="text-green-600 dark:text-green-300">This certificate has been verified successfully</p>
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  <div className="space-y-6">
                    {/* Certificate Information */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Username</label>
                        <p className="text-xl font-semibold text-gray-900 dark:text-white">{validationResult.data.username}</p>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Course Title</label>
                        <p className="text-xl font-semibold text-gray-900 dark:text-white">{validationResult.data.courseTitle}</p>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Category</label>
                        <p className="text-lg text-gray-900 dark:text-white">{validationResult.data.category}</p>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Course Level</label>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          validationResult.data.courseLevel === 'Beginner' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          validationResult.data.courseLevel === 'Intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {validationResult.data.courseLevel}
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg text-center">
                      <label className="block text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">Date of Completion</label>
                      <p className="text-2xl font-bold text-blue-800 dark:text-blue-300">
                        {formatDate(validationResult.data.completionDate)}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Error State */
              <div className="p-8 text-center">
                <XCircle className="w-16 h-16 text-red-500 dark:text-red-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-red-800 dark:text-red-400 mb-2">Certificate Not Found</h2>
                <p className="text-red-600 dark:text-red-300 text-lg">{validationResult.message}</p>
                <p className="text-gray-500 dark:text-gray-400 mt-4">
                  Please check the certificate ID and try again. Make sure you&apos;ve entered the complete ID.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificateValidator;