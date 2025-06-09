import { useEffect, useState, } from "react";
import { useNavigate } from "react-router-dom";
import "./Forms.css";
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
    <div className="page-content-wrapper">
      <div className="car-table-container"> {/* Reusing container for consistent styling */}
        <h2 className="table-heading">Setări Intervale ITP</h2> {/* Using table-heading for consistency */}
        <div className="settings-section">
          <h3>Autoturisme</h3>
          <label className="input-group">
            <input
              type="number"
              value={intervals.autoturism.under3}
              onChange={e =>
                setIntervals({
                  ...intervals,
                  autoturism: { ...intervals.autoturism, under3: parseFloat(e.target.value) }
                })}
              placeholder=" " // For floating label effect if you add CSS for it
            />
            <span className="label">Sub 3 ani (ani)</span>
          </label>
          <label className="input-group">
            <input
              type="number"
              value={intervals.autoturism.between3and12}
              onChange={e =>
                setIntervals({
                  ...intervals,
                  autoturism: { ...intervals.autoturism, between3and12: parseFloat(e.target.value) }
                })}
              placeholder=" "
            />
            <span className="label">3-12 ani (ani)</span>
          </label>
          <label className="input-group">
            <input
              type="number"
              value={intervals.autoturism.over12}
              onChange={e =>
                setIntervals({
                  ...intervals,
                  autoturism: { ...intervals.autoturism, over12: parseFloat(e.target.value) }
                })}
              placeholder=" "
            />
            <span className="label">Peste 12 ani (ani)</span>
          </label>
        </div>

        {/* You can add similar blocks for other car types here, following the same structure */}
        {/* For example:
        <div className="settings-section">
          <h3>Utilitare Ușoare</h3>
          <label className="input-group">
            <input
              type="number"
              value={intervals.utilitarUsor}
              onChange={e => setIntervals({...intervals, utilitarUsor: parseFloat(e.target.value)})}
              placeholder=" "
            />
            <span className="label">Interval (ani)</span>
          </label>
        </div>
        */}

        <div className="form-actions"> {/* Reusing form-actions for button grouping */}
          <button onClick={handleSave} className="add-btn">Salvează</button> {/* Reusing button styles */}
          <button type="button" onClick={() => navigate('/')} className="cancel-btn">Anulează</button> {/* Added a cancel-btn class */}
        </div>
      </div>
    </div>
  );
}