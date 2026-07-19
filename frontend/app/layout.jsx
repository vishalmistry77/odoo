import '../src/index.css';
import Providers from './providers';

export const metadata = {
  title: 'RentFlow',
  description: 'Rental management platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body><Providers>{children}</Providers></body>
    </html>
  );
}
