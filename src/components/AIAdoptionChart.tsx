"use client";

import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function AIAdoptionChart() {
    const data = {
        labels: ['2014', '2016', '2018', '2020', '2022', '2024', '2025'],
        datasets: [
            {
                label: 'News Organizations Using AI',
                data: [5, 12, 28, 45, 67, 82, 89],
                borderColor: 'rgb(99, 102, 241)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fill: true,
                tension: 0.4,
            },
            {
                label: 'AI-Generated Articles (Thousands)',
                data: [0.5, 2, 8, 25, 58, 120, 180],
                borderColor: 'rgb(236, 72, 153)',
                backgroundColor: 'rgba(236, 72, 153, 0.1)',
                fill: true,
                tension: 0.4,
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    color: 'rgb(156, 163, 175)',
                    font: {
                        size: 12,
                        family: "'Inter', sans-serif"
                    },
                    padding: 15,
                    usePointStyle: true,
                }
            },
            title: {
                display: true,
                text: 'AI Adoption in Journalism (2014-2025)',
                color: 'rgb(209, 213, 219)',
                font: {
                    size: 16,
                    weight: 'bold' as const,
                    family: "'Inter', sans-serif"
                },
                padding: {
                    top: 10,
                    bottom: 20
                }
            },
            tooltip: {
                backgroundColor: 'rgba(17, 24, 39, 0.9)',
                titleColor: 'rgb(243, 244, 246)',
                bodyColor: 'rgb(209, 213, 219)',
                borderColor: 'rgb(75, 85, 99)',
                borderWidth: 1,
                padding: 12,
                displayColors: true,
                callbacks: {
                    label: function (context: any) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += context.parsed.y + (context.datasetIndex === 0 ? '%' : 'k');
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(75, 85, 99, 0.2)',
                },
                ticks: {
                    color: 'rgb(156, 163, 175)',
                    font: {
                        size: 11
                    }
                }
            },
            x: {
                grid: {
                    color: 'rgba(75, 85, 99, 0.2)',
                },
                ticks: {
                    color: 'rgb(156, 163, 175)',
                    font: {
                        size: 11
                    }
                }
            }
        }
    };

    return (
        <div style={{
            background: 'var(--bg-secondary)',
            padding: '2rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            margin: '2.5rem 0'
        }}>
            <Line data={data} options={options} />
        </div>
    );
}
