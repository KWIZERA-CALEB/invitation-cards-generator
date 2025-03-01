// import React, { useEffect, useRef, useState } from 'react';
// import './App.css';
// import { fabric } from 'fabric';
// import { jsPDF } from 'jspdf';  // Import jsPDF for PDF export

// function App() {
//   const canvasRef = useRef(null);
//   const fileInputRef = useRef(null); // Ref for file input
//   const [canvas, setCanvas] = useState(null); // Store fabric canvas instance

//   useEffect(() => {
//     const newCanvas = new fabric.Canvas(canvasRef.current, {
//       width: 500,
//       height: 300,
//       backgroundColor: "#f5f5f5",
//     });

//     // Add initial text
//     const text = new fabric.Text("You're Invited!", {
//       left: 100,
//       top: 50,
//       fontSize: 30,
//       fill: "black",
//       fontFamily: "Arial",
//     });
//     newCanvas.add(text);

//     setCanvas(newCanvas); // Save canvas instance

//     // Listen for Delete key press to delete selected object
//     const handleKeyDown = (event) => {
//       if (event.key === 'Delete' || event.key === 'Backspace') {
//         const activeObject = newCanvas.getActiveObject();
//         if (activeObject) {
//           newCanvas.remove(activeObject); // Remove selected object
//         }
//       }
//     };

//     // Add event listener for Delete key
//     window.addEventListener('keydown', handleKeyDown);

//     // Clean up when component unmounts
//     return () => {
//       window.removeEventListener('keydown', handleKeyDown); // Remove event listener on cleanup
//       newCanvas.dispose();
//     };
//   }, []);

//   // Handle the image file input change (from the user selecting a file)
//   const handleImageUpload = (e) => {
//     const file = e.target.files[0];
//     if (file && canvas) {
//       const reader = new FileReader();

//       reader.onload = () => {
//         const imgElement = new Image();
//         imgElement.src = reader.result;

//         imgElement.onload = () => {
//           const imgInstance = new fabric.Image(imgElement, {
//             left: 100,
//             top: 50,
//             angle: 0,
//             selectable: true, // Allow selecting and resizing
//             hasControls: true, // Show resizing controls
//           });

//           // Add image to canvas
//           canvas.add(imgInstance);
//           canvas.renderAll();
//         };
//       };

//       reader.readAsDataURL(file);
//     }
//   };

//   // Handle button click to open the file input
//   const handleAddImageClick = () => {
//     fileInputRef.current.click(); // Trigger file input click
//   };

//   // Export canvas as PNG
//   const exportAsPNG = () => {
//     const dataURL = canvas.toDataURL({ format: 'png' }); // Get the data URL of the canvas in PNG format
//     const link = document.createElement('a');
//     link.href = dataURL;
//     link.download = 'invitation-card.png'; // Set the download file name
//     link.click(); // Trigger the download
//   };

//   // Export canvas as PDF
//   const exportAsPDF = () => {
//     const dataURL = canvas.toDataURL({ format: 'png' }); // Convert canvas to PNG
//     const doc = new jsPDF();
//     const img = new Image();
//     img.src = dataURL;

//     img.onload = () => {
//       doc.addImage(img, 'PNG', 10, 10, 180, 150); // Add image to PDF at (10, 10) with width and height
//       doc.save('invitation-card.pdf'); // Save the PDF
//     };
//   };

//   return (
//     <>
//       <div>
//         <h1>Fabric.js Canvas</h1>
//       </div>
//       <hr />
//       <div className="App">
//         {/* Canvas */}
//         <canvas ref={canvasRef} width="500" height="300" className="border" />

//         {/* Button to upload image */}
//         <button onClick={handleAddImageClick} style={buttonStyle}>Add Image</button>

//         {/* Hidden file input */}
//         <input
//           ref={fileInputRef}
//           type="file"
//           accept="image/*"
//           onChange={handleImageUpload}
//           style={{ display: 'none' }}
//         />

//         {/* Export buttons */}
//         <div>
//           <button onClick={exportAsPNG} style={buttonStyle}>Download as PNG</button>
//           <button onClick={exportAsPDF} style={buttonStyle}>Download as PDF</button>
//         </div>
//       </div>
//     </>
//   );
// }

// const buttonStyle = {
//   padding: '10px 20px',
//   backgroundColor: '#4CAF50',
//   color: 'white',
//   border: 'none',
//   cursor: 'pointer',
//   marginTop: '20px',
//   marginRight: '10px',
// };

// export default App;
import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { jsPDF } from 'jspdf';
import {Button, ButtonGroup} from "@heroui/react";

