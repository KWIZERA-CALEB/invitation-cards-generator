import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import { fabric } from 'fabric';
import { jsPDF } from 'jspdf';
import * as pdfjsLib from 'pdfjs-dist'; // Import pdf.js for handling PDFs

function ImportCard() {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null); // Ref for file input

  const [canvas, setCanvas] = useState(null); // Store fabric canvas instance

  useEffect(() => {
    const newCanvas = new fabric.Canvas(canvasRef.current, {
      width: 500,
      height: 300,
      backgroundColor: "#f5f5f5",
    });

    // Add initial text
    const text = new fabric.Text("You're Invited!", {
      left: 100,
      top: 50,
      fontSize: 30,
      fill: "black",
      fontFamily: "Arial",
    });
    newCanvas.add(text);

    setCanvas(newCanvas); // Save canvas instance

    // Clean up when component unmounts
    return () => {
      newCanvas.dispose();
    };
  }, []);

  // Handle the image file input change (from the user selecting a file)
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && canvas) {
      const fileType = file.type;

      if (fileType === "image/png" || fileType === "image/jpeg") {
        // Load PNG/JPEG image
        const reader = new FileReader();

        reader.onload = () => {
          const imgElement = new Image();
          imgElement.src = reader.result;

          imgElement.onload = () => {
            const imgInstance = new fabric.Image(imgElement, {
              left: 100,
              top: 50,
              angle: 0,
              selectable: true, // Allow selecting and resizing
              hasControls: true, // Show resizing controls
            });

            // Add image to canvas
            canvas.add(imgInstance);
            canvas.renderAll();
          };
        };

        reader.readAsDataURL(file);
      } else if (fileType === "application/pdf") {
        // Load PDF file
        const fileReader = new FileReader();
        fileReader.onload = function (e) {
          const typedArray = new Uint8Array(e.target.result);
          pdfjsLib.getDocument(typedArray).promise.then((pdf) => {
            // Render the first page of the PDF
            pdf.getPage(1).then((page) => {
              const scale = 1.5; // Adjust the scale for rendering the PDF
              const viewport = page.getViewport({ scale });

              // Prepare a canvas for rendering PDF page
              const pdfCanvas = document.createElement('canvas');
              const pdfContext = pdfCanvas.getContext('2d');
              pdfCanvas.height = viewport.height;
              pdfCanvas.width = viewport.width;

              page.render({
                canvasContext: pdfContext,
                viewport: viewport,
              }).promise.then(() => {
                const imgInstance = new fabric.Image(pdfCanvas, {
                  left: 0,
                  top: 0,
                  angle: 0,
                  selectable: true, // Allow selecting and resizing
                  hasControls: true, // Show resizing controls
                });

                // Add the rendered PDF image to the canvas
                canvas.add(imgInstance);
                canvas.renderAll();
              });
            });
          });
        };

        fileReader.readAsArrayBuffer(file);
      }
    }
  };

  // Handle button click to open the file input
  const handleAddFileClick = () => {
    fileInputRef.current.click(); // Trigger file input click
  };

  // Export canvas as PNG
  const exportAsPNG = () => {
    const dataURL = canvas.toDataURL({ format: 'png' }); // Get the data URL of the canvas in PNG format
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'invitation-card.png'; // Set the download file name
    link.click(); // Trigger the download
  };

  // Export canvas as PDF
  const exportAsPDF = () => {
    const dataURL = canvas.toDataURL({ format: 'png' }); // Convert canvas to PNG
    const doc = new jsPDF();
    const img = new Image();
    img.src = dataURL;

    img.onload = () => {
      doc.addImage(img, 'PNG', 10, 10, 180, 150); // Add image to PDF at (10, 10) with width and height
      doc.save('invitation-card.pdf'); // Save the PDF
    };
  };

  return (
    <div className="App">
      {/* Canvas */}
      <canvas ref={canvasRef} width="500" height="300" className="border" />

      {/* Button to upload image or PDF */}
      <button onClick={handleAddFileClick} style={buttonStyle}>Import File (PNG/PDF)</button>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, application/pdf"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />

      {/* Export buttons */}
      <div>
        <button onClick={exportAsPNG} style={buttonStyle}>Download as PNG</button>
        <button onClick={exportAsPDF} style={buttonStyle}>Download as PDF</button>
      </div>
    </div>
  );
}

const buttonStyle = {
  padding: '10px 20px',
  backgroundColor: '#4CAF50',
  color: 'white',
  border: 'none',
  cursor: 'pointer',
  marginTop: '20px',
  marginRight: '10px',
};

export default ImportCard;
