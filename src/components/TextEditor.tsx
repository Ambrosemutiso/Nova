'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import { Bold, Italic, Heading1, Heading2, Image as ImageIcon, Link as LinkIcon } from 'lucide-react'
import React from 'react'

export default function TiptapEditor({ content, onChange }: { content: string, onChange: (value: string) => void }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Image,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  if (!editor) return null

  const addImage = () => {
    const url = window.prompt('Enter image URL')
    if (url) editor.chain().focus().setImage({ src: url }).run()
  }

  const setLink = () => {
    const url = window.prompt('Enter URL')
    if (url) editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      {/* Toolbar */}
      <div className="flex gap-3 mb-4 border-b pb-2">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'text-blue-600' : 'text-gray-700'}
        >
          <Bold size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'text-blue-600' : 'text-gray-700'}
        >
          <Italic size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? 'text-blue-600' : 'text-gray-700'}
        >
          <Heading1 size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'text-blue-600' : 'text-gray-700'}
        >
          <Heading2 size={18} />
        </button>
        <button onClick={setLink} className="text-gray-700 hover:text-blue-600">
          <LinkIcon size={18} />
        </button>
        <button onClick={addImage} className="text-gray-700 hover:text-blue-600">
          <ImageIcon size={18} />
        </button>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} className="prose max-w-none" />
    </div>
  )
}
