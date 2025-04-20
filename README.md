# VidConvert

A modern web application for managing and converting videos directly from your FTP server.

## Features

- Browse FTP server directly in the browser
- Play videos in the browser with a custom video player
- Convert videos to various formats
- Manage files with rename, move, copy and delete operations
- Monitor conversion progress

## Technology Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Shadcn UI

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/dipankarhandique340/vidconvert.git
   cd vidconvert
   ```

2. Install dependencies:
   ```
   npm install
   # or
   yarn install
   ```

3. Create an `.env` file with your FTP settings:
   ```
   FTP_HOST=your-ftp-server.com
   FTP_USER=username
   FTP_PASSWORD=password
   FTP_PORT=21
   ```

4. Start the development server:
   ```
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## License

MIT
