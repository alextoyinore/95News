
import React from 'react';
import { createRoot } from 'react-dom/client';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface ChartToolData {
    type: 'line' | 'bar';
    title: string;
    labels: string[];
    datasets: {
        label: string;
        data: number[];
    }[];
}

class ChartTool {
    data: ChartToolData;
    wrapper: HTMLElement;
    root: any;
    readOnly: boolean;

    static get toolbox() {
        return {
            title: 'Chart',
            icon: '<svg width="17" height="17" viewBox="0 0 24 24"><path stroke="currentColor" stroke-width="2" d="M3 3v18h18M18 17V9M13 17V5M8 17v-3"/></svg>'
        };
    }

    constructor({ data, readOnly }: { data: ChartToolData, readOnly: boolean }) {
        this.data = data.labels ? data : {
            type: 'line',
            title: '',
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
            datasets: [{
                label: 'Dataset 1',
                data: [10, 20, 30, 40, 50]
            }]
        };
        this.readOnly = readOnly;
        this.wrapper = document.createElement('div');
        this.root = null;
    }

    render() {
        this.wrapper = document.createElement('div');
        this.wrapper.style.marginBottom = '1rem';
        this.root = createRoot(this.wrapper);
        this.renderReactComponent();
        return this.wrapper;
    }

    renderReactComponent() {
        if (!this.root) return;

        const ChartComponent = () => {
            const [data, setData] = React.useState<ChartToolData>(this.data);
            const [isEditing, setIsEditing] = React.useState<boolean>(!this.readOnly && (!this.data.title && !this.data.labels));

            const updateData = (newData: Partial<ChartToolData>) => {
                const updated = { ...data, ...newData };
                setData(updated);
                this.data = updated;
            };

            const chartData = {
                labels: data.labels,
                datasets: data.datasets.map((ds, i) => ({
                    label: ds.label,
                    data: ds.data,
                    backgroundColor: i === 0 ? 'rgba(99, 102, 241, 0.5)' : 'rgba(236, 72, 153, 0.5)',
                    borderColor: i === 0 ? 'rgb(99, 102, 241)' : 'rgb(236, 72, 153)',
                    borderWidth: 2,
                    fill: data.type === 'line',
                    tension: 0.4
                }))
            };

            const options = {
                responsive: true,
                plugins: {
                    legend: { position: 'top' as const },
                    title: { display: !!data.title, text: data.title }
                }
            };

            if (this.readOnly) {
                return (
                    <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px' }}>
                        {data.type === 'line' ? <Line data={chartData} options={options} /> : <Bar data={chartData} options={options} />}
                    </div>
                );
            }

            return (
                <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg-secondary)' }}>
                    {isEditing ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                            <input
                                className="cdx-input"
                                placeholder="Chart Title"
                                value={data.title}
                                onChange={e => updateData({ title: e.target.value })}
                            />
                            <div style={{ display: "flex", gap: "1rem" }}>
                                <select
                                    className="cdx-input"
                                    value={data.type}
                                    onChange={e => updateData({ type: e.target.value as 'line' | 'bar' })}
                                >
                                    <option value="line">Line Chart</option>
                                    <option value="bar">Bar Chart</option>
                                </select>
                                <input
                                    className="cdx-input"
                                    placeholder="Dataset Label"
                                    value={data.datasets[0].label}
                                    onChange={e => {
                                        const newDatasets = [...data.datasets];
                                        newDatasets[0].label = e.target.value;
                                        updateData({ datasets: newDatasets });
                                    }}
                                />
                            </div>
                            <input
                                className="cdx-input"
                                placeholder="Labels (comma separated)"
                                value={data.labels.join(', ')}
                                onChange={e => updateData({ labels: e.target.value.split(',').map(s => s.trim()) })}
                            />
                            <input
                                className="cdx-input"
                                placeholder="Data (numbers, comma separated)"
                                value={data.datasets[0].data.join(', ')}
                                onChange={e => {
                                    const nums = e.target.value.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
                                    const newDatasets = [...data.datasets];
                                    newDatasets[0].data = nums;
                                    updateData({ datasets: newDatasets });
                                }}
                            />
                            <button className="btn btn-sm" onClick={() => setIsEditing(false)}>Done</button>
                        </div>
                    ) : (
                        <div style={{ position: 'relative' }}>
                            <button
                                style={{ position: 'absolute', right: 0, top: 0, zIndex: 10, padding: '4px 8px', background: 'var(--bg-tertiary)', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                onClick={() => setIsEditing(true)}
                            >
                                Edit
                            </button>
                            {data.type === 'line' ? <Line data={chartData} options={options} /> : <Bar data={chartData} options={options} />}
                        </div>
                    )}
                </div>
            );
        };

        this.root.render(<ChartComponent />);
    }

    save() {
        return this.data;
    }
}

export default ChartTool;
