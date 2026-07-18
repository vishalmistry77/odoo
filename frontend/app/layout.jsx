import '../src/index.css';

export const metadata = {
  title: 'RentFlow',
  description: 'Rental management platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
