import { useEffect, useState } from "react";

export default function TipBox() {
  const [tip, setTip] = useState("");
  const scriptUrl = "https://script.google.com/macros/s/AKfycbyWzCFNuv-8Ugr-pzD4VJ08-QJ20RxvENe1bocm2Ya_2A02lrxH_WvmWddKqB_P8Ccm/exec";

  useEffect(() => {
    fetch(`${scriptUrl}?action=getDailyTip`)
      .then(res => res.json())
      .then(data => setTip(data.tip))
      .catch(err => setTip("Unable to load tip. Please try again later."));
  }, []);

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-5 rounded-lg shadow text-gray-800 max-w-3xl mx-auto mb-6">
      <h3 className="text-xl font-bold mb-2">📌 Daily Sales Tip</h3>
      <p className="text-md italic">{tip}</p>
    </div>
  );
}
