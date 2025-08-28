import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";

const scriptId =
  "AKfycbznX9Q-zsf-Trlal1aBSn4WPngHIOeBAycoI8XrmzKUq85aNQ-Mwk0scn86ty-4gsjA";

export default function SourceComparison() {
  const [sources, setSources] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSourceData();
  }, []);

  const fetchSourceData = async () => {
    setLoading(true);
    try {
      const userEmail = localStorage.getItem("email");
      const response = await fetch(
        `https://script.google.com/macros/s/${scriptId}/exec?action=getLeadSourceAnalysis&email=${encodeURIComponent(
          userEmail || ""
        )}`
      );
      const data = await response.json();

      if (data.sources) {
        setSources(data.sources);

        // Generate AI-like insights locally
        const generatedInsights = data.sources.map((src) => ({
          source: src.source,
          marketerSuggestion: generateMarketerSuggestion(src),
          adminSuggestion: generateAdminSuggestion(src),
        }));

        setInsights(generatedInsights);
      }
    } catch (err) {
      console.error("Error fetching source comparison:", err);
    } finally {
      setLoading(false);
    }
  };

  // === AI Helper Functions ===
  const generateMarketerSuggestion = (src) => {
    let suggestion = "";
    if (src.junkRate > 30) {
      suggestion +=
        "⚠️ High junk rate — refine campaign targeting or improve ad filters. ";
    }
    if (src.conversionRate >= 15) {
      suggestion +=
        "🏆 Strong conversion — consider scaling budget and retargeting here. ";
    }
    if ((src.feedbacks || []).some((f) => f.toLowerCase().includes("price"))) {
      suggestion +=
        "💰 Pricing concerns common — emphasize EMI/affordability in creatives. ";
    }
    if ((src.feedbacks || []).some((f) => f.toLowerCase().includes("location"))) {
      suggestion +=
        "📍 Many leads cite location mismatch — refine geo-targeting in campaigns. ";
    }
    return suggestion || "No major issues detected.";
  };

  const generateAdminSuggestion = (src) => {
    let suggestion = "";
    if (src.qualityScore < 6) {
      suggestion +=
        "📉 Low lead quality — assign cautiously or provide extra training to sales. ";
    }
    if (
      (src.feedbacks || []).some((f) =>
        f.toLowerCase().includes("follow up")
      )
    ) {
      suggestion +=
        "📞 Delayed follow-ups mentioned — ensure faster callbacks and SLA compliance. ";
    }
    if (src.conversionRate > 20) {
      suggestion +=
        "⭐ High closure potential — route these leads to top performers. ";
    }
    return suggestion || "Performing steadily.";
  };

  if (loading) {
    return <p className="text-center py-6">Loading Source Comparison...</p>;
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">
        📊 Source Comparison & AI Insights
      </h2>
      <Card className="p-4 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Source</TableHead>
              <TableHead>Total Leads</TableHead>
              <TableHead>Conversion %</TableHead>
              <TableHead>Quality Score</TableHead>
              <TableHead>Junk %</TableHead>
              <TableHead>Marketer Suggestion</TableHead>
              <TableHead>Admin Suggestion</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sources.map((src, i) => {
              const insight = insights.find(
                (ins) => ins.source === src.source
              );
              return (
                <TableRow key={i}>
                  <TableCell className="font-semibold">
                    {src.source}
                  </TableCell>
                  <TableCell>{src.totalLeads}</TableCell>
                  <TableCell>{src.conversionRate}%</TableCell>
                  <TableCell>{src.qualityScore}/10</TableCell>
                  <TableCell>{src.junkRate || 0}%</TableCell>
                  <TableCell className="text-sm text-blue-700">
                    {insight?.marketerSuggestion}
                  </TableCell>
                  <TableCell className="text-sm text-green-700">
                    {insight?.adminSuggestion}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
