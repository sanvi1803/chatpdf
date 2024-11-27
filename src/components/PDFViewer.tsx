import React from "react";

type Props = {
  pdfUrl: string;
};

const PDFViewer = ({ pdfUrl }: Props) => {
  return (
    <iframe
      src={`https://docs.google.com/viewer?url=${pdfUrl}&embedded=true`}
      className="w-full h-full"
    ></iframe>
  );
};

export default PDFViewer;
