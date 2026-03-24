export default function BottomNav({ navItems, currentPath, onNavigate }) {
  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-inner">
        {navItems.map(item => (
          <button
            key={item.path}
            className={`bottom-nav-item ${currentPath === item.path ? 'active' : ''}`}
            onClick={() => onNavigate(item.path)}
          >
            {item.badge > 0 && (
              <span className="bottom-nav-badge">{item.badge}</span>
            )}
            <span className="bottom-nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}