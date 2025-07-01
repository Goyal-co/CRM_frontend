import { useEffect, useState } from "react";

export default function TipBox() {
  const [tip, setTip] = useState("");
  const scriptUrl = "https://script.google.com/macros/s/AKfycbwzfrMTurwHJ7BllZuCpMLzrmZC8nOraJ2eEOhY4ZCuWgWn50zZ3A4nwwb-a9tTdAmr/exec";

  useEffect(() => {
    fetch(`