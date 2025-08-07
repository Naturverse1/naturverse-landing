
import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function Editor() {
  const [text, setText] = useState('');

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image'],
      ['clean']
    ],
  };

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent', 'link', 'image'
  ];

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">📝 Story Maker</h2>
      <ReactQuill
        theme="snow"
        value={text}
        onChange={setText}
        modules={modules}
        formats={formats}
        placeholder="Start writing your magical story..."
        className="h-64 mb-12"
      />
      <div className="mt-4">
        <button 
          className="bg-nature-green text-white px-4 py-2 rounded hover:bg-green-600"
          onClick={() => console.log('Saving story:', text)}
        >
          Save Story
        </button>
      </div>
    </div>
  );
}
