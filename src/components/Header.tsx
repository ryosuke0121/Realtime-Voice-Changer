import React from 'react';
import { UI_COLORS } from '../config/constants';

export const Header: React.FC = () => (
    <header className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-2" style={{ color: UI_COLORS.text }}>
            Realtime Voice Changer
        </h1>
    </header>
);
