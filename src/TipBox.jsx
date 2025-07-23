import { useEffect, useState } from "react";

export default function TipBox() {
  const [tip, setTip] = useState("");
  const scriptUrl = "https://script.google.com/macros/s/AKfycbznX9Q-zsf-Trlal1aBSn4WPngHIOeBAycoI8XrmzKUq85aNQ-Mwk0scn86ty-4gsjA/exec";

  useEffect(() => {
    fetch(`${scriptUrl}?action=getDailyTip`)
      .then(res => res.json())
      .then(data => setTip(data.tip || "No tip available today."))
      .catch(() => setTip("No tip available today."));
  }, []);

  return (
    <div className="bg-yellow-100 text-yellow-800 p-4 rounded shadow mb-4">
      <strong>Tip:</strong> {tip}
    </div>
  );
}
