import Link from "next/link";
import React from "react";

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
    return (
        <nav style={{ marginBottom: "2rem", fontSize: "0.9rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>Home</Link>
            {items.map((item, index) => (
                <React.Fragment key={index}>
                    <span style={{ opacity: 0.5 }}>/</span>
                    {item.href ? (
                        <Link href={item.href} style={{ color: "inherit", textDecoration: "none" }}>
                            {item.label}
                        </Link>
                    ) : (
                        <span style={{ color: "var(--text-primary)", fontWeight: "500" }}>{item.label}</span>
                    )}
                </React.Fragment>
            ))}
        </nav>
    );
}
