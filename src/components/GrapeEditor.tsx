"use client";
import { useEffect, useRef } from "react";
import grapesjs, { Editor } from "grapesjs";
import "grapesjs/dist/css/grapes.min.css";  
import { useRouter } from "next/navigation";
import StudioEditor from '@grapesjs/studio-sdk/react';
import '@grapesjs/studio-sdk/style';
type Props = {
  initialDesign?: Record<string, any>;
};

export default function GrapeEditor({ initialDesign }: Props) {
  const editorRef = useRef<Editor | null>(null);
  const router = useRouter();

  useEffect(() => {
    const editorEl = document.querySelector("#editor");
    if (editorEl && editorEl.innerHTML !== "") {
      editorEl.innerHTML = "";
    }

    const editor = grapesjs.init({
      container: "#editor",
      height: "100vh",
      width: "auto",
      fromElement: false,
      storageManager: false,
      plugins: [],
      blockManager: {
        appendTo: "#blocks",
        blocks: [], // force-disable built-in blocks
      },
    });

    // Default blocks
    editor.BlockManager.add("text-block", {
      label: "Text",
      content: "<p>Insert your text here</p>",
    });

    editor.BlockManager.add("image-block", {
      label: "Image",
      content: '<img src="https://via.placeholder.com/150" />',
    });

    // Custom HTML form block
    editor.BlockManager.add("form-block", {
      label: "Form",
      content: `
        <form>
          <label for="name">Name:</label><br />
          <input type="text" id="name" name="name" /><br /><br />
          <label for="email">Email:</label><br />
          <input type="email" id="email" name="email" /><br /><br />
          <button type="submit">Submit</button>
        </form>
      `,
    });

    if (initialDesign) {
      editor.loadProjectData(initialDesign);
    }

    editorRef.current = editor;

    // === BUTTON CONTAINER ===
    const buttonContainer = document.createElement("div");
    buttonContainer.style.position = "fixed";
    buttonContainer.style.left = "10px";
    buttonContainer.style.bottom = "20vh";
    buttonContainer.style.zIndex = "9999";
    buttonContainer.style.display = "flex";
    buttonContainer.style.gap = "10px";

    // === Save Button ===
    const saveBtn = document.createElement("button");
    saveBtn.innerText = "Save";
    styleButton(saveBtn, "#415a77");
    saveBtn.addEventListener("click", async () => {
      const json = editor.getProjectData();

      try {
        const res = await fetch("/api/uploadDesign", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(json),
        });

        const result = await res.json();
        console.log("Design saved:", result);
        alert("Design saved successfully!");
      } catch (error) {
        console.error("Error saving design:", error);
        alert("Failed to save design");
      }
    });

    // === Cancel Button ===
    const cancelBtn = document.createElement("button");
    cancelBtn.innerText = "Cancel";
    styleButton(cancelBtn, "#778da9");
    cancelBtn.addEventListener("click", () => {
      router.push("/documentTemplate");
    });

    // Append buttons
    buttonContainer.appendChild(saveBtn);
    buttonContainer.appendChild(cancelBtn);
    document.body.appendChild(buttonContainer);

    return () => {
      document.body.removeChild(buttonContainer);
    };
  }, [initialDesign, router]);

  const styleButton = (btn: HTMLButtonElement, background: string = "#007bff") => {
    btn.style.padding = "10px 16px";
    btn.style.background = background;
    btn.style.color = "white";
    btn.style.border = "none";
    btn.style.cursor = "pointer";
    btn.style.borderRadius = "5px";
    btn.style.fontWeight = "500";
  };

  const styleFloating = (btn: HTMLButtonElement, bottomOffsetVh: string = "30vh", left: string = "10px") => {
    btn.style.position = "fixed";
    btn.style.left = left;
    btn.style.bottom = bottomOffsetVh;
    btn.style.zIndex = "9999";
    btn.style.padding = "10px";
    btn.style.background = "#6c757d";
    btn.style.color = "white";
    btn.style.border = "none";
    btn.style.cursor = "pointer";
    btn.style.borderRadius = "5px";
  };

  return (
    <div className="flex">
      {/* <div
        id="blocks"
        style={{ width: "200px", padding: "10px", background: "#f0f0f0" }}
      ></div>
      <div id="editor" style={{ flex: 1 }}></div> */}


<StudioEditor
  options={{
    // ...
    project: {
      type: 'email',
      default: {
          pages: [
            {
              component: '<mjml><mj-body><mj-section><mj-column><mj-text>My email</mj-text></mj-column></mj-section></mj-body></mjml>'
            },
          ]
      },
    },
    i18n: {
      locales: {
        en: {
          actions: {
            importCode: {
              content: 'Paste here your MJML code and click Import'
            }
          }
        }
      }
    }
  }}
/>
    </div>
  );
}

