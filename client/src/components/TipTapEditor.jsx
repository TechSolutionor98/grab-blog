"use client"

import { useCallback } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  LinkIcon,
  ImageIcon,
  Type,
} from "lucide-react"


const TipTapEditor = ({ content, onChange, placeholder = "Start writing your blog..." }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: "editor-image",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "editor-link",
        },
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px]",
      },
    },
  })

  const addImage = useCallback(() => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = async (e) => {
      const file = e.target.files[0]
      if (file) {
        try {
          const formData = new FormData()
          formData.append("image", file)

          const token = localStorage.getItem("adminToken")
          const response = await fetch("/api/upload/image", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          })

          if (response.ok) {
            const data = await response.json()
            editor.chain().focus().setImage({ src: data.url }).run()
          } else {
            alert("Failed to upload image")
          }
        } catch (error) {
          console.error("Error uploading image:", error)
          alert("Failed to upload image")
        }
      }
    }
    input.click()
  }, [editor])

  const addLink = useCallback(() => {
    const previousUrl = editor.getAttributes("link").href
    const url = window.prompt("URL", previousUrl)

    if (url === null) {
      return
    }

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }, [editor])

  if (!editor) {
    return null
  }

  const ToolbarButton = ({ onClick, isActive, disabled, children, title }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`p-2 rounded-lg transition-colors ${
        isActive
          ? "bg-blue-600 text-white"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      title={title}
    >
      {children}
    </button>
  )

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      <div className="border-b border-gray-200 bg-gray-50 p-3">
        <div className="flex flex-wrap items-center gap-1">
          {/* Text Formatting */}
          <div className="flex items-center gap-1 border-r border-gray-300 pr-3">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive("bold")}
              title="Bold"
            >
              <Bold size={16} />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive("italic")}
              title="Italic"
            >
              <Italic size={16} />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              isActive={editor.isActive("strike")}
              title="Strikethrough"
            >
              <Strikethrough size={16} />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCode().run()}
              isActive={editor.isActive("code")}
              title="Code"
            >
              <Code size={16} />
            </ToolbarButton>
          </div>

          {/* Headings */}
          <div className="flex items-center gap-1 border-r border-gray-300 pr-3">
            <ToolbarButton
              onClick={() => editor.chain().focus().setParagraph().run()}
              isActive={editor.isActive("paragraph")}
              title="Paragraph"
            >
              <Type size={16} />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              isActive={editor.isActive("heading", { level: 1 })}
              title="Heading 1"
            >
              <Heading1 size={16} />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              isActive={editor.isActive("heading", { level: 2 })}
              title="Heading 2"
            >
              <Heading2 size={16} />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              isActive={editor.isActive("heading", { level: 3 })}
              title="Heading 3"
            >
              <Heading3 size={16} />
            </ToolbarButton>
          </div>

          {/* Lists */}
          <div className="flex items-center gap-1 border-r border-gray-300 pr-3">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive("bulletList")}
              title="Bullet List"
            >
              <List size={16} />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive("orderedList")}
              title="Numbered List"
            >
              <ListOrdered size={16} />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              isActive={editor.isActive("blockquote")}
              title="Quote"
            >
              <Quote size={16} />
            </ToolbarButton>
          </div>

          {/* Media & Links */}
          <div className="flex items-center gap-1 border-r border-gray-300 pr-3">
            <ToolbarButton onClick={addLink} isActive={editor.isActive("link")} title="Add Link">
              <LinkIcon size={16} />
            </ToolbarButton>

            <ToolbarButton onClick={addImage} title="Add Image">
              <ImageIcon size={16} />
            </ToolbarButton>
          </div>

          {/* Undo/Redo */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().chain().focus().undo().run()}
              title="Undo"
            >
              <Undo size={16} />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().chain().focus().redo().run()}
              title="Redo"
            >
              <Redo size={16} />
            </ToolbarButton>
          </div>
        </div>
      </div>

      <div className="p-4 min-h-96 relative">
        {editor.isEmpty && (
          <div className="absolute top-4 left-4 text-gray-400 pointer-events-none">
            {placeholder}
          </div>
        )}
        <EditorContent
          editor={editor}
          className="prose prose-lg max-w-none focus:outline-none"
        />
      </div>
    </div>
  )
}

export default TipTapEditor
