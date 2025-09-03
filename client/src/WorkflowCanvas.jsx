import React from "react";
import ReactFlow, { Background, Controls } from "reactflow";
import "reactflow/dist/style.css";

// initial nodes for our workflow
const initialNodes = [
  {
    id: "1",
    type: "input",
    position: { x: 100, y: 50 },
    data: { label: "User Query" },
  },
  {
    id: "2",
    position: { x: 100, y: 200 },
    data: { label: "KnowledgeBase" },
  },
  {
    id: "3",
    position: { x: 400, y: 200 },
    data: { label: "LLM Engine" },
  },
  {
    id: "4",
    type: "output",
    position: { x: 250, y: 350 },
    data: { label: "Output" },
  },
];

// initial connections (edges) between nodes
const initialEdges = [
  { id: "e1-2", source: "1", target: "2" },
  { id: "e2-3", source: "2", target: "3" },
  { id: "e3-4", source: "3", target: "4" },
];

export default function WorkflowCanvas() {
  return (
    <div style={{ height: 500, border: "1px solid #ddd", borderRadius: 8 }}>
      <ReactFlow nodes={initialNodes} edges={initialEdges} fitView>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
