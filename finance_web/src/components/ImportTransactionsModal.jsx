import React, { useState, useRef } from 'react';
import { Upload, FileText, X, CheckCircle2, Download, Trash2 } from 'lucide-react';
import api from '../api/client';
import './ImportTransactionsModal.css';

export const ImportTransactionsModal = ({ isOpen, onClose, onImported }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [importResult, setImportResult] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const addFiles = (fileList) => {
    const incoming = Array.from(fileList || []);
    if (!incoming.length) return;
    setError('');
    setImportResult(null);
    setSelectedFiles((prev) => {
      const map = new Map(prev.map((f) => [`${f.name}-${f.size}`, f]));
      incoming.forEach((f) => map.set(`${f.name}-${f.size}`, f));
      return Array.from(map.values());
    });
  };

  const handleFileChange = (e) => {
    addFiles(e.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleDownloadTemplate = async (format) => {
    try {
      await api.downloadImportTemplate(format);
    } catch (err) {
      setError(err.message || `Failed to download ${format.toUpperCase()} template.`);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFiles.length) {
      setError('Please select at least one PDF or CSV file to import.');
      return;
    }

    setUploading(true);
    setError('');
    try {
      const res = await api.importTransactions(selectedFiles);
      setImportResult(res);
      setSelectedFiles([]);
      if (onImported) {
        await onImported(res);
      }
    } catch (err) {
      setError(err.message || 'Failed to import transaction files.');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFiles([]);
    setError('');
    setImportResult(null);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content import-modal-content">
        <div className="import-modal-header">
          <div className="import-modal-title-wrap">
            <div className="import-modal-icon-badge">
              <Upload size={18} />
            </div>
            <div>
              <h3 className="import-modal-title">Import Transactions (PDF &amp; CSV)</h3>
              <p className="import-modal-subtitle">
                Upload single or multiple PDF / CSV files — extracted &amp; categorized in Python
              </p>
            </div>
          </div>
          <button type="button" onClick={handleClose} className="icon-btn" title="Close">
            <X size={20} />
          </button>
        </div>

        <div className="import-template-bar">
          <div className="import-template-info">
            <strong>Supported formats:</strong> Bank statement PDFs or CSV sheets (Date, Type,
            Category, Description, Amount / Credit / Debit)
          </div>
          <div className="import-template-actions">
            <button
              type="button"
              onClick={() => handleDownloadTemplate('pdf')}
              className="btn btn-secondary btn-sm"
            >
              <Download size={14} />
              <span>Sample PDF</span>
            </button>
            <button
              type="button"
              onClick={() => handleDownloadTemplate('csv')}
              className="btn btn-secondary btn-sm"
            >
              <Download size={14} />
              <span>Sample CSV</span>
            </button>
          </div>
        </div>

        {error && <div className="alert-banner error">{error}</div>}

        {importResult && (
          <div className="import-result-box">
            <div className="import-result-header">
              <CheckCircle2 size={16} />
              <span>{importResult.message}</span>
            </div>
            <div className="import-result-metrics">
              <div className="import-result-stat">
                Imported Records
                <strong>
                  {importResult.total_imported ?? importResult.imported_count ?? 0} (
                  {importResult.total_files ?? importResult.files_processed ?? 0} file
                  {(importResult.total_files ?? importResult.files_processed ?? 0) === 1 ? '' : 's'}
                  )
                </strong>
              </div>
              <div className="import-result-stat">
                Skipped Rows
                <strong>{importResult.total_skipped ?? importResult.skipped_count ?? 0}</strong>
              </div>
              <div className="import-result-stat">
                Imported Income
                <strong>
                  ₹
                  {Number(
                    importResult.imported_income ?? importResult.imported_income_total ?? 0
                  ).toLocaleString('en-IN')}
                </strong>
              </div>
              <div className="import-result-stat">
                Imported Expenses
                <strong>
                  ₹
                  {Number(
                    importResult.imported_expenses ?? importResult.imported_expense_total ?? 0
                  ).toLocaleString('en-IN')}
                </strong>
              </div>
            </div>
            {(importResult.files || importResult.file_summaries)?.length > 0 && (
              <div className="import-result-files">
                {(importResult.files || importResult.file_summaries).map((f, idx) => (
                  <div key={`${f.filename}-${idx}`} className="import-result-file-row">
                    <div className="import-result-file-top">
                      <span>
                        {f.filename} ({(f.file_type || 'file').toUpperCase()})
                      </span>
                      <span>
                        {f.imported_count} imported / {f.skipped_count} skipped
                      </span>
                    </div>
                    {f.errors?.length > 0 && (
                      <ul className="import-result-errors">
                        {f.errors.map((errMsg, errIdx) => (
                          <li key={errIdx}>{errMsg}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleUpload}>
          <div
            className={`import-dropzone ${dragging ? 'dragging' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.csv,application/pdf,text/csv,.json"
              multiple
              onChange={handleFileChange}
              className="import-file-input-hidden"
            />
            <Upload size={26} className="import-dropzone-icon" />
            <div className="import-dropzone-title">
              Click to select or drag &amp; drop single or multiple PDF / CSV files
            </div>
            <div className="import-dropzone-hint">
              Supports bank statement PDFs and CSV expense sheets simultaneously
            </div>
            <div className="import-format-badges">
              <span className="import-format-pill pdf">PDF Statements</span>
              <span className="import-format-pill csv">CSV Sheets</span>
            </div>
          </div>

          {selectedFiles.length > 0 && (
            <div className="import-file-list">
              {selectedFiles.map((file, idx) => {
                const isPdf = file.name.toLowerCase().endsWith('.pdf');
                return (
                  <div key={`${file.name}-${idx}`} className="import-file-item">
                    <div className="import-file-item-left">
                      <FileText size={16} className="import-file-icon" />
                      <span className={`import-format-pill ${isPdf ? 'pdf' : 'csv'}`}>
                        {isPdf ? 'PDF' : 'CSV'}
                      </span>
                      <span className="import-file-name">{file.name}</span>
                    </div>
                    <div className="import-file-item-left">
                      <span className="import-file-size">
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(idx)}
                        className="icon-btn delete"
                        title="Remove file"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="import-modal-footer">
            <button type="button" onClick={handleClose} className="btn btn-secondary">
              {importResult ? 'Done' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={uploading || selectedFiles.length === 0}
              className="btn btn-primary"
            >
              {uploading
                ? 'Parsing PDF/CSV in Python...'
                : `Import ${selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ImportTransactionsModal;
