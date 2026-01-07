// Article data with rich Editor.js-style content
export const articles: Record<string, any> = {
  "h1": {
    id: "h1",
    title: "The Silent Revolution: How Private Space Agencies are Overtaking National Programs",
    excerpt: "From reusable rockets to orbital hotels, the final frontier is becoming a commercial playground faster than anyone anticipated.",
    category: "Tech",
    author: {
      name: "James Miller",
      bio: "James is an aerospace journalist with a decade of experience covering the commercial space industry and its rapid evolution.",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256"
    },
    date: "Dec 20, 2025",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200",
    content: `
      <p>The landscape of space exploration has fundamentally shifted. What was once the exclusive domain of government agencies like NASA and Roscosmos is now a bustling marketplace of private enterprise, innovation, and competition.</p>

      <h2>The New Space Race</h2>
      <p>Companies like SpaceX, Blue Origin, and Rocket Lab have not only caught up to traditional space agencies—they've surpassed them in key metrics. Reusable rockets, once a pipe dream, are now routine. Launch costs have plummeted from $65,000 per kilogram to under $1,500.</p>

      <blockquote>"We're not just launching satellites anymore. We're building the infrastructure for a multi-planetary civilization." - Elon Musk, SpaceX CEO</blockquote>

      <h3>Key Milestones</h3>
      <table>
        <thead>
          <tr>
            <th>Year</th>
            <th>Achievement</th>
            <th>Company</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>2015</td>
            <td>First Orbital Rocket Landing</td>
            <td>SpaceX</td>
          </tr>
          <tr>
            <td>2020</td>
            <td>First Commercial Crew Mission</td>
            <td>SpaceX</td>
          </tr>
          <tr>
            <td>2023</td>
            <td>First Private Space Station Module</td>
            <td>Axiom Space</td>
          </tr>
          <tr>
            <td>2025</td>
            <td>First Orbital Hotel Booking</td>
            <td>Orbital Assembly</td>
          </tr>
        </tbody>
      </table>

      <p>The implications are staggering. Within the next decade, we could see permanent human settlements on the Moon, regular tourist flights to orbit, and even the first crewed missions to Mars—all led by private companies.</p>

      <h3>The Economic Impact</h3>
      <p>The space economy is projected to reach $1 trillion by 2030. This growth is driven by:</p>
      <ul>
        <li>Satellite internet constellations serving billions</li>
        <li>Space-based manufacturing in microgravity</li>
        <li>Asteroid mining operations</li>
        <li>Space tourism and orbital hotels</li>
      </ul>

      <p>As traditional space agencies pivot to regulatory and scientific roles, private companies are writing the next chapter of human spaceflight. The question is no longer <em>if</em> we'll become a spacefaring civilization, but <em>when</em>.</p>
    `
  },
  "h2": {
    id: "h2",
    title: "Quantum Computing: Breaking the Unbreakable Cryptography",
    excerpt: "Researchers achieve new milestone in quantum supremacy, threatening the very foundations of digital security.",
    category: "Tech",
    author: {
      name: "Dr. Elena Vance",
      bio: "Elena is a quantum physicist and science communicator specializing in emerging computing technologies.",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=facearea&facepad=2&w=256"
    },
    date: "Dec 18, 2025",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=1200",
    content: `
      <p>In a breakthrough that has sent shockwaves through the cybersecurity community, researchers at Google's Quantum AI lab have demonstrated a quantum computer capable of breaking RSA-2048 encryption in under 8 hours.</p>

      <h2>The Quantum Threat</h2>
      <p>For decades, RSA encryption has been the bedrock of digital security. From banking transactions to government communications, it protects the most sensitive data on the planet. Until now.</p>

      <blockquote>"This isn't a theoretical threat anymore. It's here, and we need to act fast." - Bruce Schneier, Cryptographer</blockquote>

      <h3>How It Works</h3>
      <p>Quantum computers leverage the principles of superposition and entanglement to perform calculations that would take classical computers millennia:</p>

      <pre><code class="language-python"># Simplified Shor's Algorithm
def quantum_factor(N):
    # Initialize quantum register
    qubits = create_superposition(N)
    
    # Apply quantum Fourier transform
    qft = quantum_fourier_transform(qubits)
    
    # Measure and extract factors
    factors = measure_and_collapse(qft)
    return factors</code></pre>

      <h3>The Race for Post-Quantum Cryptography</h3>
      <p>Governments and tech companies are scrambling to develop quantum-resistant algorithms:</p>
      <ul>
        <li><strong>Lattice-based cryptography:</strong> Using complex mathematical lattices</li>
        <li><strong>Hash-based signatures:</strong> Leveraging one-way hash functions</li>
        <li><strong>Multivariate cryptography:</strong> Systems of polynomial equations</li>
      </ul>

      <p>The National Institute of Standards and Technology (NIST) has already begun standardizing post-quantum algorithms, with full deployment expected by 2030.</p>
    `
  },
  "h3": {
    id: "h3",
    title: "The Architecture of Dreams: Designing the Cities of 2050",
    excerpt: "Vertical forests, modular transit, and self-healing materials: how tomorrow's architects are solving the urban crisis.",
    category: "Lifestyle",
    author: {
      name: "Marcello Rossi",
      bio: "Marcello is an urban planning expert and architectural critic based in Milan.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256"
    },
    date: "Dec 15, 2025",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200",
    content: `
      <p>As urban populations swell and climate change accelerates, architects are reimagining the very fabric of our cities. The result? A radical vision of sustainable, livable urban spaces that blur the line between nature and infrastructure.</p>

      <h2>Vertical Forests</h2>
      <p>Milan's Bosco Verticale was just the beginning. Now, entire city blocks are being transformed into living, breathing ecosystems.</p>

      <blockquote>"We're not just adding plants to buildings. We're creating microclimates that cool cities, filter air, and provide habitats for urban wildlife." - Stefano Boeri, Architect</blockquote>

      <h3>Key Innovations</h3>
      <ol>
        <li><strong>Self-healing concrete:</strong> Bacteria-infused materials that repair cracks automatically</li>
        <li><strong>Modular construction:</strong> Buildings that can be reconfigured as needs change</li>
        <li><strong>Integrated transit:</strong> Seamless connections between walking, cycling, and public transport</li>
        <li><strong>Energy-positive design:</strong> Buildings that generate more energy than they consume</li>
      </ol>

      <p>These aren't just concepts—they're being built right now in cities from Singapore to Copenhagen, from Dubai to São Paulo.</p>

      <h3>The Social Dimension</h3>
      <p>But technology alone won't save our cities. The most successful projects prioritize community:</p>
      <ul>
        <li>Mixed-income housing to prevent gentrification</li>
        <li>Public spaces designed for gathering and play</li>
        <li>Local food production through urban farming</li>
        <li>Accessible design for all ages and abilities</li>
      </ul>

      <p>The cities of 2050 won't just be smarter—they'll be more human.</p>
    `
  },
  "1": {
    id: "1",
    title: "Apple's Secret AR Project Revealed: The End of Screens",
    excerpt: "New leaks suggest a revolutionary interface that bypasses traditional screens entirely.",
    category: "Tech",
    author: {
      name: "Sarah Jenkins",
      bio: "Sarah is a veteran tech journalist with over 15 years of experience covering Apple and emerging technologies.",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=256"
    },
    date: "Oct 24, 2025",
    image: "https://images.unsplash.com/photo-1491933382434-500287f9b54b?auto=format&fit=crop&q=80&w=1200",
    content: `
      <p>In a series of leaked patents and insider reports, Apple's most ambitious project yet has come to light: a contact lens-based AR system that could make smartphones obsolete.</p>

      <h2>Beyond Vision Pro</h2>
      <p>While the Vision Pro headset made waves in 2024, it was merely a stepping stone. Apple's true vision involves technology so seamless, it disappears entirely.</p>

      <blockquote>"The best technology is invisible. It should feel like magic, not machinery." - Jony Ive, Former Apple Chief Design Officer</blockquote>

      <h3>Technical Specifications (Leaked)</h3>
      <pre><code class="language-json">{
  "display": {
    "resolution": "8K per eye",
    "refresh_rate": "120Hz",
    "fov": "120 degrees"
  },
  "sensors": {
    "eye_tracking": true,
    "gesture_recognition": true,
    "biometric_auth": "iris_scan"
  },
  "battery": {
    "type": "bio-compatible micro-cell",
    "duration": "18 hours",
    "charging": "wireless_inductive"
  }
}</code></pre>

      <h3>Privacy Concerns</h3>
      <p>With great power comes great responsibility. A device that can record everything you see raises unprecedented privacy questions:</p>
      <ul>
        <li>Who owns the data captured by your eyes?</li>
        <li>Can law enforcement access your visual history?</li>
        <li>How do we prevent unauthorized recording in private spaces?</li>
      </ul>

      <p>Apple has reportedly filed over 200 patents related to privacy-preserving AR technology, including on-device processing and encrypted visual memory. Industry analysts predict a 2027 launch, with initial pricing around $2,999.</p>
    `
  },
  "5": {
    id: "5",
    title: "Crisis in the Mediterranean: A New Refugee Policy",
    excerpt: "EU leaders gather to discuss a controversial plan for maritime security.",
    category: "World",
    author: {
      name: "Hans Mueller",
      bio: "Hans is a foreign correspondent specializing in European politics and international migration issues.",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256"
    },
    date: "Oct 24, 2025",
    image: "https://images.unsplash.com/photo-1549413248-cb5800f40f06?auto=format&fit=crop&q=80&w=1200",
    content: `
      <p>As Mediterranean crossings reach record highs, European Union leaders convened in Brussels for emergency talks on a comprehensive migration framework that balances humanitarian obligations with border security.</p>

      <h2>The Numbers Tell a Story</h2>
      <p>In 2025 alone, over 250,000 migrants attempted the dangerous Mediterranean crossing, with tragic consequences.</p>

      <table>
        <thead>
          <tr>
            <th>Year</th>
            <th>Arrivals</th>
            <th>Fatalities</th>
            <th>Rescue Operations</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>2023</td>
            <td>186,000</td>
            <td>2,498</td>
            <td>1,240</td>
          </tr>
          <tr>
            <td>2024</td>
            <td>221,000</td>
            <td>2,876</td>
            <td>1,580</td>
          </tr>
          <tr>
            <td>2025</td>
            <td>250,000+</td>
            <td>3,100+</td>
            <td>1,920+</td>
          </tr>
        </tbody>
      </table>

      <h3>The Proposed Framework</h3>
      <p>The new policy includes several controversial measures:</p>
      <ol>
        <li><strong>Offshore Processing Centers:</strong> Asylum claims processed in North African partner nations</li>
        <li><strong>Burden Sharing:</strong> Mandatory quotas for refugee resettlement across EU states</li>
        <li><strong>Enhanced Patrols:</strong> Joint EU naval operations to prevent departures</li>
        <li><strong>Development Aid:</strong> €10 billion fund for origin countries to address root causes</li>
      </ol>

      <blockquote>"We must find a solution that upholds our values while protecting our borders. These are not mutually exclusive goals." - Ursula von der Leyen, European Commission President</blockquote>

      <h3>Human Rights Concerns</h3>
      <p>NGOs and human rights organizations have raised alarms about the offshore processing model:</p>

      <blockquote class="warning">"Externalizing asylum processing to countries with questionable human rights records is a dangerous precedent." - Amnesty International</blockquote>

      <p><em>This is a developing story. Updates will be posted as negotiations continue.</em></p>
    `
  }
};

// Generate simple fallback articles for remaining IDs
const simpleArticleIds = [2, 3, 4, 6, 7, 8, 9, 10, 11];
simpleArticleIds.forEach(id => {
  articles[id.toString()] = {
    id: id.toString(),
    title: `Article ${id}: Coming Soon`,
    excerpt: "This article is currently being written. Check back soon for the full story.",
    category: id <= 4 ? "Tech" : id <= 8 ? "World" : "Lifestyle",
    author: {
      name: "Editorial Team",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256"
    },
    date: "Oct 2025",
    image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1200",
    content: `
      <p>This article is currently being developed. Our editorial team is working on bringing you comprehensive coverage of this important story.</p>
      <p>In the meantime, explore our other featured articles for the latest news and insights.</p>
    `
  };
});
