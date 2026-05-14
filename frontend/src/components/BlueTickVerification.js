import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './BlueTickVerification.css';

export default function BlueTickVerification({ applicationId, isAdmin = false }) {
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(null);
  const [approving, setApproving] = useState(null);
  const [notes, setNotes] = useState({});

  const verificationSteps = [
    'Aadhaar Identity Verification',
    'Panchayat / Rural Address Proof',
    'Sports Certificates Upload',
    'Performance Video Review',
    'Coach / Federation Endorsement',
  ];

  const fetchVerificationSteps = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/applications/${applicationId}/verify`);
      setSteps(res.data.verificationSteps || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    fetchVerificationSteps();
  }, [fetchVerificationSteps]);

  const handleFileUpload = async (stepName, file) => {
    if (!file) return;
    setUploading(stepName);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('stepName', stepName);

      await axios.post(`/api/applications/${applicationId}/verify/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      alert('File uploaded successfully!');
      fetchVerificationSteps();
    } catch (err) {
      alert(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(null);
    }
  };

  const handleApprove = async (stepName, status) => {
    setApproving(stepName);
    try {
      await axios.put(`/api/applications/${applicationId}/verify/${stepName}`, {
        status,
        approvalNotes: notes[stepName] || ''
      });
      alert(`Step ${status}!`);
      setNotes(prev => ({ ...prev, [stepName]: '' }));
      fetchVerificationSteps();
    } catch (err) {
      alert(err.response?.data?.error || 'Action failed');
    } finally {
      setApproving(null);
    }
  };

  const getStepStatus = (stepName) => {
    const step = steps.find(s => s.name === stepName);
    return step?.status || 'pending';
  };

  const getStepData = (stepName) => {
    return steps.find(s => s.name === stepName);
  };

  if (loading) return <div className="verification-loading">Loading verification steps...</div>;

  return (
    <div className="blue-tick-verification">
      <h3 className="verification-title">Complete all 5 steps to earn the verified Blue Tick. This builds trust with organizations.</h3>
      
      <div className="verification-steps-container">
        {verificationSteps.map((stepName) => {
          const status = getStepStatus(stepName);
          const stepData = getStepData(stepName);
          
          return (
            <div key={stepName} className={`verification-step verification-${status}`}>
              <div className="step-header">
                <div className="step-status-icon">
                  {status === 'approved' && <span className="checkmark">✓</span>}
                  {status === 'rejected' && <span className="cross">✕</span>}
                  {status === 'pending' && <span className="pending-circle"></span>}
                </div>
                <h4 className="step-name">{stepName}</h4>
              </div>

              <div className="step-content">
                {status === 'approved' && (
                  <p className="status-text approved">Verified and approved.</p>
                )}
                {status === 'rejected' && (
                  <div>
                    <p className="status-text rejected">Rejected</p>
                    {stepData?.approvalNotes && (
                      <p className="rejection-reason">Reason: {stepData.approvalNotes}</p>
                    )}
                    {!isAdmin && <p className="resubmit-hint">Please resubmit your document.</p>}
                  </div>
                )}
                {status === 'pending' && (
                  <p className="status-text pending">Pending review.</p>
                )}

                {/* Upload button for users - show always if not approved */}
                {!isAdmin && status !== 'approved' && (
                  <div className="upload-section">
                    <label className="file-upload-label">
                      <input
                        type="file"
                        onChange={(e) => handleFileUpload(stepName, e.target.files[0])}
                        disabled={uploading === stepName}
                        accept="image/*,.pdf,video/*"
                      />
                      <span className="upload-button">
                        {uploading === stepName ? '⏳ Uploading...' : '📤 Upload'}
                      </span>
                    </label>
                  </div>
                )}

                {/* Show uploaded file info for users */}
                {!isAdmin && stepData?.fileUrl && (
                  <div className="uploaded-file-info">
                    <p className="file-uploaded">✓ File uploaded - Awaiting admin review</p>
                  </div>
                )}

                {/* Admin approval section - show when file is uploaded */}
                {isAdmin && stepData?.fileUrl && (
                  <div className="admin-approval-section">
                    <a href={stepData.fileUrl} target="_blank" rel="noopener noreferrer" className="view-file-link">
                      📄 View Submitted File
                    </a>
                    {status !== 'pending' && stepData?.approvalNotes && (
                      <p className="approval-notes-display">Admin Notes: {stepData.approvalNotes}</p>
                    )}
                    {status === 'pending' && (
                      <>
                        <textarea
                          placeholder="Add approval notes (optional)"
                          value={notes[stepName] || ''}
                          onChange={(e) => setNotes(prev => ({ ...prev, [stepName]: e.target.value }))}
                          className="approval-notes"
                        />
                        <div className="approval-buttons">
                          <button
                            className="approve-btn"
                            onClick={() => handleApprove(stepName, 'approved')}
                            disabled={approving === stepName}
                          >
                            {approving === stepName ? '⏳' : '✓'} Approve
                          </button>
                          <button
                            className="reject-btn"
                            onClick={() => handleApprove(stepName, 'rejected')}
                            disabled={approving === stepName}
                          >
                            {approving === stepName ? '⏳' : '✕'} Reject
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
