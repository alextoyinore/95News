export interface SeoAnalysisResult {
    score: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    feedback: string[];
    tips: string[];
}

export const analyzeSeo = (
    title: string,
    description: string,
    content: any,
    focusKeyword: string = ''
): SeoAnalysisResult => {
    let score = 0;
    const feedback: string[] = [];
    const tips: string[] = [];

    // Focus Keyword Analysis
    const hasFocusKeyword = focusKeyword && focusKeyword.trim().length > 0;
    const keywordLower = focusKeyword.toLowerCase();

    // Title Analysis
    if (!title) {
        feedback.push("Title is missing.");
        tips.push("Write a compelling title between 40-60 characters.");
    } else {
        if (title.length < 20) {
            score += 10;
            feedback.push("Title is too short.");
        } else if (title.length <= 60) {
            score += 30;
            feedback.push("Title length is optimal.");
        } else {
            score += 15;
            feedback.push("Title is too long.");
            tips.push("Try shortening the title to improve visibility in search results.");
        }

        if (hasFocusKeyword) {
            if (title.toLowerCase().includes(keywordLower)) {
                score += 10;
                feedback.push("Focus keyword found in title.");
            } else {
                tips.push("Try to include your focus keyword in the title.");
            }
        }
    }

    // Description Analysis (Meta)
    if (!description) {
        tips.push("Add a meta description to improve click-through rates.");
    } else {
        if (description.length >= 120 && description.length <= 160) {
            score += 20;
            feedback.push("Meta description length is optimal.");
        } else if (description.length > 50 && description.length < 160) {
            score += 10;
            feedback.push("Meta description length is okay.");
        } else {
            tips.push("Keep meta description between 120 and 160 characters.");
        }

        if (hasFocusKeyword) {
            if (description.toLowerCase().includes(keywordLower)) {
                score += 10;
                feedback.push("Focus keyword found in meta description.");
            } else {
                tips.push("Include the focus keyword in your meta description.");
            }
        }
    }

    // Content Analysis (Editor.js blocks)
    if (content && content.blocks && content.blocks.length > 0) {
        const blocks = content.blocks;
        const textBlocks = blocks.filter((b: any) => b.type === 'paragraph' || b.type === 'header');
        const allText = textBlocks.map((b: any) => b.data.text || '').join(' ');
        const wordCount = allText.split(/\s+/).filter(Boolean).length;

        if (wordCount > 600) {
            score += 20;
            feedback.push("Content length is excellent.");
        } else if (wordCount > 300) {
            score += 10;
            feedback.push("Content length is good.");
        } else {
            tips.push("Aim for at least 300-600 words for better SEO ranking.");
        }

        if (hasFocusKeyword) {
            const keywordRegex = new RegExp(`\\b${keywordLower}\\b`, 'gi');
            const matches = allText.match(keywordRegex);
            const count = matches ? matches.length : 0;
            const density = (count / wordCount) * 100;

            if (count > 0) {
                if (density >= 0.5 && density <= 2.5) {
                    score += 10;
                    feedback.push(`Excellent keyword density (${density.toFixed(1)}%).`);
                } else if (density > 2.5) {
                    tips.push("Keyword density is a bit high. Avoid keyword stuffing.");
                } else {
                    score += 5;
                    feedback.push("Focus keyword found in content.");
                    tips.push("Increase focus keyword density slightly.");
                }
            } else {
                tips.push("Focus keyword not found in content text.");
            }
        }

        const hasH2 = blocks.some((b: any) => b.type === 'header' && b.data.level === 2);
        if (hasH2) {
            score += 5;
            feedback.push("Good use of headings.");
        } else {
            tips.push("Use H2 headings to structure your content.");
        }

        const hasImages = blocks.some((b: any) => b.type === 'image');
        if (hasImages) {
            score += 5;
            feedback.push("Images are present.");
        } else {
            tips.push("Add a featured image and content images for better engagement.");
        }
    } else {
        feedback.push("No content detected.");
        tips.push("Start writing your story to see analysis.");
    }

    // Final Grade
    let grade: 'A' | 'B' | 'C' | 'D' | 'F' = 'F';
    const finalScore = Math.min(score, 100);
    if (finalScore >= 90) grade = 'A';
    else if (finalScore >= 75) grade = 'B';
    else if (finalScore >= 50) grade = 'C';
    else if (finalScore >= 30) grade = 'D';

    return {
        score: finalScore,
        grade,
        feedback,
        tips
    };
};
