import { ReactNode } from "react";

type LayoutProps = {
  children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 bg-blue-500 text-white">英語学習 AI</header>
      <main className="flex-1 p-4">{children}</main>
      <footer className="p-4 bg-gray-800 text-white text-center">© 2025</footer>
    </div>
  );
};

export default Layout;