// // App.jsx
// import React, { useEffect, useRef, useState } from "react";
// import grapesjs from "grapesjs";
// import "grapesjs/dist/css/grapes.min.css";
// import Handlebars from "handlebars";

// const mockTableData = [
//   { name: "Hamid", email: "hamid@example.com" },
//   { name: "Ali", email: "ali@example.com" },
// ];

// export default function App() {
//   const editorRef = useRef(null);
//   const [compiledHtml, setCompiledHtml] = useState("");
//   const [templateHtml, setTemplateHtml] = useState("");

//   useEffect(() => {
//     const editor = grapesjs.init({
//       container: "#gjs",
//       height: "600px",
//       width: "auto",
//       fromElement: false,
//       storageManager: false,
//       plugins: [],
//       components: `<h2>Employee List</h2>
//         <table>
//           <thead><tr><th>Name</th><th>Email</th></tr></thead>
//           <tbody>
//             {{#each tableData}}
//             <tr><td>{{this.name}}</td><td>{{this.email}}</td></tr>
//             {{/each}}
//           </tbody>
//         </table>`
//     });
//     editorRef.current = editor;
//   }, []);

//   const handleInsertVariable = (variable) => {
//     const editor = editorRef.current;
//     const selected = editor.getSelected();
//     if (selected) {
//       selected.append(`<span>{{${variable}}}</span>`);
//     }
//   };

//   const handleSaveTemplate = () => {
//     const editor = editorRef.current;
//     const html = editor.getHtml();
//     setTemplateHtml(html);
//     alert("Template saved!");
//   };

//   const handleRenderTemplate = () => {
//     const template = Handlebars.compile(templateHtml);
//     const output = template({ tableData: mockTableData });
//     setCompiledHtml(output);
//   };

//   return (
//     <div className="App">
//       <h1 className="text-xl font-bold mb-2">Template Builder</h1>

//       <div className="mb-2">
//         <label>Insert Variable: </label>
//         <button onClick={() => handleInsertVariable("name")} className="mx-1 px-2 py-1 bg-blue-300">{"{{name}}"}</button>
//         <button onClick={() => handleInsertVariable("email")} className="mx-1 px-2 py-1 bg-blue-300">{"{{email}}"}</button>
//       </div>

//       <div id="gjs" className="border border-gray-300"></div>

//       <div className="flex gap-4 mt-4">
//         <button onClick={handleSaveTemplate} className="px-3 py-1 bg-green-500 text-white rounded">Save Template</button>
//         <button onClick={handleRenderTemplate} className="px-3 py-1 bg-purple-600 text-white rounded">Render Template</button>
//       </div>

//       {compiledHtml && (
//         <div className="mt-6">
//           <h2 className="text-lg font-semibold">Rendered Output:</h2>
//           <div className="border p-3 mt-2" dangerouslySetInnerHTML={{ __html: compiledHtml }}></div>
//         </div>
//       )}
//     </div>
//   );
// }



