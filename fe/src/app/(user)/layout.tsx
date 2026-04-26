import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";
import { Providers } from "../../components/Providers";
import Chatbot from "../../components/common/Chatbot";

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Providers>
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <Chatbot />
    </Providers>
  );
}
