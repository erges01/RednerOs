import React from "react";

export const useAssetDrag = () => {
  const onDragStart = (e: React.DragEvent, asset: any) => {
    // FIXED: Swapped 'assetId' and 'assetType' to just 'id' and 'type' 
    // so it perfectly matches what the Timeline Track is looking for!
    const payload = JSON.stringify({
      id: asset.id,
      name: asset.name,
      type: asset.type,
    });
    
    e.dataTransfer.setData("application/json", payload);
    e.dataTransfer.effectAllowed = "copy";
  };

  return { onDragStart };
};