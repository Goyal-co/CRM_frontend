import { useEffect, useState } from "react";

export default function TipBox() {
  const [tip, setTip] = useState("");
  const scriptUrl = "https://script.google.com/macros/s/AKfycbznX9Q-zsf-Trlal1aBSn4WPngHIOeBAycoI8XrmzKUq85aNQ-Mwk0scn86ty-4gsjA/exec";

  useEffect(() => {
    fetch(`
