const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const dotenv = require("dotenv")

// Load environment variables
dotenv.config()

// Import models
const User = require("./models/User")
const Category = require("./models/Category")
const Blog = require("./models/Blog")

// Sample data
const categories = [
  {
    name: "Technology",
    slug: "technology",
    description: "Latest trends and updates in technology world",
    color: "#3498db",
  },
  {
    name: "Web Development",
    slug: "web-development",
    description: "Frontend, backend, and fullstack development tutorials",
    color: "#e74c3c",
  },
  {
    name: "Programming",
    slug: "programming",
    description: "Programming languages, tips, and best practices",
    color: "#9b59b6",
  },
  {
    name: "AI & Machine Learning",
    slug: "ai-machine-learning",
    description: "Artificial Intelligence and Machine Learning insights",
    color: "#f39c12",
  },
  {
    name: "Mobile Development",
    slug: "mobile-development",
    description: "iOS, Android, and cross-platform mobile app development",
    color: "#2ecc71",
  },
  {
    name: "DevOps",
    slug: "devops",
    description: "Development operations, CI/CD, and deployment strategies",
    color: "#1abc9c",
  },
]

const blogs = [
  {
    title: "Getting Started with React: A Comprehensive Guide",
    slug: "getting-started-with-react-comprehensive-guide",
    content: `
      <h2>Introduction to React</h2>
      <p>React is a popular JavaScript library for building user interfaces, particularly web applications. Developed by Facebook, it has become one of the most widely used frontend frameworks in the industry.</p>
      
      <h3>Why Choose React?</h3>
      <ul>
        <li><strong>Component-Based Architecture:</strong> React allows you to build encapsulated components that manage their own state.</li>
        <li><strong>Virtual DOM:</strong> React uses a virtual DOM to improve performance by minimizing expensive DOM manipulations.</li>
        <li><strong>Large Community:</strong> With extensive community support, finding solutions and resources is easier.</li>
        <li><strong>Flexibility:</strong> React can be integrated into existing projects gradually.</li>
      </ul>
      
      <h3>Setting Up Your First React App</h3>
      <p>To get started with React, you can use Create React App, which sets up a modern web app by running one command:</p>
      <pre><code>npx create-react-app my-app
cd my-app
npm start</code></pre>
      
      <h3>Your First Component</h3>
      <p>Here's a simple React component example:</p>
      <pre><code>function Welcome({ name }) {
  return &lt;h1&gt;Hello, {name}!&lt;/h1&gt;;
}</code></pre>
      
      <p>This guide will help you understand the basics and get you started on your React journey!</p>
    `,
    excerpt: "Learn the fundamentals of React, from setup to creating your first components. Perfect for beginners starting their frontend development journey.",
    tags: ["react", "javascript", "frontend", "tutorial", "beginners"],
    status: "published",
    category: "Web Development",
  },
  {
    title: "The Future of AI: Trends to Watch in 2025",
    slug: "future-of-ai-trends-2025",
    content: `
      <h2>Artificial Intelligence in 2025</h2>
      <p>As we advance through 2025, artificial intelligence continues to reshape industries and daily life. Here are the key trends that are defining the AI landscape this year.</p>
      
      <h3>1. Generative AI Revolution</h3>
      <p>Generative AI has moved beyond text generation to creating sophisticated content across multiple media types:</p>
      <ul>
        <li>Advanced video generation with realistic human avatars</li>
        <li>Code generation that can handle complex software architectures</li>
        <li>Music and audio synthesis for creative industries</li>
        <li>3D model generation for gaming and design</li>
      </ul>
      
      <h3>2. AI-Powered Development Tools</h3>
      <p>Development workflows are being transformed by AI assistants that can:</p>
      <ul>
        <li>Write complete functions based on natural language descriptions</li>
        <li>Debug code and suggest optimizations</li>
        <li>Generate comprehensive test suites</li>
        <li>Provide real-time code reviews</li>
      </ul>
      
      <h3>3. Edge AI and IoT Integration</h3>
      <p>Processing AI workloads directly on devices is becoming more prevalent, enabling:</p>
      <ul>
        <li>Faster response times with reduced latency</li>
        <li>Enhanced privacy by keeping data local</li>
        <li>Reduced bandwidth requirements</li>
        <li>Better reliability in offline scenarios</li>
      </ul>
      
      <h3>4. Ethical AI and Regulation</h3>
      <p>As AI becomes more powerful, focus on ethical implementation grows:</p>
      <ul>
        <li>Bias detection and mitigation tools</li>
        <li>Transparent AI decision-making processes</li>
        <li>Compliance with emerging AI regulations</li>
        <li>Responsible AI development practices</li>
      </ul>
      
      <p>The future of AI is bright, but it requires careful consideration of its impact on society, privacy, and employment.</p>
    `,
    excerpt: "Explore the cutting-edge AI trends shaping 2025, from generative AI breakthroughs to ethical considerations in artificial intelligence development.",
    tags: ["ai", "machine learning", "technology", "trends", "2025", "future"],
    status: "published",
    category: "AI & Machine Learning",
  },
  {
    title: "Modern JavaScript: ES2024 Features You Should Know",
    slug: "modern-javascript-es2024-features",
    content: `
      <h2>JavaScript ES2024: New Features and Improvements</h2>
      <p>JavaScript continues to evolve with ECMAScript 2024 bringing exciting new features that enhance developer productivity and code readability.</p>
      
      <h3>1. Array Grouping Methods</h3>
      <p>New methods for grouping array elements:</p>
      <pre><code>const products = [
  { name: 'Laptop', category: 'Electronics' },
  { name: 'Book', category: 'Education' },
  { name: 'Phone', category: 'Electronics' }
];

// Group by category
const grouped = Object.groupBy(products, item => item.category);
console.log(grouped);
// { Electronics: [...], Education: [...] }</code></pre>
      
      <h3>2. Promise.withResolvers()</h3>
      <p>A cleaner way to create promises with external resolve/reject:</p>
      <pre><code>const { promise, resolve, reject } = Promise.withResolvers();

// Use resolve/reject from outside the promise constructor
setTimeout(() => resolve('Success!'), 1000);</code></pre>
      
      <h3>3. Temporal API (Stage 3)</h3>
      <p>A modern replacement for the Date object:</p>
      <pre><code>import { Temporal } from '@js-temporal/polyfill';

const now = Temporal.Now.plainDateTimeISO();
const birthday = Temporal.PlainDate.from('1990-05-15');
const age = now.toPlainDate().since(birthday).years;</code></pre>
      
      <h3>4. Decorators (Stage 3)</h3>
      <p>Native support for decorators in JavaScript:</p>
      <pre><code>function logged(value, context) {
  return function(...args) {
    console.log(\`Calling \${context.name}\`);
    return value.apply(this, args);
  };
}

class Calculator {
  @logged
  add(a, b) {
    return a + b;
  }
}</code></pre>
      
      <h3>5. Records and Tuples (Proposal)</h3>
      <p>Immutable data structures coming to JavaScript:</p>
      <pre><code>const point = #{ x: 10, y: 20 }; // Record
const coordinates = #[10, 20, 30]; // Tuple

// Immutable by design
const newPoint = #{ ...point, z: 30 };</code></pre>
      
      <p>These features represent JavaScript's commitment to improving developer experience while maintaining backward compatibility.</p>
    `,
    excerpt: "Discover the latest ECMAScript 2024 features that are transforming JavaScript development, including array grouping, Promise improvements, and more.",
    tags: ["javascript", "es2024", "programming", "web development", "features"],
    status: "published",
    category: "Programming",
  },
  {
    title: "Building Scalable Mobile Apps with React Native",
    slug: "building-scalable-mobile-apps-react-native",
    content: `
      <h2>React Native for Scalable Mobile Development</h2>
      <p>React Native has matured into a robust platform for building cross-platform mobile applications. Here's how to architect scalable apps that perform well on both iOS and Android.</p>
      
      <h3>Architecture Patterns for Scale</h3>
      
      <h4>1. Feature-Based Folder Structure</h4>
      <pre><code>src/
  features/
    authentication/
      components/
      hooks/
      services/
      types/
    profile/
      components/
      hooks/
      services/
      types/
  shared/
    components/
    utils/
    constants/</code></pre>
      
      <h4>2. State Management with Zustand</h4>
      <p>Lightweight and scalable state management:</p>
      <pre><code>import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  login: (userData) => set({
    user: userData,
    isAuthenticated: true
  }),
  logout: () => set({
    user: null,
    isAuthenticated: false
  })
}));</code></pre>
      
      <h3>Performance Optimization</h3>
      
      <h4>1. Image Optimization</h4>
      <ul>
        <li>Use React Native Fast Image for better caching</li>
        <li>Implement lazy loading for image lists</li>
        <li>Optimize image sizes for different screen densities</li>
      </ul>
      
      <h4>2. List Performance</h4>
      <pre><code>import { FlashList } from '@shopify/flash-list';

function OptimizedList({ data }) {
  return (
    &lt;FlashList
      data={data}
      renderItem={({ item }) => &lt;ListItem item={item} /&gt;}
      estimatedItemSize={100}
      keyExtractor={(item) => item.id}
    /&gt;
  );
}</code></pre>
      
      <h3>Testing Strategy</h3>
      
      <h4>Unit Tests with Jest</h4>
      <pre><code>import { renderHook, act } from '@testing-library/react-native';
import { useAuthStore } from '../stores/auth';

test('should login user', () => {
  const { result } = renderHook(() => useAuthStore());
  
  act(() => {
    result.current.login({ id: 1, name: 'John' });
  });
  
  expect(result.current.isAuthenticated).toBe(true);
});</code></pre>
      
      <h4>E2E Testing with Detox</h4>
      <pre><code>describe('Login Flow', () => {
  it('should login successfully', async () => {
    await element(by.id('email-input')).typeText('user@example.com');
    await element(by.id('password-input')).typeText('password');
    await element(by.id('login-button')).tap();
    await expect(element(by.id('dashboard'))).toBeVisible();
  });
});</code></pre>
      
      <p>Building scalable React Native apps requires careful planning of architecture, performance optimization, and comprehensive testing strategies.</p>
    `,
    excerpt: "Learn how to build scalable React Native applications with proper architecture patterns, performance optimization, and testing strategies.",
    tags: ["react native", "mobile development", "architecture", "performance", "testing"],
    status: "published",
    category: "Mobile Development",
  },
  {
    title: "DevOps Best Practices: CI/CD Pipeline Setup",
    slug: "devops-best-practices-ci-cd-pipeline-setup",
    content: `
      <h2>Setting Up Robust CI/CD Pipelines</h2>
      <p>Continuous Integration and Continuous Deployment (CI/CD) are essential practices in modern software development. Here's how to set up effective pipelines that improve code quality and deployment reliability.</p>
      
      <h3>CI/CD Pipeline Components</h3>
      
      <h4>1. Source Control Integration</h4>
      <p>Start with proper Git workflow:</p>
      <pre><code># Feature branch workflow
git checkout -b feature/new-functionality
git add .
git commit -m "Add new functionality"
git push origin feature/new-functionality
# Create pull request for review</code></pre>
      
      <h4>2. Automated Testing Pipeline</h4>
      <p>GitHub Actions workflow example:</p>
      <pre><code>name: CI Pipeline
on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Run integration tests
        run: npm run test:integration
      
      - name: Run E2E tests
        run: npm run test:e2e</code></pre>
      
      <h3>Deployment Strategies</h3>
      
      <h4>1. Blue-Green Deployment</h4>
      <ul>
        <li>Maintain two identical production environments</li>
        <li>Deploy to inactive environment (green)</li>
        <li>Switch traffic after validation</li>
        <li>Keep blue environment as immediate rollback option</li>
      </ul>
      
      <h4>2. Rolling Deployment</h4>
      <p>Kubernetes rolling update example:</p>
      <pre><code>apiVersion: apps/v1
kind: Deployment
metadata:
  name: blog-api
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 1
  template:
    spec:
      containers:
      - name: api
        image: blog-api:v2.0.0</code></pre>
      
      <h3>Monitoring and Observability</h3>
      
      <h4>1. Application Metrics</h4>
      <pre><code>const prometheus = require('prom-client');

// Create custom metrics
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status']
});

// Middleware to collect metrics
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .observe(duration);
  });
  
  next();
});</code></pre>
      
      <h4>2. Health Checks</h4>
      <pre><code>app.get('/health', async (req, res) => {
  try {
    // Database health check
    await mongoose.connection.db.admin().ping();
    
    // External service health check
    const redisStatus = await redis.ping();
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        redis: redisStatus === 'PONG' ? 'connected' : 'disconnected'
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});</code></pre>
      
      <h3>Security in CI/CD</h3>
      <ul>
        <li>Store secrets in secure vaults (GitHub Secrets, AWS Secrets Manager)</li>
        <li>Scan dependencies for vulnerabilities</li>
        <li>Implement security testing in pipeline</li>
        <li>Use signed container images</li>
        <li>Apply principle of least privilege</li>
      </ul>
      
      <p>A well-designed CI/CD pipeline is crucial for maintaining high-quality software delivery and reducing deployment risks.</p>
    `,
    excerpt: "Master DevOps practices with comprehensive CI/CD pipeline setup, deployment strategies, monitoring, and security best practices.",
    tags: ["devops", "ci/cd", "deployment", "automation", "monitoring", "docker", "kubernetes"],
    status: "published",
    category: "DevOps",
  },
  {
    title: "Advanced TypeScript Patterns for Better Code",
    slug: "advanced-typescript-patterns-better-code",
    content: `
      <h2>Advanced TypeScript Patterns</h2>
      <p>TypeScript offers powerful type system features that can help write more robust and maintainable code. Let's explore advanced patterns that will level up your TypeScript skills.</p>
      
      <h3>1. Conditional Types</h3>
      <p>Create types that change based on conditions:</p>
      <pre><code>type ApiResponse&lt;T&gt; = T extends string
  ? { message: T }
  : T extends number
  ? { count: T }
  : { data: T };

type StringResponse = ApiResponse&lt;string&gt;;  // { message: string }
type NumberResponse = ApiResponse&lt;number&gt;;  // { count: number }
type ObjectResponse = ApiResponse&lt;User&gt;;    // { data: User }</code></pre>
      
      <h3>2. Mapped Types</h3>
      <p>Transform existing types systematically:</p>
      <pre><code>type Partial&lt;T&gt; = {
  [P in keyof T]?: T[P];
};

type Required&lt;T&gt; = {
  [P in keyof T]-?: T[P];
};

type Readonly&lt;T&gt; = {
  readonly [P in keyof T]: T[P];
};

// Custom mapped type
type Nullable&lt;T&gt; = {
  [P in keyof T]: T[P] | null;
};</code></pre>
      
      <h3>3. Template Literal Types</h3>
      <p>Create string types with patterns:</p>
      <pre><code>type EventNames = 'click' | 'hover' | 'focus';
type EventHandlers = \`on\${Capitalize&lt;EventNames&gt;}\`;
// Result: 'onClick' | 'onHover' | 'onFocus'

type CSSProperties = \`\${string}px\` | \`\${string}%\` | \`\${string}em\`;

interface Style {
  width: CSSProperties;
  height: CSSProperties;
  margin: CSSProperties;
}</code></pre>
      
      <h3>4. Branded Types</h3>
      <p>Create distinct types from primitive types:</p>
      <pre><code>type UserId = string & { readonly brand: unique symbol };
type Email = string & { readonly brand: unique symbol };

function createUserId(id: string): UserId {
  return id as UserId;
}

function createEmail(email: string): Email {
  if (!email.includes('@')) {
    throw new Error('Invalid email');
  }
  return email as Email;
}

function getUser(id: UserId): User {
  // TypeScript ensures only UserId can be passed
  return users.find(user => user.id === id);
}</code></pre>
      
      <h3>5. Builder Pattern with TypeScript</h3>
      <p>Type-safe builder pattern implementation:</p>
      <pre><code>interface QueryBuilder&lt;T = unknown&gt; {
  select&lt;K extends keyof any&gt;(...fields: K[]): QueryBuilder&lt;Pick&lt;T, K&gt;&gt;;
  where&lt;K extends keyof T&gt;(field: K, value: T[K]): QueryBuilder&lt;T&gt;;
  limit(count: number): QueryBuilder&lt;T&gt;;
  execute(): Promise&lt;T[]&gt;;
}

class SQLQueryBuilder&lt;T&gt; implements QueryBuilder&lt;T&gt; {
  private query = '';
  
  select&lt;K extends keyof T&gt;(...fields: K[]) {
    this.query += \`SELECT \${fields.join(', ')} \`;
    return this as QueryBuilder&lt;Pick&lt;T, K&gt;&gt;;
  }
  
  where&lt;K extends keyof T&gt;(field: K, value: T[K]) {
    this.query += \`WHERE \${String(field)} = '\${value}' \`;
    return this;
  }
  
  limit(count: number) {
    this.query += \`LIMIT \${count} \`;
    return this;
  }
  
  async execute(): Promise&lt;T[]&gt; {
    // Execute query logic
    return [];
  }
}

// Usage
const users = await new SQLQueryBuilder&lt;User&gt;()
  .select('id', 'name', 'email')
  .where('isActive', true)
  .limit(10)
  .execute();</code></pre>
      
      <h3>6. Recursive Types</h3>
      <p>Handle nested data structures:</p>
      <pre><code>type JsonValue = 
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

type DeepPartial&lt;T&gt; = {
  [P in keyof T]?: T[P] extends object ? DeepPartial&lt;T[P]&gt; : T[P];
};

type FlattenArray&lt;T&gt; = T extends readonly (infer U)[]
  ? FlattenArray&lt;U&gt;
  : T;</code></pre>
      
      <h3>7. Discriminated Unions</h3>
      <p>Type-safe state management:</p>
      <pre><code>type LoadingState = {
  status: 'loading';
};

type SuccessState = {
  status: 'success';
  data: any;
};

type ErrorState = {
  status: 'error';
  error: string;
};

type AsyncState = LoadingState | SuccessState | ErrorState;

function handleState(state: AsyncState) {
  switch (state.status) {
    case 'loading':
      return 'Loading...';
    case 'success':
      return state.data; // TypeScript knows data exists
    case 'error':
      return \`Error: \${state.error}\`; // TypeScript knows error exists
  }
}</code></pre>
      
      <p>These advanced patterns help create more expressive, type-safe, and maintainable TypeScript code.</p>
    `,
    excerpt: "Explore advanced TypeScript patterns including conditional types, mapped types, branded types, and discriminated unions for better code quality.",
    tags: ["typescript", "programming", "patterns", "types", "advanced"],
    status: "published",
    category: "Programming",
  }
]

