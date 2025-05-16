// src/App.tsx
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import CarTable from './components/CarTable';
import EditForm from './components/Forms/EditForm';
import Settings from './components/Forms/Settings';
import SMSForm from './components/Forms/SMSForms';
function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<CarTable />} />
        <Route path="/edit/:id" element={<EditForm />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/sms" element={<SMSForm />} /> 
      </Routes>
    </Router>
  );
}

export default App;
