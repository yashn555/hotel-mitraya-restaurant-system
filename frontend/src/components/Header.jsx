import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
    FaStore, 
    FaUserCog, 
    FaBars, 
    FaTimes,
    FaFire
} from 'react-icons/fa';
import logo from '../assets/logo.png';

const Header = () => {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [currentDateTime, setCurrentDateTime] = useState(new Date());

    // Update date and time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const navItems = [
        { path: '/', name: 'Counter', icon: FaStore, color: 'hover:bg-green-600' },
        { path: '/kitchen', name: 'Kitchen', icon: FaFire, color: 'hover:bg-orange-600' },
        { path: '/admin', name: 'Admin', icon: FaUserCog, color: 'hover:bg-purple-600' },
    ];

    const isActive = (path) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };

    // Format date and time
    const formattedDate = currentDateTime.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const formattedTime = currentDateTime.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    return (
        <nav className="bg-gradient-to-r from-blue-900 to-blue-700 text-white shadow-xl sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center py-3">
                    {/* Logo and Hotel Name */}
                    <Link to="/" className="flex items-center space-x-3 group">
                        <div className="relative">
                            {/* Actual Logo Image */}
                            <img 
                                src={logo} 
                                alt="Hotel Mitraya" 
                                className="w-12 h-12 rounded-full object-cover shadow-lg group-hover:scale-110 transition-transform duration-300"
                                onError={(e) => {
                                    // Fallback if logo fails to load
                                    e.target.onerror = null;
                                    e.target.src = 'https://via.placeholder.com/48x48?text=HM';
                                }}
                            />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Hotel Mitraya</h1>
                        </div>
                    </Link>

                    {/* Date and Time Display */}
                    <div className="hidden md:block text-right">
                        <div className="text-sm font-medium text-blue-100">
                            {formattedDate}
                        </div>
                        <div className="text-xl font-bold tracking-wide">
                            {formattedTime}
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.path);
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                                        active
                                            ? 'bg-white text-blue-700 shadow-md'
                                            : `${item.color} text-white hover:shadow-md`
                                    }`}
                                >
                                    <Icon className="text-lg" />
                                    <span className="font-medium">{item.name}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors"
                    >
                        {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                    </button>
                </div>

                {/* Mobile Navigation Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-blue-600">
                        {/* Mobile Date and Time */}
                        <div className="px-4 py-2 mb-3 bg-blue-800 rounded-lg">
                            <div className="text-sm text-blue-200">{formattedDate}</div>
                            <div className="text-lg font-bold">{formattedTime}</div>
                        </div>
                        
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.path);
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`block px-4 py-3 rounded-lg mb-2 transition-all duration-200 flex items-center space-x-3 ${
                                        active
                                            ? 'bg-white text-blue-700'
                                            : 'hover:bg-white hover:bg-opacity-20'
                                    }`}
                                >
                                    <Icon className="text-xl" />
                                    <span className="font-medium">{item.name}</span>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Animated Border */}
            <div className="h-1 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600"></div>
        </nav>
    );
};

export default Header;