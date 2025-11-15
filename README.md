# AI Workbench

AI stack for rapid project integration and DevOps automation. This is a minimal Next.js + TypeScript project configured for Vercel deployment with integrated AI capabilities through Dify and Supabase.

## 🚀 Features

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Dify Integration** for AI workflow orchestration
- **Supabase** for backend services (database, auth, real-time)
- **Vercel-ready** deployment configuration
- **AI Video Generation** from GitHub Issues/PRs (NEW!)

## 📁 Project Structure

```
ai-workbench/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── workflows/             # Automation workflows
│   └── video-generator/   # AI video generation from Issues/PRs
│       ├── scripts/       # Core generation scripts
│       ├── templates/     # Video templates
│       ├── config/        # Configuration files
│       ├── README.md      # Video generation docs
│       └── SETUP.md       # Setup guide
├── ai-stack/              # AI integration examples
│   ├── README.md          # Phase 1 architecture docs
│   ├── dify/              # Dify workflow integration
│   │   ├── README.md
│   │   ├── example-workflow.json
│   │   └── client-example.ts
│   └── supabase/          # Supabase setup
│       ├── README.md
│       ├── schema.sql
│       └── client-example.ts
├── public/                # Static assets
├── .env.example           # Environment variables template
├── vercel.json            # Vercel deployment config
└── package.json           # Dependencies and scripts
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Dify account (optional, for AI features)
- Supabase account (optional, for backend features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/tuya-3/ai-workbench.git
   cd ai-workbench
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` and add your Dify and Supabase credentials.

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run generate-video` - Generate AI video from Issue/PR

## 🌐 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Configure environment variables in Vercel dashboard
4. Deploy!

Vercel will automatically detect the Next.js configuration and deploy your application.

### Manual Deployment

```bash
npm run build
npm run start
```

## 🤖 AI Stack Integration

This project includes examples for integrating AI capabilities:

### Dify Integration
- AI workflow orchestration
- LLM management
- Conversation handling
- See `/ai-stack/dify/` for examples

### Supabase Integration
- PostgreSQL database
- Authentication & authorization
- Real-time subscriptions
- File storage
- See `/ai-stack/supabase/` for examples

For detailed architecture information, see [ai-stack/README.md](ai-stack/README.md).

## 🎬 AI Video Generation

Automatically generate technical explanation videos from GitHub Issues and Pull Requests using AI:

### Quick Start

1. **Manual generation**:
   ```bash
   npm run generate-video -- --issue 6
   ```

2. **Automated via GitHub Actions**:
   - Add the label `generate-video` to any Issue or PR
   - A video will be automatically generated and uploaded to YouTube
   - The video link will be posted as a comment

### Features

- 🤖 **AI Script Generation**: GPT-4 converts Issue/PR content into engaging video scripts
- 🎙️ **Natural Narration**: OpenAI TTS creates high-quality voice-over
- 🎨 **Visual Slides**: Automatic slide generation with code snippets and diagrams
- 🎬 **Video Composition**: FFmpeg combines audio and visuals into polished videos
- 📤 **Auto Upload**: Direct upload to YouTube with metadata
- 💬 **GitHub Integration**: Posts video links back to the source Issue/PR

### Documentation

- [Video Generator README](workflows/video-generator/README.md) - Complete documentation
- [Setup Guide](workflows/video-generator/SETUP.md) - Step-by-step setup instructions
- [Example Videos](workflows/video-generator/README.md#examples) - See what it can create

### Cost

Approximately **$0.10 per 10-minute video** (OpenAI GPT-4 + TTS)


## 📚 Documentation

- [Phase 1 Architecture](ai-stack/README.md)
- [Dify Integration Guide](ai-stack/dify/README.md)
- [Supabase Setup Guide](ai-stack/supabase/README.md)
- [Next.js Documentation](https://nextjs.org/docs)

## 🔐 Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
# Dify
NEXT_PUBLIC_DIFY_API_URL=https://api.dify.ai/v1
DIFY_API_KEY=your_api_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Video Generation (optional - for AI video from Issues/PRs)
OPENAI_API_KEY=your_openai_key
GITHUB_TOKEN=your_github_token
YOUTUBE_CLIENT_ID=your_youtube_client_id
YOUTUBE_CLIENT_SECRET=your_youtube_client_secret
YOUTUBE_REFRESH_TOKEN=your_youtube_refresh_token
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, please open an issue in the GitHub repository.
