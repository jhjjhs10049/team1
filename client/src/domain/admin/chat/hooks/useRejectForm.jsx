import { useState } from "react";

const useRejectForm = () => {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showActiveRejectForm, setShowActiveRejectForm] = useState(false);

  const showWaitingRejectForm = () => {
    setShowRejectForm(true);
  };

  const showActiveRejectFormModal = () => {
    setShowActiveRejectForm(true);
  };

  const handleCancelReject = () => {
    setShowRejectForm(false);
    setShowActiveRejectForm(false);
    setRejectionReason("");
  };

  const handleReasonChange = (value) => {
    setRejectionReason(value);
  };

  const resetForm = () => {
    setShowRejectForm(false);
    setShowActiveRejectForm(false);
    setRejectionReason("");
  };

  return {
    showRejectForm,
    rejectionReason,
    showActiveRejectForm,
    showWaitingRejectForm,
    showActiveRejectFormModal,
    handleCancelReject,
    handleReasonChange,
    resetForm
  };
};

export default useRejectForm;
