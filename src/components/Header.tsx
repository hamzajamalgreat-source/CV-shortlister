import { Moon, Sun, Upload } from 'lucide-react';
import { FC } from 'react';

interface HeaderProps {
  theme: string;
  onThemeToggle: () => void;
  onUploadClick?: () => void;
}

const Header: FC<HeaderProps> = ({ theme, onThemeToggle, onUploadClick }) => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-[#0a0e27] border-b border-[#2a2d4a] z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <span className="text-white font-bold text-xl">?</span>
          </div>
          <span className="text-white font-bold text-lg">ResumeAI</span>
        </div>

        <nav className="flex items-center gap-6 text-sm">
          <a href="#" className="text-gray-300 hover:text-white">Upload</a>
          <a href="#" className="text-gray-300 hover:text-white">History</a>
          <a href="#" className="flex items-center gap-2 text-gray-300 hover:text-white">
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            Blacklist
          </a>
        </nav>

        <div className="flex items-center gap-4">
          <button onClick={onThemeToggle} className="p-2 rounded-lg bg-[#1a1d3a] hover:bg-[#2a2d4a]">
            {theme === 'dark' ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-gray-400" />}
          </button>
          <button onClick={onUploadClick} className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold flex items-center gap-2">
            <Upload size={16} />
            Upload CVs
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
