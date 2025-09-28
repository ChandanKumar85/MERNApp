import Link from 'next/link';
import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="bg-purple-900 p-5 text-center text-white">
          <nav className="flex gap-4 justify-between">
            <Link href={'/'}>Home</Link>
            <div className="flex gap-4">
              <Link href={'/dashboard'}>Dashboard</Link>
              <Link href={'/register'}>Register</Link>
            </div>
          </nav>
        </header>
        <main className="h-[82vh]">{children}</main>
        <footer className="bg-black p-5 text-center text-white">Footer</footer>
      </body>
    </html>
  );
}
