import "./globals.css";

export const metadata = {
  title: "BCS Owner",
  description: "Business Control System - Owner Console",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}
