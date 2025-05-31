import { useState } from "react";

export function usePizzaCardState() {
  const [imageError, setImageError] = useState(false);
  return { imageError, setImageError };
}
