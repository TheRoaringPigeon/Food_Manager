import './scrollBox.css';

function ScrollBox({ children, className = "" }) {
  return (
    <div className={`scroll-box ${className}`}>
      {children}
    </div>
  );
}

export default ScrollBox;