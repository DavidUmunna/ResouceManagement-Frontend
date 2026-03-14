import React, { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import trimCanvas from "trim-canvas";

import {toast} from "react-toastify"
export default function SignatureModal({ isOpen, onClose, onSave }) {
  const sigCanvas = useRef({});
  const [trimmedDataURL, setTrimmedDataURL] = useState(null);

  if (!isOpen) return null;

  const clear = () => sigCanvas.current.clear();

  const save = () => {
    if (sigCanvas.current.isEmpty()) {
      toast.error("please enter your Signature")
      return;
    }
     const canvas = sigCanvas.current.getCanvas();

    // Trim the white space using trim-canvas
    const trimmedCanvas = trimCanvas(canvas);

    // Convert to image data
    const dataURL = trimmedCanvas.toDataURL("image/png");

    setTrimmedDataURL(dataURL);
    onSave(dataURL) // Pass signature data to parent (for DB saving)
    onClose();
  };

  return (
    <div 
    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-40">
      <div 
      onClick={(e)=>e.preventDefault()}
      className="bg-white p-6 rounded-xl w-[400px] shadow-xl">
        <h2 className="text-lg font-semibold mb-4">Draw Your Signature</h2>
        
        <SignatureCanvas
          ref={sigCanvas}
          penColor="black"
          canvasProps={{
            width: 350,
            height: 150,
            className: "border border-gray-400 rounded-md"
          }}
        />

        <div className="flex justify-between mt-4">
          <button 
            onClick={clear} 
            className="px-3 py-1 bg-gray-300 rounded-lg hover:bg-gray-400"
          >
            Clear
          </button>
          <div>
            <button 
              onClick={onClose} 
              className="px-3 py-1 mr-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Cancel
            </button>
            <button 
              onClick={save} 
              className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Save
            </button>
          </div>
        </div>

        {trimmedDataURL && (
          <div className="mt-4">
            <p className="text-sm font-medium">Preview:</p>
            <img src={trimmedDataURL} alt="signature preview" className="border rounded-md mt-2" />
          </div>
        )}
      </div>
    </div>
  );
}
