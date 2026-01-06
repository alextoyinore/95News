"use client";

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    hasNextPage: boolean;
    onNext: () => void;
    onPrev: () => void;
    totalItems: number;
    itemsPerPage: number;
    onItemsPerPageChange: (count: number) => void;
}

export default function DashboardPagination({
    currentPage,
    hasNextPage,
    onNext,
    onPrev,
    totalItems,
    itemsPerPage,
    onItemsPerPageChange
}: PaginationProps) {
    const totalPages = totalItems > 0 ? Math.ceil(totalItems / itemsPerPage) : 1;

    return (
        <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1rem 1.5rem",
            borderTop: "1px solid var(--border)",
            backgroundColor: "var(--bg-tertiary)",
            marginTop: "auto",
            borderRadius: "0 0 var(--radius-lg) var(--radius-lg)",
            flexWrap: "wrap",
            gap: "1rem"
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                <div style={{ color: "var(--text-secondary)", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                    Page <span style={{ color: "var(--text-primary)", fontWeight: "600" }}>{currentPage}</span> of <span style={{ color: "var(--text-primary)", fontWeight: "600" }}>{totalPages}</span>
                    <span style={{ marginLeft: "0.5rem" }}>({totalItems} total items)</span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>Show:</span>
                    <select
                        value={itemsPerPage}
                        onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                        style={{
                            padding: "0.3rem 0.5rem",
                            borderRadius: "var(--radius-sm)",
                            border: "1px solid var(--border)",
                            backgroundColor: "var(--bg-secondary)",
                            color: "var(--text-primary)",
                            fontSize: "0.85rem",
                            outline: "none",
                            cursor: "pointer"
                        }}
                    >
                        {[10, 20, 50, 100].map(val => (
                            <option key={val} value={val}>{val}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                    onClick={onPrev}
                    disabled={currentPage === 1}
                    style={{
                        padding: "0.5rem 1rem",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid var(--border)",
                        backgroundColor: currentPage === 1 ? "transparent" : "var(--bg-secondary)",
                        cursor: currentPage === 1 ? "not-allowed" : "pointer",
                        opacity: currentPage === 1 ? 0.5 : 1,
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        color: "var(--text-primary)",
                        fontSize: "0.85rem",
                        fontWeight: "500"
                    }}
                >
                    <ChevronLeft size={16} /> Previous
                </button>
                <button
                    onClick={onNext}
                    disabled={!hasNextPage}
                    style={{
                        padding: "0.5rem 1rem",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid var(--border)",
                        backgroundColor: !hasNextPage ? "transparent" : "var(--bg-secondary)",
                        cursor: !hasNextPage ? "not-allowed" : "pointer",
                        opacity: !hasNextPage ? 0.5 : 1,
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        color: "var(--text-primary)",
                        fontSize: "0.85rem",
                        fontWeight: "500"
                    }}
                >
                    Next <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
}
