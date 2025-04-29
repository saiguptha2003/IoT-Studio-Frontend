import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import yaml from 'js-yaml';

export default function IDEPage() {
  const [code, setCode] = useState('');
  const [output, setOutput] = useState(null);

  const handleEditorChange = (value) => {
    setCode(value || '');
  };

  const handleRunClick = () => {
    try {
      yaml.load(code); // Try parsing YAML
      setOutput({ type: 'success', message: '✅ YAML is valid!' });
    } catch (e) {
      // Extract line & column from error, if available
      const errorMessage = e.mark
        ? `❌ Syntax error at line ${e.mark.line + 1}, column ${e.mark.column + 1}: ${e.message}`
        : `❌ YAML Error: ${e.message}`;
      setOutput({ type: 'error', message: errorMessage });
    }
  };

  const handleUploadClick = () => {
    if (!code.trim()) {
      alert("Editor is empty. Nothing to download.");
      return;
    }
  
    const blob = new Blob([code], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
  
    const link = document.createElement('a');
    link.href = url;
    link.download = 'script.yaml';
    document.body.appendChild(link);
    link.click();
  
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  

  return (
    <div className="h-screen flex flex-col bg-gray-100 font-sans">
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden p-4 gap-4">
        {/* Left Panel: Editor */}
        <div className="flex-1 bg-gray-900 rounded-lg shadow-md overflow-hidden flex flex-col">
          <Editor
            height="100%"
            defaultLanguage="yaml"
            theme="vs-dark"
            value={code}
            onChange={handleEditorChange}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              automaticLayout: true,
              padding: { top: 10 },
            }}
          />
        </div>

        {/* Right Panel: Output */}
        <div className="flex-1 bg-white rounded-lg shadow-md p-6 overflow-auto">
          <h2 className="text-lg font-semibold mb-4">Output</h2>
          {output ? (
            <div
              className={`p-4 rounded-md text-sm whitespace-pre-wrap ${
                output.type === 'success'
                  ? 'bg-green-50 text-green-700 border border-green-300'
                  : 'bg-red-50 text-red-700 border border-red-300'
              }`}
            >
              {output.message}
            </div>
          ) : (
            <p className="text-gray-500">Click "Validate" to check YAML syntax.</p>
          )}
        </div>
      </div>

      {/* Bottom Buttons */}
      <div className="bg-white border-t border-gray-200 p-4 flex justify-center gap-4">
        <button
          onClick={handleRunClick}
          className="px-6 py-2 rounded-md bg-black text-white font-semibold hover:bg-blue-700 transition"
        >
          Validate
        </button>
        <button
          onClick={handleUploadClick}
          className="px-6 py-2 rounded-md bg-black text-white font-semibold hover:bg-red-600 transition"
        >
          Upload
        </button>
      </div>
    </div>
  );
}
