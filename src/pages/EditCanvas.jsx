import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@heroui/react'
import { fabric } from 'fabric';
import { jsPDF } from 'jspdf'; 
import designJson from './cardDesign.json'

const EditCanvas = () => {
    const canvasRef = useRef(null);
    const fabricRef = useRef(null)
    const undoStack = useRef([]);
    const redoStack = useRef([]);
    const imageInputRef = useRef(null);
    const [selectedObject, setSelectedObject] = useState(null);

    // const designJson = localStorage.getItem('card-design')

    const handleExport = () => {
        const json = fabricRef.current.toJSON();

        localStorage.setItem('card-design', json)
        // const blob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" });

        // console.log(json)
        // const url = URL.createObjectURL(blob);
        // const a = document.createElement("a");
        // a.href = url;
        // a.download = "cardDesign.json";
        // a.click();
    };


    const handleSVGUpload = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'image/svg+xml') {
          const reader = new FileReader();
          reader.onload = () => {
            fabric.loadSVGFromString(reader.result, (objects, options) => {
              objects.forEach(obj => {
                if (obj.type === 'text') obj.editable = true;
                obj.scale(0.5);
                fabricRef.current.add(obj);
              });
              fabricRef.current.renderAll();
            });
          };
          reader.readAsText(file);
        }
    };

    const applyPattern = (url) => {
        fabric.Image.fromURL(url, (img) => {
          const pattern = new fabric.Pattern({
            source: img.getElement(),
            repeat: 'repeat'
          });
          if (selectedObject) {
            selectedObject.set('fill', pattern);
            fabricRef.current.renderAll();
          }
        });
    };

    


    useEffect(() => {
        const canvas = new fabric.Canvas(canvasRef.current, {
            width: 700,
            height: 600,
        });

        fabricRef.current = canvas;

        const textBox = new fabric.Textbox("You're Invited!", {
            left: 100,
            top: 50,
            fontSize: 30,
            fill: "black",
            fontFamily: "Arial",
            editable: true,
            selectable: true,
        });
        canvas.add(textBox);


        const exportAsPNG = () => {
            const dataURL = canvas.toDataURL({ format: 'png' });
            const link = document.createElement('a');
            link.href = dataURL;
            link.download = 'invitation-card.png';
            link.click();
        };

        const exportAsPDF = () => {
            const dataURL = canvas.toDataURL({ format: 'png' });
            const doc = new jsPDF();
            const img = new Image();
            img.src = dataURL;
        
            img.onload = () => {
              doc.addImage(img, 'PNG', 10, 10, 180, 150);
              doc.save('invitation-card.pdf');
            };
        };

        const saveState = () => {
            const json = fabricRef.current.toJSON();
            const last = undoStack.current[undoStack.current.length - 1];
            if (JSON.stringify(last) !== JSON.stringify(json)) {
                undoStack.current.push(json);
                redoStack.current = [];
            }
        };

        const undo = () => {
            if (undoStack.current.length > 1) {
                const currentState = fabricRef.current.toJSON();
                redoStack.current.push(currentState);
                undoStack.current.pop();
                const prevState = undoStack.current[undoStack.current.length - 1];

                fabricRef.current.loadFromJSON(prevState, () => {
                    fabricRef.current.renderAll();
                });
            }
        };

        const redo = () => {
            if (redoStack.current.length > 0) {
                const nextState = redoStack.current.pop();
                undoStack.current.push(nextState);

                fabricRef.current.loadFromJSON(nextState, () => {
                    fabricRef.current.renderAll();
                });
            }
        };

        canvas.loadFromJSON(designJson, () => {
            canvas.renderAll();
            saveState();

            const json = fabricRef.current.toJSON();
            localStorage.setItem('card-design', JSON.stringify(json));
        });

        canvas.on('selection:created', e => setSelectedObject(e.selected[0]));
        canvas.on('selection:updated', e => setSelectedObject(e.selected[0]));
        canvas.on('selection:cleared', () => setSelectedObject(null));

        canvas.on('object:added', saveState);
        canvas.on('object:modified', saveState);
        canvas.on('object:removed', saveState);

        canvas.on('mouse:dblclick', () => {
            const activeObject = canvas.getActiveObject();
            if (activeObject && activeObject.type === 'textbox') {
                activeObject.enterEditing();
                activeObject.selectAll();
                canvas.renderAll();
            }
        });

        const handleKeyDown = (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
                event.preventDefault();
                undo();
            } else if (
                (event.ctrlKey || event.metaKey) &&
                (event.key === 'y' || (event.shiftKey && event.key === 'z'))
            ) {
                event.preventDefault();
                redo();
            } else if (event.key === 'Delete' || event.key === 'Backspace') {
                const activeObject = canvas.getActiveObject();
                if (activeObject) {
                    canvas.remove(activeObject);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            canvas.dispose();
        };
    }, []);

    const handleColorChange = (e) => {
        if (selectedObject && selectedObject.set) {
        selectedObject.set('fill', e.target.value);
        fabricRef.current.renderAll();
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


    const addShape = (type) => {
        let shape;
        switch (type) {
          case 'rect':
            shape = new fabric.Rect({ width: 100, height: 60, fill: 'lightblue', left: 100, top: 100 });
            break;
          case 'circle':
            shape = new fabric.Circle({ radius: 50, fill: 'lightgreen', left: 200, top: 200 });
            break;
          case 'triangle':
            shape = new fabric.Triangle({ width: 100, height: 100, fill: 'orange', left: 300, top: 100 });
            break;
          default:
            return;
        }
        fabricRef.current.add(shape);
        fabricRef.current.renderAll();
    };


    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = () => {
          fabric.Image.fromURL(reader.result, (img) => {
            img.set({ left: 100, top: 100, scaleX: 0.5, scaleY: 0.5 });
            fabricRef.current.add(img);
            fabricRef.current.renderAll();
          });
        };
        reader.readAsDataURL(file);
    };


    const addEmoji = (emoji) => {
        const text = new fabric.IText(emoji, {
          left: 150,
          top: 150,
          fontSize: 40,
        });
        fabricRef.current.add(text);
        fabricRef.current.renderAll();
    };


    const bringForward = () => {
        if (selectedObject) {
            fabricRef.current.bringForward(selectedObject);
            fabricRef.current.renderAll();
        }
    };

    const sendBackward = () => {
        if (selectedObject) {
            fabricRef.current.sendBackwards(selectedObject);
            fabricRef.current.renderAll();
        }
    };

    
    return (
        <div className='w-full h-screen flex flex-col'>
            {/* navbar */}
            <div className='w-full h-[80px] flex items-center justify-between bg-[#f4f7fa] pr-[20px] pl-[20px]'>

                <div>
                    <div className='flex flex-row items-center space-x-[5px]'>
                        <p className='uppercase'><strong>Happy Birthday card</strong></p>
                        <div>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={16} height={16} fill="#000">
                                <path d="M5 18.89H6.41421L15.7279 9.57627L14.3137 8.16206L5 17.4758V18.89ZM21 20.89H3V16.6473L16.435 3.21231C16.8256 2.82179 17.4587 2.82179 17.8492 3.21231L20.6777 6.04074C21.0682 6.43126 21.0682 7.06443 20.6777 7.45495L9.24264 18.89H21V20.89ZM15.7279 6.74785L17.1421 8.16206L18.5563 6.74785L17.1421 5.33363L15.7279 6.74785Z"></path>
                            </svg>
                        </div>
                    </div>
                    <div>
                        <p className='text-[14px]'>Edited 2 minutes ago • <strong className='text-[#0570ee] cursor-pointer'>Save</strong></p>
                    </div>
                </div>
                <div className='flex flex-row items-center space-x-[5px]'>
                    <div className='cursor-pointer'>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={25} height={25} fill="#000">
                            <path d="M22 12C22 17.5228 17.5229 22 12 22C6.4772 22 2 17.5228 2 12C2 6.47715 6.4772 2 12 2V4C7.5817 4 4 7.58172 4 12C4 16.4183 7.5817 20 12 20C16.4183 20 20 16.4183 20 12C20 9.25022 18.6127 6.82447 16.4998 5.38451L16.5 8H14.5V2L20.5 2V4L18.0008 3.99989C20.4293 5.82434 22 8.72873 22 12Z"></path>
                        </svg>
                    </div>
                    <div className='cursor-pointer'>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={25} height={25} fill="#000">
                            <path d="M2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2V4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 9.25022 5.38734 6.82447 7.50024 5.38451L7.5 8H9.5V2L3.5 2V4L5.99918 3.99989C3.57075 5.82434 2 8.72873 2 12Z"></path>
                        </svg>
                    </div>
                    <div>
                        <Button size='md' className='text-[14px]' onClick={handleExport}>Exit</Button>
                    </div>
                    <div>
                        <Button size='md' color='primary' className='text-[14px]'>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={16} height={16} fill="#fff">
                                <path d="M13.1202 17.0228L8.92129 14.7324C8.19135 15.5125 7.15261 16 6 16C3.79086 16 2 14.2091 2 12C2 9.79086 3.79086 8 6 8C7.15255 8 8.19125 8.48746 8.92118 9.26746L13.1202 6.97713C13.0417 6.66441 13 6.33707 13 6C13 3.79086 14.7909 2 17 2C19.2091 2 21 3.79086 21 6C21 8.20914 19.2091 10 17 10C15.8474 10 14.8087 9.51251 14.0787 8.73246L9.87977 11.0228C9.9583 11.3355 10 11.6629 10 12C10 12.3371 9.95831 12.6644 9.87981 12.9771L14.0788 15.2675C14.8087 14.4875 15.8474 14 17 14C19.2091 14 21 15.7909 21 18C21 20.2091 19.2091 22 17 22C14.7909 22 13 20.2091 13 18C13 17.6629 13.0417 17.3355 13.1202 17.0228ZM6 14C7.10457 14 8 13.1046 8 12C8 10.8954 7.10457 10 6 10C4.89543 10 4 10.8954 4 12C4 13.1046 4.89543 14 6 14ZM17 8C18.1046 8 19 7.10457 19 6C19 4.89543 18.1046 4 17 4C15.8954 4 15 4.89543 15 6C15 7.10457 15.8954 8 17 8ZM17 20C18.1046 20 19 19.1046 19 18C19 16.8954 18.1046 16 17 16C15.8954 16 15 16.8954 15 18C15 19.1046 15.8954 20 17 20Z"></path>
                            </svg>
                            Share
                        </Button>
                    </div>
                </div>

            </div>
            {/* navbar */}

            {/* editing area */}
            <div className="flex flex-1 overflow-hidden">
                {/* materials */}
                <div className="w-[250px] bg-white border-r p-2 overflow-y-auto max-h-full">
                    <div className='pb-[5px] pt-[5px] h-[30px] border-b-[1px] border-solid border-gray-300 w-full'>
                        <p className="text-[15px] font-semibold mb-4">Elements</p>
                    </div>

                    <div className='mt-[15px] flex flex-row items-center space-x-[6px]'>

                        <div className='cursor-pointer' onClick={() => addShape('rect')}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={25} height={25} fill="#000">
                                <path d="M3 4H21C21.5523 4 22 4.44772 22 5V19C22 19.5523 21.5523 20 21 20H3C2.44772 20 2 19.5523 2 19V5C2 4.44772 2.44772 4 3 4ZM4 6V18H20V6H4Z"></path>
                            </svg>
                        </div>
                        <div className='cursor-pointer' onClick={() => addShape('circle')}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={25} height={25} fill="#000">
                                <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20Z"></path>
                            </svg>
                        </div>
                        <div className='cursor-pointer'>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={25} height={25} fill="#000">
                                <path d="M12.0006 18.26L4.94715 22.2082L6.52248 14.2799L0.587891 8.7918L8.61493 7.84006L12.0006 0.5L15.3862 7.84006L23.4132 8.7918L17.4787 14.2799L19.054 22.2082L12.0006 18.26ZM12.0006 15.968L16.2473 18.3451L15.2988 13.5717L18.8719 10.2674L14.039 9.69434L12.0006 5.27502L9.96214 9.69434L5.12921 10.2674L8.70231 13.5717L7.75383 18.3451L12.0006 15.968Z"></path>
                            </svg>
                        </div>
                        <div className='cursor-pointer'>
                            <label htmlFor="imageUpload">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={25} height={25} fill="#000">
                                    <path d="M21 15V18H24V20H21V23H19V20H16V18H19V15H21ZM21.0082 3C21.556 3 22 3.44495 22 3.9934V13H20V5H4V18.999L14 9L17 12V14.829L14 11.8284L6.827 19H14V21H2.9918C2.44405 21 2 20.5551 2 20.0066V3.9934C2 3.44476 2.45531 3 2.9918 3H21.0082ZM8 7C9.10457 7 10 7.89543 10 9C10 10.1046 9.10457 11 8 11C6.89543 11 6 10.1046 6 9C6 7.89543 6.89543 7 8 7Z"></path>
                                </svg>
                            </label>
                            <input type="file" className='hidden' id='imageUpload' ref={imageInputRef} onChange={handleImageUpload} accept="image/*" />
                        </div>

                    </div>

                    <div className='mt-[15px] flex flex-row items-center space-x-[6px]'>
                        <div onClick={() => addEmoji('😂')} className='w-[40px] cursor-pointer h-[40px] p-[6px] rounded-full bg-[#f4f7fa]'>
                            😂
                        </div>
                    </div>

                </div>

                {/* canvas */}
                <div className="flex-1 bg-gray-100 flex items-center justify-center relative overflow-hidden">
                    <div className="bg-white shadow-md p-4">
                        <canvas ref={canvasRef} />
                    </div>
                </div>

                {/* properties */}
                <div className="w-[280px] bg-white border-l p-4 overflow-y-auto max-h-full">
                    <p className="text-[15px] font-semibold mb-4">Properties</p>
                    <input type="color" onChange={handleColorChange} disabled={!selectedObject} />
                </div>
            </div>
        </div>
    )
}

export default EditCanvas