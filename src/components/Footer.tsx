import React from 'react';
import { Github } from 'lucide-react';
import { UI_COLORS } from '../config/constants';

export const Footer: React.FC = () => (
    <footer className="mt-8 pt-6 border-t" style={{ borderColor: UI_COLORS.border }}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm" style={{ color: UI_COLORS.muted }}>
                © 2026 Ryosuke Fujimoto. All Rights Reserved.
            </div>
            <a
                href="https://github.com/ryosuke0121/Realtime-Voice-Changer"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm hover:opacity-80 transition-opacity"
                style={{ color: UI_COLORS.primary }}
            >
                <Github size={18} />
                <span>GitHub Repository</span>
            </a>
        </div>
    </footer>
);
