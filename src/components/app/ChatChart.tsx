import { Bar, Line } from "react-chartjs-2";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import type { ChartBlock } from "@/lib/chat-stream";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler,
);

const VOYA_ORANGE = "#ff570c";
const SERIES_COLORS = [VOYA_ORANGE, "#7b4bd8", "#0f9d8f", "#b0b7c3", "#4b5563"];

/** Renders a chart block emitted inline by the assistant. */
export function ChatChart({ block }: { block: ChartBlock }) {
  const datasets = block.datasets.map((d, i) => {
    const color = d.color ?? SERIES_COLORS[i % SERIES_COLORS.length];
    return {
      label: d.label,
      data: d.data,
      backgroundColor: block.kind === "bar" ? color : `${color}22`,
      borderColor: color,
      borderWidth: block.kind === "line" ? 2 : 0,
      borderRadius: 4,
      pointRadius: 2,
      tension: 0.3,
      spanGaps: false,
    };
  });

  const data = { labels: block.labels, datasets };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: datasets.length > 1,
        position: "bottom" as const,
        labels: { boxWidth: 10, boxHeight: 10, font: { size: 10 }, usePointStyle: true },
      },
      tooltip: { intersect: false, mode: "index" as const },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 9 }, maxRotation: 0 } },
      y: { border: { display: false }, ticks: { font: { size: 9 } } },
    },
  };

  return (
    <figure className="mt-3 rounded-xl border border-border bg-card p-3">
      {block.title && (
        <figcaption className="mb-2 text-xs font-semibold text-foreground">{block.title}</figcaption>
      )}
      <div className="h-48">
        {block.kind === "line" ? (
          <Line data={data} options={options} />
        ) : (
          <Bar data={data} options={options} />
        )}
      </div>
      {block.footnote && (
        <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">{block.footnote}</p>
      )}
    </figure>
  );
}
