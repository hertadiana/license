import { useEffect, useState, } from "react";
import { useNavigate } from "react-router-dom";
export default function Settings() {
  const defaultIntervals = {
    autoturism: { under3: 3, between3and12: 2, over12: 1 },
    utilitarUsor: 1,
    utilitarGreu: 0.5,
    transportPersoane: 0.5,
    motociclete: 2,
    remorcaUsoara: 2,
    remorcaGrea: 1,
    taxi: 1
  };

  const [intervals, setIntervals] = useState(defaultIntervals);
  const navigate = useNavigate();

  // Load saved settings on first render
  useEffect(() => {
    const saved = localStorage.getItem("intervalSettings");
    if (saved) {
      try {
        const parsedSettings = JSON.parse(saved);
        setIntervals(parsedSettings);
      } catch (e) {
        console.error("Failed to parse saved settings:", e);
        alert("Error loading settings. Defaults will be used.");
      }
    }
  }, []);
  
  const handleSave = () => {
    localStorage.setItem("intervalSettings", JSON.stringify(intervals));
    alert("Settings saved!");
  };

  return (
    <div>
      <h2>Setări Intervale ITP</h2>
      <div>
        <h3>Autoturisme</h3>
        <label>Sub 3 ani: 
          <input type="number" value={intervals.autoturism.under3} onChange={e =>
            setIntervals({...intervals, autoturism: {...intervals.autoturism, under3: parseFloat(e.target.value)}})} />
        </label>
        <label>3-12 ani: 
          <input type="number" value={intervals.autoturism.between3and12} onChange={e =>
            setIntervals({...intervals, autoturism: {...intervals.autoturism, between3and12: parseFloat(e.target.value)}})} />
        </label>
        <label>Peste 12 ani: 
          <input type="number" value={intervals.autoturism.over12} onChange={e =>
            setIntervals({...intervals, autoturism: {...intervals.autoturism, over12: parseFloat(e.target.value)}})} />
        </label>
      </div>

      {/* Add similar blocks for other types if you want them editable */}

      <button onClick={handleSave}>Salvează</button>
      <button type="button" onClick={() => navigate('/')}>Cancel</button>

    </div>
  );
}
