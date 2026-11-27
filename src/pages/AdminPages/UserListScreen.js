import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge, Button, Container, Form, Modal, Spinner, Table } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import API from '../../api';

const emptyForm = { name: '', email: '', password: '', role: 'user' };

function UserListScreen() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const userInfo = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('userInfo') || 'null');
    } catch {
      return null;
    }
  }, []);
  const config = useMemo(() => ({
    headers: { Authorization: `Bearer ${userInfo?.token}` },
  }), [userInfo?.token]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/api/admin/users', config);
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, [config]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const openCreateForm = () => {
    setEditingUser(null);
    setForm({ ...emptyForm });
    setShowForm(true);
  };

  const openEditForm = (user) => {
    setEditingUser(user);
    setForm({ name: user.name, email: user.email, password: '', role: user.role });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingUser(null);
    setForm({ ...emptyForm });
  };

  const submitHandler = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = { name: form.name, email: form.email, role: form.role };
      if (form.password) payload.password = form.password;
      if (editingUser) {
        await API.put(`/api/admin/users/${editingUser._id}`, payload, config);
        toast.success('User updated.');
      } else {
        await API.post('/api/admin/users', payload, config);
        toast.success('User created.');
      }
      closeForm();
      await fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save user.');
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async (user) => {
    if (user._id === userInfo?._id) {
      toast.error('You cannot delete your own account.');
      return;
    }

    const result = await Swal.fire({
      title: 'Delete this user?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete user',
      confirmButtonColor: '#b42318',
    });
    if (!result.isConfirmed) return;

    try {
      await API.delete(`/api/admin/users/${user._id}`, config);
      setUsers((currentUsers) => currentUsers.filter((item) => item._id !== user._id));
      toast.success('User deleted.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user.');
    }
  };

  return (
    <Container className="py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <p className="eyebrow mb-1">STORE ACCESS</p>
          <h2 className="fw-bold mb-0">User Management</h2>
        </div>
        <Button variant="dark" className="rounded-pill px-4" onClick={openCreateForm}>
          Add user
        </Button>
      </div>

      {loading ? (
        <div className="text-center my-5"><Spinner animation="border" variant="dark" /></div>
      ) : (
        <Table striped bordered hover responsive className="align-middle">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length ? users.map((user) => (
              <tr key={user._id}>
                <td className="fw-semibold">
                  {user.name} {user._id === userInfo?._id && <Badge bg="secondary">You</Badge>}
                </td>
                <td>{user.email}</td>
                <td><Badge bg={user.role === 'admin' ? 'dark' : 'light'} text={user.role === 'admin' ? undefined : 'dark'}>{user.role}</Badge></td>
                <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</td>
                <td className="text-end text-nowrap">
                  <Button variant="outline-primary" size="sm" className="me-2" onClick={() => openEditForm(user)}>
                    Edit
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    disabled={user._id === userInfo?._id}
                    onClick={() => deleteUser(user)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="5" className="text-center text-muted py-4">No users found.</td></tr>
            )}
          </tbody>
        </Table>
      )}

      <Modal show={showForm} onHide={closeForm} centered>
        <Form onSubmit={submitHandler}>
          <Modal.Header closeButton>
            <Modal.Title>{editingUser ? 'Edit user' : 'Add user'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="admin-user-name">
              <Form.Label>Name</Form.Label>
              <Form.Control
                required
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="admin-user-email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                required
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="admin-user-role">
              <Form.Label>Role</Form.Label>
              <Form.Select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
                <option value="user">Customer</option>
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
              </Form.Select>
            </Form.Group>
            <Form.Group controlId="admin-user-password">
              <Form.Label>{editingUser ? 'New password (optional)' : 'Password'}</Form.Label>
              <Form.Control
                type="password"
                minLength={6}
                required={!editingUser}
                autoComplete="new-password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
              />
              {editingUser && <Form.Text>Leave blank to keep the current password.</Form.Text>}
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" onClick={closeForm} disabled={saving}>Cancel</Button>
            <Button type="submit" variant="dark" disabled={saving}>
              {saving ? 'Saving…' : editingUser ? 'Save changes' : 'Create user'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

export default UserListScreen;