function App() {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null); // Ref for file input
  const [canvas, setCanvas] = useState(null); // Store fabric canvas instance
  const [fontSize, setFontSize] = useState(30); // Manage font size state

  useEffect(() => {
    const newCanvas = new fabric.Canvas(canvasRef.current, {
      width: 500,
      height: 300,
      backgroundColor: "#f5f5f5",
    });

    // Add initial text (editable)
    const textBox = new fabric.Textbox("You're Invited!", {
      left: 100,
      top: 50,
      fontSize: 30,
      fill: "black",  // Initial color
      fontFamily: "Arial",
      editable: true, // Enable editing
      selectable: true, // Allow selecting the text
    });
    newCanvas.add(textBox);

    // Double-click event to start editing text
    newCanvas.on('mouse:dblclick', (e) => {
      const activeObject = newCanvas.getActiveObject();
      if (activeObject && activeObject.type === 'textbox') {
        activeObject.enterEditing(); // Enter editing mode
        activeObject.selectAll(); // Select all text
        newCanvas.renderAll(); // Re-render canvas
      }
    });

    setCanvas(newCanvas); // Save canvas instance

    // Clean up when component unmounts
    return () => {
      newCanvas.dispose();
    };
  }, []);

  // Handle the image file input change (from the user selecting a file)
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && canvas) {
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
    }
  };

  // Handle button click to open the file input
  const handleAddImageClick = () => {
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

  // Add a new text to the canvas
  const addText = () => {
    const textBox = new fabric.Textbox('New Text', {
      left: 100,
      top: 100,
      fontSize: 30,
      fill: 'black',
      fontFamily: 'Arial',
      editable: true,
      selectable: true,
    });
    canvas.add(textBox);
    canvas.renderAll();
  };

  // Handle color change
  const handleColorChange = (e) => {
    const selectedObject = canvas.getActiveObject();

    // If there is an active object and it's a Textbox, change its color
    if (selectedObject && selectedObject.type === 'textbox') {
      selectedObject.set({ fill: e.target.value });  // Update text color
      canvas.renderAll();  // Re-render canvas to apply changes
    }
  };

  // Bold the selected text
  const toggleBold = () => {
    const selectedObject = canvas.getActiveObject();
    if (selectedObject && selectedObject.type === 'textbox') {
      const isBold = selectedObject.fontWeight === 'bold';
      selectedObject.set({ fontWeight: isBold ? 'normal' : 'bold' });
      canvas.renderAll(); // Re-render canvas to apply changes
    }
  };

  // Change font size
  const changeFontSize = (e) => {
    const selectedObject = canvas.getActiveObject();
    if (selectedObject && selectedObject.type === 'textbox') {
      selectedObject.set({ fontSize: e.target.value });
      setFontSize(e.target.value); // Update font size state
      canvas.renderAll(); // Re-render canvas to apply changes
    }
  };

  // Set text alignment
  const changeTextAlign = (e) => {
    const selectedObject = canvas.getActiveObject();
    if (selectedObject && selectedObject.type === 'textbox') {
      selectedObject.set({ textAlign: e.target.value });
      canvas.renderAll(); // Re-render canvas to apply changes
    }
  };

  // Adjust letter spacing
  const changeLetterSpacing = (e) => {
    const selectedObject = canvas.getActiveObject();
    if (selectedObject && selectedObject.type === 'textbox') {
      selectedObject.set({ charSpacing: e.target.value });
      canvas.renderAll(); // Re-render canvas to apply changes
    }
  };

  // Toggle uppercase
  const toggleUppercase = () => {
    const selectedObject = canvas.getActiveObject();
    if (selectedObject && selectedObject.type === 'textbox') {
      const currentText = selectedObject.text;
      selectedObject.set({ text: currentText.toUpperCase() });
      canvas.renderAll(); // Re-render canvas to apply changes
    }
  };

  const bringToFront = () => {
    const selectedObject = canvas.getActiveObject();
    if (selectedObject) {
      canvas.bringToFront(selectedObject);
      canvas.renderAll();
    }
  };
  
  // Send selected element to back
  const sendToBack = () => {
    const selectedObject = canvas.getActiveObject();
    if (selectedObject) {
      canvas.sendToBack(selectedObject);
      canvas.renderAll();
    }
  };
  
  // Bring selected element forward (one step)
  const bringForward = () => {
    const selectedObject = canvas.getActiveObject();
    if (selectedObject) {
      canvas.bringForward(selectedObject);
      canvas.renderAll();
    }
  };
  
  // Send selected element backward (one step)
  const sendBackward = () => {
    const selectedObject = canvas.getActiveObject();
    if (selectedObject) {
      canvas.sendBackwards(selectedObject);
      canvas.renderAll();
    }
  };
  

  // Duplicate the selected element
  const duplicateElement = () => {
    const selectedObject = canvas.getActiveObject();
    if (selectedObject) {
      selectedObject.clone((clonedObject) => {
        clonedObject.set({
          left: selectedObject.left + 20,
          top: selectedObject.top + 20,
        });
        canvas.add(clonedObject);
        canvas.renderAll();
      });
    }
  };

  // Change the font family for the selected text
  const handleFontChange = (e) => {
    const selectedObject = canvas.getActiveObject();
    if (selectedObject && selectedObject.type === 'textbox') {
      selectedObject.set({ fontFamily: e.target.value });
      canvas.renderAll();  // Re-render canvas to apply changes
    }
  };

  const saveCanvasState = () => {
    if (canvas) {
      const canvasData = JSON.stringify(canvas.toJSON(['src'])); // Store object properties including 'src'
      localStorage.setItem('canvasData', canvasData); // Save to localStorage
      alert("Canvas state saved!");
    }
  };
  

  const loadCanvasState = () => {
    const storedData = localStorage.getItem('canvasData');
    if (storedData && canvas) {
      canvas.loadFromJSON(storedData, () => {
        canvas.getObjects().forEach((obj) => {
          if (obj.type === 'image' && obj.src) {
            fabric.Image.fromURL(obj.src, (img) => {
              img.set(obj); // Apply saved properties
              canvas.add(img); // Add to canvas
              canvas.renderAll();
            });
          }
        });
      });
    }
  };
  
  

  return (
    <>
      <div>
        <h1>Fabric.js Canvas</h1>
      </div>
      <hr />
      <div className="App bg-slate-500">
      <Button onClick={saveCanvasState} color="primary" >Save Canvas</Button>
      <button onClick={loadCanvasState} style={buttonStyle}>Load Canvas</button>  

        {/* Canvas */}
        <canvas ref={canvasRef} width="500" height="300" className="border" />

        {/* Button to upload image */}
        <button onClick={handleAddImageClick} style={buttonStyle}>Add Image</button>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />

        {/* Button to add new text */}
        <button onClick={addText} style={buttonStyle}>Add New Text</button>

        {/* Color Picker to change text color */}
        <label htmlFor="colorPicker">Text Color: </label>
        <input
          type="color"
          id="colorPicker"
          name="color"
          onChange={handleColorChange}
          style={inputStyle}
        />

        {/* Font Size */}
        <label htmlFor="fontSize">Font Size: </label>
        <input
          type="number"
          id="fontSize"
          value={fontSize}
          min="10"
          max="100"
          onChange={changeFontSize}
          style={inputStyle}
        />

        {/* Font Family Dropdown */}
        <label htmlFor="fontFamily">Font Family: </label>
        <select id="fontFamily" onChange={handleFontChange} style={inputStyle}>
          <option value="Arial">Arial</option>
          <option value="Verdana">Verdana</option>
          <option value="Georgia">Georgia</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Courier New">Courier New</option>
        </select>

        {/* Text Alignment */}
        <label htmlFor="textAlign">Text Align: </label>
        <select id="textAlign" onChange={changeTextAlign} style={inputStyle}>
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>

        {/* Letter Spacing */}
        <label htmlFor="letterSpacing">Letter Spacing: </label>
        <input
          type="number"
          id="letterSpacing"
          onChange={changeLetterSpacing}
          style={inputStyle}
        />

        {/* Uppercase Toggle */}
        <button onClick={toggleUppercase} style={buttonStyle}>Uppercase</button>

        {/* Duplicate Button */}
        <button onClick={duplicateElement} style={buttonStyle}>Duplicate</button>

        {/* Bold Button */}
        <button onClick={toggleBold} style={buttonStyle}>Bold</button>

        {/* Export buttons */}
        <div>
          <button onClick={exportAsPNG} style={buttonStyle}>Download as PNG</button>
          <button onClick={exportAsPDF} style={buttonStyle}>Download as PDF</button>
        </div>

        <button onClick={bringToFront} style={buttonStyle}>Bring to Front</button>
        <button onClick={sendToBack} style={buttonStyle}>Send to Back</button>
        <button onClick={bringForward} style={buttonStyle}>Bring Forward</button>
        <button onClick={sendBackward} style={buttonStyle}>Send Backward</button>
      </div>
    </>
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

const inputStyle = {
  marginTop: '20px',
  padding: '5px',
  width: '120px',
};

export default App;










