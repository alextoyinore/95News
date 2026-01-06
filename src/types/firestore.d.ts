export interface User {
    id: string; // Matches Firebase Auth UID
    displayName?: string;
    email: string;
    photoURL?: string;
    bio?: string;
    role: 'superuser' | 'writer' | 'editor' | 'subscriber';
}

export interface Page {
    id: string;
    title: string;
    slug: string;
    content?: string;
    metaDescription?: string;
    focusKeyword?: string;
    featuredImageUrl?: string;
    featuredImageCaption?: string;
    status: 'draft' | 'published';
    authorId: string;
    createdAt: string; // ISO date string
    updatedAt?: string; // ISO date string
    builderEnabled?: boolean;
    showTitle?: boolean;
    disabledWidgetAreas?: string[];
}

export interface Category {
    id: string;
    name: string;
    slug: string;
}

export interface Tag {
    id: string;
    name: string;
    slug: string;
}

export interface Post {
    id: string;
    title: string;
    slug: string;
    titleKeywords?: string[];
    content?: string;
    excerpt?: string;
    metaDescription?: string;
    focusKeyword?: string;
    featuredImageUrl?: string;
    featuredImageCaption?: string;
    audioUrl?: string;
    status: 'draft' | 'published' | 'archived';
    authorId: string;
    contributors?: string[];
    categoryIds?: string[];
    tagIds?: string[];
    createdAt: string;
    updatedAt?: string;
    publishedAt?: string;
    isBreaking?: boolean;
    isFeatured?: boolean;
    views?: number;
}

export interface MediaItem {
    id: string;
    url: string;
    filename: string;
    authorId: string;
    createdAt: string;
}

export interface SiteSettings {
    activeTheme: string;
    siteName?: string;
    siteDescription?: string;
    companyName?: string;
    siteLogoUrl?: string;
    language?: string;
    timezone?: string;
    bodyFont?: string;
    headlineFont?: string;
    baseFontSize?: number;
    pageWidth?: 'full' | 'centered';
    contentWidth?: number;
    hideAllPageTitles?: boolean;
    menuAssignments?: { [key: string]: string };
    autoSaveInterval?: number;
}

export interface WidgetArea {
    id: string;
    name: string;
    description?: string;
    pageId?: string;
    theme?: string;
}

export interface WidgetInstance {
    id: string;
    widgetAreaId: string;
    type: 'recent-posts' | 'categories-list' | 'tag-cloud' | 'search' | 'custom-html' | 'post-showcase' | 'image' | 'text' | 'gallery' | 'navigation-menu' | 'social-follow' | 'trading-ticker' | 'breaking-news' | 'live-score' | 'sporting-tables' | 'weather' | 'post-carousel' | 'featured-and-smalls' | 'tabbed-posts' | 'featured-and-list' | 'featured-top-and-grid' | 'big-featured' | 'audio-player' | 'subscription-form' | 'chart';
    order: number;
    config?: any;
}

export interface NavigationMenu {
    id: string;
    name: string;
}

export interface NavigationMenuItem {
    id: string;
    menuId: string;
    label: string;
    type: 'custom' | 'page' | 'category';
    url?: string;
    objectId?: string;
    target?: '_self' | '_blank';
    order: number;
    parentId?: string;
}

export interface CustomTheme {
    id: string;
    name: string;
    description?: string;
    previewImageUrl?: string;
    colors?: any;
    authorId: string;
    baseTheme: string;
}

export interface PageLayout {
    id: string;
    name: string;
    structure: string;
}

export interface BlockLayout {
    id: string;
    name: string;
    description?: string;
    type: 'post-grid' | 'post-list' | 'post-carousel' | 'featured-and-smalls' | 'tabbed-posts' | 'hero' | 'cta' | 'feature-grid' | 'gallery' | 'video' | 'testimonials' | 'contact-form' | 'subscription-form' | 'featured-top-and-grid' | 'featured-and-list' | 'big-featured' | 'audio-player';
    config?: any;
}

export interface PageSection {
    id: string;
    pageId: string;
    order: number;
    type: string;
    config?: any;
}

export interface SectionBlock {
    id: string;
    sectionId: string;
    blockLayoutId: string;
    columnIndex: number;
    order: number;
    config?: any;
}

export interface Comment {
    id: string;
    postId: string;
    authorId: string;
    content: string;
    createdAt: string;
    parentId?: string;
}

export interface PostLike {
    postId: string;
    userId: string;
    createdAt: string;
}

export interface Notification {
    id: string;
    userId: string;
    message: string;
    link?: string;
    isRead: boolean;
    createdAt: string;
}

export interface Subscription {
    id: string;
    email: string;
    createdAt: string;
}

export interface ChartData {
    id: string;
    name: string;
    type: 'bar' | 'line' | 'pie';
    data: any[];
}
