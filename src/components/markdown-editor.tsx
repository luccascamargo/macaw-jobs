"use client";

import {
  MDXEditor,
  MDXEditorMethods,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
} from "@mdxeditor/editor";
import { FC } from "react";

interface EditorProps {
  markdown: string;
  editorRef?: React.RefObject<MDXEditorMethods | null>;
  onChange: (markdown: string, initialMarkdownNormalize: boolean) => void;
}

export const MarkdownEditor: FC<EditorProps> = ({
  markdown,
  editorRef,
  onChange,
}) => {
  return (
    <MDXEditor
      onChange={onChange}
      ref={editorRef}
      markdown={markdown}
      className="border shadow-xs"
      plugins={[
        toolbarPlugin({
          toolbarClassName: "tollbar-card",
          toolbarContents: () => (
            <>
              <UndoRedo />
              <BoldItalicUnderlineToggles />
            </>
          ),
        }),
      ]}
    />
  );
};
