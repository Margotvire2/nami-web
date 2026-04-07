"use client"

import { useState } from "react"
import { decisionTrees, type DecisionTreeId, type DecisionTree } from "@/lib/data/decision-trees"
import { TreePicker } from "./tree-picker"
import { TreeNavigator } from "./tree-navigator"

export function DecisionTreeExplorer() {
  const [selectedTree, setSelectedTree] = useState<DecisionTreeId | null>(null)

  if (selectedTree) {
    const tree = decisionTrees[selectedTree] as unknown as DecisionTree
    return (
      <TreeNavigator
        tree={tree}
        onClose={() => setSelectedTree(null)}
      />
    )
  }

  return <TreePicker onSelect={setSelectedTree} />
}

export { TreeNavigator } from "./tree-navigator"
export { TreePicker } from "./tree-picker"
