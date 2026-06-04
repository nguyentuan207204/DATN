import React, { useState, useEffect } from 'react';
import { MdClose, MdQrCode2, MdCheckCircle, MdContentCopy } from 'react-icons/md';
import { toast } from 'react-toastify';
import api from '../../../utils/api';
import './QRPaymentModal.css';

const QRPaymentModal = ({ invoiceId, patientName, onClose, onSuccess }) => {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    const fetchQR = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/billing/invoices/${invoiceId}/qr`);
        if (res.data.success) {
          setQrData(res.data.data);
        }
      } catch (err) {
        toast.error('Không thể tạo mã QR. Vui lòng thử lại.');
        onClose();
      } finally {
        setLoading(false);
      }
    };
    fetchQR();
  }, [invoiceId]);

  const handleConfirmPayment = async () => {
    if (!qrData) return;
    try {
      setConfirming(true);
      const res = await api.post(`/billing/invoices/${invoiceId}/payments`, {
        amount: qrData.amount,
        method: 'QR_CODE',
      });
      if (res.data.success) {
        toast.success('✅ Xác nhận thanh toán thành công!');
        onSuccess?.();
        onClose();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Xác nhận thất bại');
    } finally {
      setConfirming(false);
    }
  };

  const handleCopyAmount = () => {
    if (qrData?.amount) {
      navigator.clipboard.writeText(String(qrData.amount));
      toast.success('Đã sao chép số tiền!');
    }
  };

  return (
    <div className="qr-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="qr-modal-container">
        {/* Header */}
        <div className="qr-modal-header">
          <div className="qr-modal-title">
            <MdQrCode2 className="qr-title-icon" />
            <div>
              <h2>Thanh toán QR Code</h2>
              <p>Hóa đơn <strong>HĐ-{invoiceId}</strong> · {patientName}</p>
            </div>
          </div>
          <button className="qr-close-btn" onClick={onClose}>
            <MdClose />
          </button>
        </div>

        {/* Body */}
        <div className="qr-modal-body">
          {loading ? (
            <div className="qr-loading">
              <div className="qr-spinner" />
              <p>Đang tạo mã QR...</p>
            </div>
          ) : qrData ? (
            <>
              {/* QR Image */}
              <div className="qr-image-wrapper">
                <div className="qr-scan-frame">
                  <img
                    src={qrData.qrUrl}
                    alt="VietQR Code"
                    className="qr-image"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      toast.error('Không tải được ảnh QR');
                    }}
                  />
                  <div className="qr-scan-line" />
                </div>
                <p className="qr-scan-hint">Quét bằng ứng dụng ngân hàng</p>
              </div>

              {/* Payment Info */}
              <div className="qr-info-grid">
                <div className="qr-info-item">
                  <span className="qr-info-label">Ngân hàng</span>
                  <span className="qr-info-value">MB Bank</span>
                </div>
                <div className="qr-info-item">
                  <span className="qr-info-label">Số tài khoản</span>
                  <span className="qr-info-value mono">{qrData.accountNo}</span>
                </div>
                <div className="qr-info-item">
                  <span className="qr-info-label">Chủ tài khoản</span>
                  <span className="qr-info-value">{qrData.accountName}</span>
                </div>
                <div className="qr-info-item amount-row">
                  <span className="qr-info-label">Số tiền</span>
                  <div className="qr-amount-row">
                    <span className="qr-amount">
                      {Number(qrData.amount).toLocaleString('vi-VN')} ₫
                    </span>
                    <button className="qr-copy-btn" onClick={handleCopyAmount} title="Sao chép">
                      <MdContentCopy />
                    </button>
                  </div>
                </div>
                <div className="qr-info-item full-width">
                  <span className="qr-info-label">Nội dung chuyển khoản</span>
                  <span className="qr-info-value mono">Thanh toan HD-{invoiceId}</span>
                </div>
              </div>

              {/* Instructions */}
              <div className="qr-instructions">
                <p>📱 Mở app ngân hàng → Chuyển tiền → Quét QR</p>
                <p>✅ Sau khi bệnh nhân chuyển xong, nhấn <strong>"Xác nhận"</strong> để cập nhật hóa đơn</p>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        {!loading && qrData && (
          <div className="qr-modal-footer">
            <button className="qr-btn-cancel" onClick={onClose}>
              Đóng
            </button>
            <button
              className="qr-btn-confirm"
              onClick={handleConfirmPayment}
              disabled={confirming}
            >
              {confirming ? (
                <><span className="btn-spinner" /> Đang xử lý...</>
              ) : (
                <><MdCheckCircle /> Đã nhận tiền – Xác nhận</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRPaymentModal;