// Seed function
async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/blogdb", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log("Connected to MongoDB")

    // Clear existing data
    await User.deleteMany({})
    await Category.deleteMany({})
    await Blog.deleteMany({})
    console.log("Cleared existing data")

    // Create admin user
    const adminUser = new User({
      username: "admin",
      email: "admin@gmail.com",
      password: "admin123", // Will be hashed by the pre-save middleware
      role: "admin",
      avatar: "https://via.placeholder.com/150/4CAF50/FFFFFF?text=Admin",
    })
    await adminUser.save()
    console.log("Admin user created")

    // Create sample regular user
    const regularUser = new User({
      username: "john_doe",
      email: "john@example.com",
      password: "password123",
      role: "user",
      avatar: "https://via.placeholder.com/150/2196F3/FFFFFF?text=User",
    })
    await regularUser.save()
    console.log("Regular user created")

    // Create categories
    const createdCategories = []
    for (const categoryData of categories) {
      const category = new Category(categoryData)
      await category.save()
      createdCategories.push(category)
      console.log(`Category created: ${category.name}`)
    }

    // Create blogs
    for (const blogData of blogs) {
      // Find the category by name
      const category = createdCategories.find(cat => cat.name === blogData.category)
      
      const blog = new Blog({
        ...blogData,
        category: category._id,
        author: adminUser._id,
        views: Math.floor(Math.random() * 1000) + 50, // Random views between 50-1050
        likes: Math.floor(Math.random() * 100) + 5,   // Random likes between 5-105
        publishedAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000), // Random date within last 30 days
        seo: {
          metaTitle: blogData.title,
          metaDescription: blogData.excerpt,
          keywords: blogData.tags,
        },
      })
      
      await blog.save()
      console.log(`Blog created: ${blog.title}`)
    }

    // Create some draft blogs
    const draftBlogs = [
      {
        title: "Understanding Microservices Architecture",
        slug: "understanding-microservices-architecture",
        content: "<p>Draft content for microservices article...</p>",
        excerpt: "A comprehensive guide to microservices architecture patterns and best practices.",
        tags: ["microservices", "architecture", "backend", "scalability"],
        status: "draft",
        category: createdCategories.find(cat => cat.name === "Technology")._id,
        author: adminUser._id,
      },
      {
        title: "GraphQL vs REST: When to Use What",
        slug: "graphql-vs-rest-when-to-use-what",
        content: "<p>Draft content comparing GraphQL and REST APIs...</p>",
        excerpt: "Comparing GraphQL and REST APIs to help you choose the right approach for your project.",
        tags: ["graphql", "rest", "api", "backend"],
        status: "draft",
        category: createdCategories.find(cat => cat.name === "Web Development")._id,
        author: adminUser._id,
      },
    ]

    for (const draftData of draftBlogs) {
      const draft = new Blog(draftData)
      await draft.save()
      console.log(`Draft blog created: ${draft.title}`)
    }

    console.log("\n🎉 Database seeded successfully!")
    console.log("\n📊 Summary:")
    console.log(`👥 Users created: ${await User.countDocuments()}`)
    console.log(`📂 Categories created: ${await Category.countDocuments()}`)
    console.log(`📝 Blogs created: ${await Blog.countDocuments()}`)
    console.log(`   - Published: ${await Blog.countDocuments({ status: 'published' })}`)
    console.log(`   - Drafts: ${await Blog.countDocuments({ status: 'draft' })}`)
    
    console.log("\n🔑 Admin Credentials:")
    console.log("Email: admin@gmail.com")
    console.log("Password: admin123")
    
    console.log("\n👤 Regular User Credentials:")
    console.log("Email: john@example.com")
    console.log("Password: password123")

    process.exit(0)
  } catch (error) {
    console.error("Error seeding database:", error)
    process.exit(1)
  }
}

// Run the seed function
seedDatabase()
