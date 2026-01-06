"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect } from "react";
import Breadcrumbs from "@/components/Breadcrumbs";
import AuthorBio from "@/components/AuthorBio";
import ReadingProgressBar from "@/components/ReadingProgressBar";

// Import Prism for syntax highlighting
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-json';

export default function ArticlePage({ params }: { params: { id: string } }) {
  // Single comprehensive article showcasing all Editor.js elements
  const article = {
    title: "The Future of AI in Modern Journalism: A Complete Guide",
    category: "Tech",
    author: {
      name: "Sarah Jenkins",
      bio: "Sarah is a veteran tech journalist with over 15 years of experience covering the intersection of technology and society. She has written for major publications including The New York Times, Wired, and The Atlantic.",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=256"
    },
    date: "Oct 24, 2025",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=1200",
    content: `
      <p>The landscape of journalism is undergoing a fundamental shift. As generative AI models become increasingly sophisticated, newsrooms around the world are grappling with how to integrate these powerful tools without compromising editorial integrity. This comprehensive guide explores the transformation, challenges, and opportunities that lie ahead.</p>

      <p>From automated reporting on financial earnings to AI-assisted research for long-form investigative pieces, the applications are vast. But so are the risks. Issues of bias, accuracy, and the potential for large-scale misinformation are at the forefront of the debate.</p>

      <h2>The Current State of AI in Newsrooms</h2>
      
      <p>Major news organizations have already begun experimenting with AI tools. The Associated Press has been using automation for earnings reports since 2014, freeing up journalists to focus on more complex stories. The Washington Post's "Heliograf" system covered the 2016 Olympics and local elections, generating hundreds of short reports.</p>

      <blockquote>"AI is not a replacement for journalists, but a powerful extender of their capabilities. The challenge lies in defining the boundaries and maintaining transparency with our readers." - Editorial Director, NineToFive</blockquote>

      <p>But the technology has evolved dramatically. Modern large language models can now draft entire articles, conduct interviews, analyze data sets, and even generate multimedia content. This raises fundamental questions about the nature of journalism itself.</p>

      <h3>AI Adoption by News Organizations</h3>

      <table>
        <thead>
          <tr>
            <th>Organization</th>
            <th>AI Tool</th>
            <th>Primary Use Case</th>
            <th>Year Adopted</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Associated Press</td>
            <td>Automated Insights</td>
            <td>Earnings Reports</td>
            <td>2014</td>
          </tr>
          <tr>
            <td>Washington Post</td>
            <td>Heliograf</td>
            <td>Breaking News & Elections</td>
            <td>2016</td>
          </tr>
          <tr>
            <td>Reuters</td>
            <td>Lynx Insight</td>
            <td>Data Analysis</td>
            <td>2018</td>
          </tr>
          <tr>
            <td>Bloomberg</td>
            <td>Cyborg</td>
            <td>Financial News</td>
            <td>2019</td>
          </tr>
          <tr>
            <td>BBC</td>
            <td>Juicer</td>
            <td>Content Discovery</td>
            <td>2020</td>
          </tr>
        </tbody>
      </table>

      <h2>Technical Implementation</h2>

      <p>For developers and technical teams looking to integrate AI into their newsroom workflows, here's a simplified example of how modern AI APIs can be used for content generation:</p>

      <pre><code class="language-javascript">// Example: AI-assisted article summarization
import { OpenAI } from 'openai';

async function generateSummary(articleText) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "You are a professional journalist. Summarize articles concisely while maintaining key facts."
      },
      {
        role: "user",
        content: \`Summarize this article in 2-3 sentences: \${articleText}\`
      }
    ],
    temperature: 0.3,
    max_tokens: 150
  });

  return response.choices[0].message.content;
}

// Usage
const summary = await generateSummary(longArticle);
console.log(summary);</code></pre>

      <p>This code demonstrates a basic implementation, but production systems require much more sophisticated pipelines including fact-checking, bias detection, and human oversight.</p>

      <h2>Visual Evidence: The AI Newsroom</h2>

      <p>Modern AI-powered newsrooms look very different from traditional setups. Here's what a typical workflow looks like:</p>

      <figure>
        <img src="https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1200" alt="Modern newsroom with AI tools" style="width: 100%; border-radius: var(--radius-lg);" />
        <figcaption>A modern newsroom equipped with AI-powered tools and real-time analytics dashboards</figcaption>
      </figure>

      <h3>Case Study: The Guardian's AI Experiments</h3>

      <p>The Guardian has been at the forefront of ethical AI adoption. Their approach includes:</p>

      <ol>
        <li><strong>Transparency First:</strong> All AI-generated or AI-assisted content is clearly labeled</li>
        <li><strong>Human Oversight:</strong> Every piece goes through editorial review</li>
        <li><strong>Bias Monitoring:</strong> Regular audits of AI outputs for demographic and political bias</li>
        <li><strong>Reader Feedback:</strong> Active solicitation of reader concerns about AI use</li>
      </ol>

      <blockquote>"We see AI as a tool that amplifies human judgment, not replaces it. Our readers deserve to know when and how we use these technologies." - Katharine Viner, Editor-in-Chief, The Guardian</blockquote>

      <h2>The Ethical Challenges</h2>

      <p>The integration of AI into journalism raises profound ethical questions that the industry is still grappling with. These challenges span technical, philosophical, and practical domains.</p>

      <h3>Bias and Representation</h3>

      <p>AI models are trained on existing text, which means they inherit the biases present in that training data. A 2024 study by MIT found that major language models showed significant bias in political coverage:</p>

      <ul>
        <li>Conservative viewpoints were underrepresented in generated summaries by 23%</li>
        <li>Stories about women in leadership were 31% more likely to mention appearance</li>
        <li>Coverage of developing nations focused disproportionately on conflict (67% vs 34% for developed nations)</li>
        <li>Economic stories favored corporate perspectives over labor perspectives 3:1</li>
      </ul>

      <p>These biases aren't intentional, but they're real and consequential. Newsrooms must actively work to identify and correct them.</p>

      <h3>The Misinformation Problem</h3>

      <p>Perhaps the most serious concern is AI's potential to generate convincing misinformation at scale. Modern language models can:</p>

      <blockquote class="warning">"Generate fake news articles that are indistinguishable from real journalism to most readers. We're in an arms race between AI-generated misinformation and AI-powered fact-checking." - Claire Wardle, Co-Director, First Draft News</blockquote>

      <h2>Social Media Perspective</h2>

      <p>Industry leaders are weighing in on these developments. Here's what some are saying:</p>

      <div style="margin: 2.5rem 0; display: flex; justify-content: center;">
        <blockquote class="twitter-tweet"><p lang="en" dir="ltr">Made with <a href="https://twitter.com/grok?ref_src=twsrc%5Etfw">@Grok</a> Imagine<br/> <a href="https://t.co/s01GFu06gU">pic.twitter.com/s01GFu06gU</a></p>&mdash; Elon Musk (@elonmusk) <a href="https://twitter.com/elonmusk/status/2008185010491437087?ref_src=twsrc%5Etfw">January 5, 2026</a></blockquote>
      </div>

      <h2>Image Gallery: AI Tools in Action</h2>

      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; margin: 2.5rem 0;">
        <figure>
          <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800" alt="Data visualization dashboard" style="width: 100%; border-radius: var(--radius-md);" />
          <figcaption>AI-powered data analysis dashboard</figcaption>
        </figure>
        <figure>
          <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800" alt="Content management system" style="width: 100%; border-radius: var(--radius-md);" />
          <figcaption>Modern CMS with AI integration</figcaption>
        </figure>
      </div>

      <h2>The Economic Impact</h2>

      <p>The financial implications of AI in journalism are complex and multifaceted. While automation can reduce costs, it also requires significant upfront investment.</p>

      <h3>Cost-Benefit Analysis</h3>

      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Traditional Approach</th>
            <th>AI-Assisted Approach</th>
            <th>Savings</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Breaking News Coverage</td>
            <td>$500/article</td>
            <td>$50/article</td>
            <td>90%</td>
          </tr>
          <tr>
            <td>Data Analysis</td>
            <td>8 hours/story</td>
            <td>30 minutes/story</td>
            <td>94%</td>
          </tr>
          <tr>
            <td>Fact Checking</td>
            <td>4 hours/article</td>
            <td>1 hour/article</td>
            <td>75%</td>
          </tr>
          <tr>
            <td>Translation</td>
            <td>$0.12/word</td>
            <td>$0.02/word</td>
            <td>83%</td>
          </tr>
        </tbody>
      </table>

      <p>However, these savings must be balanced against the costs of AI infrastructure, training, and the critical need for human oversight.</p>

      <h2>Best Practices for AI Integration</h2>

      <p>Based on interviews with dozens of newsrooms, here are the emerging best practices:</p>

      <h3>1. Transparency is Non-Negotiable</h3>
      <p>Readers must always know when AI has been involved in creating content. This includes:</p>
      <ul>
        <li>Clear labeling of AI-generated content</li>
        <li>Disclosure of AI tools used in research and analysis</li>
        <li>Explanation of how AI recommendations influence editorial decisions</li>
      </ul>

      <h3>2. Human Oversight at Every Stage</h3>
      <p>AI should augment, not replace, human judgment. Every newsroom we studied maintains strict human review processes.</p>

      <h3>3. Continuous Bias Monitoring</h3>
      <p>Regular audits of AI outputs are essential. This includes:</p>

      <pre><code class="language-python"># Example: Simple bias detection
import pandas as pd
from collections import Counter

def analyze_source_diversity(articles):
    """Analyze diversity of sources quoted in AI-generated articles"""
    sources = []
    for article in articles:
        sources.extend(article['quoted_sources'])
    
    # Analyze gender distribution
    gender_dist = Counter([s['gender'] for s in sources])
    
    # Analyze expertise distribution
    expertise_dist = Counter([s['expertise'] for s in sources])
    
    return {
        'gender_balance': gender_dist,
        'expertise_diversity': expertise_dist,
        'total_sources': len(sources)
    }

# Flag articles with poor diversity
results = analyze_source_diversity(ai_articles)
if results['gender_balance']['female'] < 0.3:
    print("WARNING: Low female source representation")</code></pre>

      <h3>4. Investment in Training</h3>
      <p>Journalists need to understand both the capabilities and limitations of AI tools. This requires ongoing education and training programs.</p>

      <h2>Looking Ahead: The Next 5 Years</h2>

      <p>Industry experts predict several major developments in the near future:</p>

      <blockquote>"By 2030, I expect AI will be involved in some capacity in 80% of published journalism. But the successful newsrooms will be those that use AI to free up journalists for deeper, more meaningful work—not those that use it to replace journalists entirely." - Emily Bell, Director, Tow Center for Digital Journalism</blockquote>

      <h3>Emerging Trends</h3>
      <ol>
        <li><strong>Personalized News:</strong> AI-curated news feeds tailored to individual interests while avoiding filter bubbles</li>
        <li><strong>Real-time Fact-Checking:</strong> AI systems that can verify claims as articles are being written</li>
        <li><strong>Multimodal Journalism:</strong> AI tools that seamlessly integrate text, video, audio, and interactive elements</li>
        <li><strong>Predictive Reporting:</strong> AI models that identify emerging stories before they break</li>
        <li><strong>Automated Accessibility:</strong> Instant translation, audio descriptions, and simplified versions for all content</li>
      </ol>

      <h2>Conclusion</h2>

      <p>The integration of AI into journalism is not a question of if, but how. The technology offers tremendous potential to enhance reporting, reduce costs, and serve audiences better. But it also poses serious risks to accuracy, fairness, and the very nature of journalistic work.</p>

      <p>The newsrooms that will thrive in this new era are those that embrace AI thoughtfully—using it to amplify human capabilities while maintaining the core values of journalism: accuracy, fairness, independence, and accountability.</p>

      <p>As we move forward, the industry must remain vigilant about bias, transparent about AI use, and committed to human oversight. The future of journalism depends on getting this balance right.</p>

      <p><em>This article is part of our ongoing series on technology and media. For more insights, subscribe to our newsletter or follow us on social media.</em></p>
    `
  };

  // Highlight code blocks and add copy buttons after component mounts
  useEffect(() => {
    Prism.highlightAll();

    // Add copy buttons to all code blocks
    const codeBlocks = document.querySelectorAll('pre');
    codeBlocks.forEach((block) => {
      // Skip if copy button already exists
      if (block.querySelector('.copy-button')) return;

      const button = document.createElement('button');
      button.className = 'copy-button';
      button.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
        <span>Copy</span>
      `;

      button.addEventListener('click', async () => {
        const code = block.querySelector('code');
        if (code) {
          await navigator.clipboard.writeText(code.textContent || '');
          button.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Copied!</span>
          `;
          setTimeout(() => {
            button.innerHTML = `
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              <span>Copy</span>
            `;
          }, 2000);
        }
      });

      block.style.position = 'relative';
      block.appendChild(button);
    });
  }, []);

  return (
    <>
      <ReadingProgressBar />
      <Script async src="https://platform.twitter.com/widgets.js" charSet="utf-8" />
      <style jsx global>{`
                .article-content h2 {
                    font-size: 2rem;
                    font-weight: 700;
                    margin: 3rem 0 1.5rem;
                    line-height: 1.2;
                }
                .article-content h3 {
                    font-size: 1.5rem;
                    font-weight: 600;
                    margin: 2.5rem 0 1rem;
                    line-height: 1.3;
                }
                .article-content p {
                    margin-bottom: 1.5rem;
                }
                .article-content ul, .article-content ol {
                    margin: 1.5rem 0;
                    padding-left: 2rem;
                }
                .article-content li {
                    margin-bottom: 0.8rem;
                    line-height: 1.8;
                }
                .article-content blockquote {
                    margin: 2.5rem 0;
                    padding: 1.5rem 2rem;
                    border-left: 4px solid var(--accent);
                    background: var(--bg-secondary);
                    border-radius: var(--radius-sm);
                    font-style: italic;
                    font-size: 1.1rem;
                    color: var(--text-secondary);
                }
                .article-content blockquote.warning {
                    border-left-color: #f59e0b;
                    background: rgba(245, 158, 11, 0.1);
                }
                .article-content table {
                    width: 100%;
                    margin: 2rem 0;
                    border-collapse: collapse;
                    border-radius: var(--radius-md);
                    overflow: hidden;
                    box-shadow: var(--shadow-sm);
                }
                .article-content table thead {
                    background: var(--bg-tertiary);
                }
                .article-content table th {
                    padding: 1rem 1.5rem;
                    text-align: left;
                    font-weight: 600;
                    border-bottom: 2px solid var(--border);
                }
                .article-content table td {
                    padding: 1rem 1.5rem;
                    border-bottom: 1px solid var(--border);
                }
                .article-content table tbody tr:last-child td {
                    border-bottom: none;
                }
                .article-content table tbody tr:hover {
                    background: var(--bg-secondary);
                }
                .article-content pre {
                    margin: 2rem 0 !important;
                    padding: 1.5rem !important;
                    border-radius: var(--radius-md) !important;
                    overflow-x: auto;
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                    position: relative;
                }
                
                /* Copy button styles */
                .copy-button {
                    position: absolute;
                    top: 0.75rem;
                    right: 0.75rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 0.75rem;
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: var(--radius-sm);
                    color: #fff;
                    font-size: 0.85rem;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    backdrop-filter: blur(10px);
                }
                .copy-button:hover {
                    background: rgba(255, 255, 255, 0.2);
                    border-color: rgba(255, 255, 255, 0.3);
                }
                .copy-button svg {
                    flex-shrink: 0;
                }
                
                .article-content code {
                    font-family: 'Fira Code', 'Monaco', 'Courier New', monospace;
                    font-size: 0.9em;
                }
                .article-content :not(pre) > code {
                    background: var(--bg-tertiary);
                    color: var(--accent);
                    padding: 0.2em 0.4em;
                    border-radius: 3px;
                    font-size: 0.85em;
                }
                .article-content pre code {
                    display: block;
                    line-height: 1.6;
                }
                
                /* Image captions */
                .article-content img {
                    display: block;
                    margin: 2rem auto;
                }
                .article-content figure {
                    margin: 2rem 0;
                }
                .article-content figcaption {
                    text-align: center;
                    font-size: 0.9rem;
                    color: var(--text-muted);
                    font-style: italic;
                    margin-top: 0.75rem;
                    line-height: 1.5;
                }
                .article-content .embed-container {
                    position: relative;
                    padding-bottom: 56.25%;
                    height: 0;
                    overflow: hidden;
                    margin: 2.5rem 0;
                    border-radius: var(--radius-lg);
                }
                .article-content .embed-container iframe {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                }
                .article-content strong {
                    font-weight: 600;
                    color: var(--text-primary);
                }
                .article-content em {
                    font-style: italic;
                    color: var(--text-secondary);
                }
            `}</style>
      <div className="container" style={{ maxWidth: "800px", paddingTop: "2rem" }}>
        <Breadcrumbs items={[
          { label: article.category, href: `/category/${article.category.toLowerCase()}` },
          { label: "Article" }
        ]} />

        <article>
          <span style={{
            color: "var(--accent)",
            fontWeight: "600",
            fontSize: "0.9rem",
            textTransform: "uppercase",
            letterSpacing: "1px"
          }}>
            {article.category}
          </span>
          <h1 style={{ fontSize: "3rem", marginTop: "1rem", marginBottom: "1.5rem", lineHeight: "1.1" }}>
            {article.title}
          </h1>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "3rem" }}>
            <img
              src={article.author.avatar}
              alt={article.author.name}
              style={{ width: "48px", height: "48px", borderRadius: "50%" }}
            />
            <div>
              <div style={{ fontWeight: "600" }}>{article.author.name}</div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{article.date} • 6 min read</div>
            </div>
          </div>

          <img
            src={article.image}
            alt={article.title}
            style={{ width: "100%", borderRadius: "var(--radius-lg)", marginBottom: "3rem" }}
          />

          <div
            className="article-content"
            style={{ fontSize: "1.15rem", lineHeight: "1.8", color: "var(--text-primary)" }}
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </article>

        <AuthorBio author={article.author} />

        {/* Newsletter Placeholder */}
        <section style={{ marginTop: "5rem", textAlign: "center", padding: "4rem 0", borderTop: "1px solid var(--border)" }}>
          <h3 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Stay Informed</h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>Get our top stories delivered directly to your inbox.</p>
          <div style={{ display: "flex", gap: "0.5rem", maxWidth: "400px", margin: "0 auto" }}>
            <input type="email" placeholder="Email address" style={{
              flex: 1,
              padding: "0.8rem",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border)"
            }} />
            <button className="btn btn-primary">Subscribe</button>
          </div>
        </section>
      </div>
    </>
  );
}
