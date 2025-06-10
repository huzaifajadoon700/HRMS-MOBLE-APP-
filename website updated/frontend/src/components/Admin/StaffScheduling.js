import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Spinner, Alert, Button, Modal } from 'react-bootstrap';
import './StaffScheduling.css';

const StaffScheduling = () => {
  const [staff, setStaff] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [newStaff, setNewStaff] = useState({ name: '', position: '' });
  const [newShift, setNewShift] = useState({ staffId: '', date: '', time: '', duration: '' });
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    fetchStaff();
    fetchShifts();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:8080/api/staff');
      setStaff(response.data);
    } catch (error) {
      setError('Error fetching staff.');
    } finally {
      setLoading(false);
    }
  };

  const fetchShifts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:8080/api/shift');
      setShifts(response.data);
    } catch (error) {
      setError('Error fetching shifts.');
    } finally {
      setLoading(false);
    }
  };

  const addStaff = async () => {
    if (!newStaff.name || !newStaff.position) {
      setFeedback({ type: 'danger', message: 'Please fill in all fields for staff.' });
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:8080/api/staff/add', newStaff);
      setStaff([...staff, response.data]);
      setNewStaff({ name: '', position: '' });
      setFeedback({ type: 'success', message: 'Staff added successfully!' });
    } catch (error) {
      setError('Error adding staff.');
    } finally {
      setLoading(false);
    }
  };

  const addShift = async () => {
    if (!newShift.staffId || !newShift.date || !newShift.time || !newShift.duration) {
      setFeedback({ type: 'danger', message: 'Please fill in all fields for the shift.' });
      return;
    }
    try {
      const existingShift = shifts.find(shift => 
        shift.staffId === newShift.staffId && shift.date === newShift.date
      );
      if (existingShift) {
        setFeedback({ type: 'danger', message: 'A shift for this staff member on this date already exists.' });
        return;
      }
      const response = await axios.post('http://localhost:8080/api/shift/add', newShift);
      setShifts([...shifts, response.data]);
      setNewShift({ staffId: '', date: '', time: '', duration: '' });
      setFeedback({ type: 'success', message: 'Shift added successfully!' });
      setShowShiftModal(false);
    } catch (error) {
      setError('Error adding shift.');
    }
  };

  const toggleAttendance = async (id) => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.put(`http://localhost:8080/api/shift/${id}/toggle`);
      setShifts(shifts.map(shift => (shift._id === id ? response.data : shift)));
    } catch (error) {
      setError('Error toggling attendance.');
    } finally {
      setLoading(false);
    }
  };

  const deleteShift = async (id) => {
    if (window.confirm("Are you sure you want to delete this shift?")) {
      setLoading(true);
      setError('');
      try {
        await axios.delete(`http://localhost:8080/api/shift/${id}`);
        setShifts(shifts.filter(shift => shift._id !== id));
        setFeedback({ type: 'success', message: 'Shift deleted successfully!' });
      } catch (error) {
        setError('Error deleting shift.');
      } finally {
        setLoading(false);
      }
    }
  };

  const deleteStaff = async (id) => {
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      setLoading(true);
      setError('');
      try {
        await axios.delete(`http://localhost:8080/api/staff/${id}`);
        setStaff(staff.filter(s => s._id !== id));
        await fetchShifts();
        setFeedback({ type: 'success', message: 'Staff and associated shifts deleted successfully!' });
      } catch (error) {
        setError('Error deleting staff.');
      } finally {
        setLoading(false);
      }
    }
  };

  const updateStaff = async () => {
    if (!selectedStaff.name || !selectedStaff.position) {
      setFeedback({ type: 'danger', message: 'Please fill in all fields for staff.' });
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await axios.put(`http://localhost:8080/api/staff/${selectedStaff._id}`, selectedStaff);
      setStaff(staff.map(s => (s._id === selectedStaff._id ? response.data : s)));
      setShifts(shifts.map(shift => 
        shift.staffId._id === selectedStaff._id 
          ? { ...shift, staffId: { ...shift.staffId, name: response.data.name } } 
          : shift
      ));
      setFeedback({ type: 'success', message: 'Staff updated successfully!' });
      setShowEditModal(false);
    } catch (error) {
      setError('Error updating staff.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cosmic-container">
      {feedback && (
        <Alert variant={feedback.type} className="cosmic-alert mb-4">
          {feedback.message}
        </Alert>
      )}
      {error && (
        <Alert variant="danger" className="cosmic-alert mb-4">
          {error}
        </Alert>
      )}

      {/* Add Staff Form */}
      <div className="cosmic-form">
        <h2 className="cosmic-section-title">Add Staff</h2>
        <input
          type="text"
          placeholder="Name"
          value={newStaff.name}
          onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
          className="cosmic-input"
        />
        <input
          type="text"
          placeholder="Position"
          value={newStaff.position}
          onChange={(e) => setNewStaff({ ...newStaff, position: e.target.value })}
          className="cosmic-input"
        />
        <button className="cosmic-button" onClick={addStaff} disabled={loading}>
          {loading ? <Spinner animation="border" size="sm" /> : 'Add Staff'}
        </button>
      </div>

      {/* Staff List */}
      <h2 className="cosmic-section-title">Staff List</h2>
      <table className="cosmic-table">
        <thead>
          <tr>
            <th className="cosmic-th">Name</th>
            <th className="cosmic-th">Position</th>
            <th className="cosmic-th">Actions</th>
          </tr>
        </thead>
        <tbody>
          {staff.map((s) => (
            <tr key={s._id}>
              <td className="cosmic-td">{s.name}</td>
              <td className="cosmic-td">{s.position}</td>
              <td className="cosmic-td">
                <Button variant="warning" className="cosmic-button" onClick={() => { setSelectedStaff(s); setShowEditModal(true); }}>
                  Edit
                </Button>
                <Button variant="danger" className="cosmic-button ms-2" onClick={() => deleteStaff(s._id)}>
                  Delete
                </Button>
                <Button variant="info" className="cosmic-button ms-2" onClick={() => { setNewShift({ ...newShift, staffId: s._id }); setShowShiftModal(true); }}>
                  Add Shift
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Shift List */}
      <h2 className="cosmic-section-title">Shift List</h2>
      <table className="cosmic-table">
        <thead>
          <tr>
            <th className="cosmic-th">Staff</th>
            <th className="cosmic-th">Date</th>
            <th className="cosmic-th">Time</th>
            <th className="cosmic-th">Duration</th>
            <th className="cosmic-th">Attendance</th>
            <th className="cosmic-th">Actions</th>
          </tr>
        </thead>
        <tbody>
          {shifts.map((shift) => (
            <tr key={shift._id}>
              <td className="cosmic-td">{shift.staffId ? shift.staffId.name : 'N/A'}</td>
              <td className="cosmic-td">{shift.date}</td>
              <td className="cosmic-td">{shift.time}</td>
              <td className="cosmic-td">{shift.duration}</td>
              <td className="cosmic-td">{shift.attended ? 'Yes' : 'No'}</td>
              <td className="cosmic-td">
                <Button variant="secondary" className="cosmic-button" onClick={() => { setNewShift(shift); setShowShiftModal(true); }}>
                  Edit
                </Button>
                <Button variant="danger" className="cosmic-button ms-2" onClick={() => deleteShift(shift._id)}>
                  Delete
                </Button>
                <Button variant="success" className="cosmic-button ms-2" onClick={() => toggleAttendance(shift._id)}>
                  {shift.attended ? 'Mark Absent' : 'Mark Present'}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit Staff Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} className="cosmic-modal">
        <Modal.Header closeButton className="cosmic-modal-header">
          <Modal.Title>Edit Staff</Modal.Title>
        </Modal.Header>
        <Modal.Body className="cosmic-modal-body">
          <input
            type="text"
            placeholder="Name"
            value={selectedStaff?.name}
            onChange={(e) => setSelectedStaff({ ...selectedStaff, name: e.target.value })}
            className="cosmic-input mb-2"
          />
          <input
            type="text"
            placeholder="Position"
            value={selectedStaff?.position}
            onChange={(e) => setSelectedStaff({ ...selectedStaff, position: e.target.value })}
            className="cosmic-input mb-2"
          />
        </Modal.Body>
        <Modal.Footer className="cosmic-modal-footer">
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={updateStaff}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add/Edit Shift Modal */}
      <Modal show={showShiftModal} onHide={() => setShowShiftModal(false)} className="cosmic-modal">
        <Modal.Header closeButton className="cosmic-modal-header">
          <Modal.Title>{newShift._id ? 'Edit Shift' : 'Add Shift'}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="cosmic-modal-body">
          <select
            value={newShift.staffId}
            onChange={(e) => setNewShift({ ...newShift, staffId: e.target.value })}
            className="cosmic-input mb-2"
          >
            <option value="">Select Staff</option>
            {staff.map((s) => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
          <input
            type="date"
            placeholder="Date"
            value={newShift.date}
            onChange={(e) => setNewShift({ ...newShift, date: e.target.value })}
            className="cosmic-input mb-2"
          />
          <input
            type="time"
            placeholder="Time"
            value={newShift.time}
            onChange={(e) => setNewShift({ ...newShift, time: e.target.value })}
            className="cosmic-input mb-2"
          />
          <input
            type="text"
            placeholder="Duration"
            value={newShift.duration}
            onChange={(e) => setNewShift({ ...newShift, duration: e.target.value })}
            className="cosmic-input mb-2"
          />
        </Modal.Body>
        <Modal.Footer className="cosmic-modal-footer">
          <Button variant="secondary" onClick={() => setShowShiftModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={addShift}>
            Save Shift
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default StaffScheduling;
