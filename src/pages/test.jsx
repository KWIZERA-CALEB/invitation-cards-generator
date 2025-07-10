import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import designJson from './card.json';
import { Button } from '@heroui/react';

const CardCanvas = () => {
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const [selectedObject, setSelectedObject] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);

  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 1600,
      height: 1200,
      backgroundColor: '#f5f5f5',
      preserveObjectStacking: true
    });

    fabricRef.current = canvas;

    canvas.loadFromJSON(designJson, () => {
      canvas.renderAll();
    });

    canvas.on('selection:created', e => setSelectedObject(e.selected[0]));
    canvas.on('selection:updated', e => setSelectedObject(e.selected[0]));
    canvas.on('selection:cleared', () => setSelectedObject(null));

    canvas.on('mouse:dblclick', function (e) {
      const target = e.target;
      if (target && target.type === 'text') {
        target.enterEditing();
        target.hiddenTextarea.focus();
      }
    });

    canvas.on('mouse:down', function(opt) {
      const evt = opt.e;
      if (evt.altKey) {
        setIsPanning(true);
        canvas.setCursor('grab');
        canvas.renderAll();
      }
    });

    canvas.on('mouse:move', function(opt) {
      if (isPanning && opt && opt.e) {
        const delta = new fabric.Point(opt.e.movementX, opt.e.movementY);
        canvas.relativePan(delta);
      }
    });

    canvas.on('mouse:up', function() {
      setIsPanning(false);
      canvas.setCursor('default');
    });

    canvas.on('mouse:wheel', function(opt) {
      let delta = opt.e.deltaY;
      let zoom = canvas.getZoom();
      zoom *= 0.999 ** delta;
      zoom = Math.max(0.1, Math.min(3, zoom));
      canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });

    return () => canvas.dispose();
  }, []);

  const handleColorChange = (e) => {
    if (selectedObject && selectedObject.set) {
      selectedObject.set('fill', e.target.value);
      fabricRef.current.renderAll();
    }
  };

  const handleFontChange = (e) => {
    if (selectedObject && selectedObject.type === 'text') {
      selectedObject.set('fontFamily', e.target.value);
      fabricRef.current.renderAll();
    }
  };

  const handleFontSizeChange = (e) => {
    if (selectedObject && selectedObject.type === 'text') {
      selectedObject.set('fontSize', parseInt(e.target.value));
      fabricRef.current.renderAll();
    }
  };

  const applyGradient = () => {
    if (selectedObject) {
      const gradient = new fabric.Gradient({
        type: 'linear',
        gradientUnits: 'pixels',
        coords: { x1: 0, y1: 0, x2: selectedObject.width, y2: 0 },
        colorStops: [
          { offset: 0, color: 'pink' },
          { offset: 1, color: 'purple' }
        ]
      });
      selectedObject.set('fill', gradient);
      fabricRef.current.renderAll();
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

  const handleExport = () => {
    const json = fabricRef.current.toJSON();
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cardDesign.json';
    a.click();
  };

  return (
    <div>
      <canvas ref={canvasRef} style={{ border: '1px solid #ccc' }} />
      <div style={{ marginTop: 10 }}>
        <input type="color" onChange={handleColorChange} disabled={!selectedObject} />
        <select onChange={handleFontChange} disabled={!(selectedObject && selectedObject.type === 'text')}>
          <option value="Arial">Arial</option>
          <option value="Georgia">Georgia</option>
          <option value="Comic Sans MS">Comic Sans</option>
          <option value="Courier New">Courier</option>
        </select>
        <input type="number" placeholder="Font size" onChange={handleFontSizeChange} disabled={!(selectedObject && selectedObject.type === 'text')} />
        <button onClick={applyGradient} disabled={!selectedObject}>Gradient</button>
        <button onClick={() => applyPattern('https://www.transparenttextures.com/patterns/flowers.png')} disabled={!selectedObject}>Pattern</button>
        <button onClick={bringForward} disabled={!selectedObject}>Bring Forward</button>
        <button onClick={sendBackward} disabled={!selectedObject}>Send Backward</button>
        <button onClick={handleExport}>Export</button>
        <input type="file" ref={fileInputRef} onChange={handleSVGUpload} accept="image/svg+xml" />
        <input type="file" ref={imageInputRef} onChange={handleImageUpload} accept="image/*" />
        <button onClick={() => addEmoji('🎉')}>Add 🎉</button>
        <button onClick={() => addEmoji('💐')}>Add 💐</button>
        <button onClick={() => addEmoji('🎂')}>Add 🎂</button>
        <button onClick={() => addShape('rect')}>Add Rectangle</button>
        <button onClick={() => addShape('circle')}>Add Circle</button>
        <button onClick={() => addShape('triangle')}>Add Triangle</button>
        <p>🔍 Use <b>mouse wheel</b> to zoom. Hold <b>Alt</b> + drag to pan.</p>
        <Button color='primary'>Click</Button>
      </div>
    </div>
  );
};

export default CardCanvas;