// A pop-up window that shows the PDF before downloading it.
//
// Props:
//   url      - temporary link to the PDF (from makeTimetablePdf)
//   fileName - name used when downloading
//   onClose  - called when the user closes the window
import { useEffect } from "react";

export default function PdfPreview({ url, fileName, onClose }) {
  // Close with the Esc key.
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Some phone browsers cannot show a PDF inside a page.
  const canShowPdf = navigator.pdfViewerEnabled !== false;

  return (
    <div className="modal-backdrop no-print" onClick={onClose}>
      {/* stopPropagation: clicking inside the window should not close it */}
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="PDF preview">
        <div className="modal-header">
          <div className="modal-title">
            <h2>PDF Preview</h2>
            <span className="muted">{fileName}</span>
          </div>
          <a className="btn" href={url} download={fileName}>
            ⬇ Download
          </a>
          <button className="btn btn-light" onClick={onClose}>
            Close
          </button>
        </div>

        {canShowPdf ? (
          <iframe className="pdf-frame" src={url} title="PDF preview" />
        ) : (
          <div className="pdf-fallback">
            <p>This browser cannot show the PDF here.</p>
            <a className="btn btn-light" href={url} target="_blank" rel="noreferrer">
              Open PDF in a new tab
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
