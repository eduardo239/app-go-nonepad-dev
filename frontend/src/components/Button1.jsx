import './Button1.css';

export default function Button1({ onClick }) {
  return (
    <button className="button-30" role="button" onClick={onClick}>
      New File +
    </button>
  );
}
